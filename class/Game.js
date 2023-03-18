import RecursiveProxy from "./RecursiveProxy.js";
import EventEmitter from "./EventEmitter.js";
import Main from "./scenes/Main.js";
import Mouse from "./handler/Mouse.js";
import Vector from "./Vector.js";

export default class extends EventEmitter {
	#privateWritable = null;
	#read = '';
	#reader = new FileReader();
	#readMultiple = false;
	#restorePrompt = true;
	#writable = null;
	accentColor = '#000000' // for themes
	lastFrame = null;
	lastTime = performance.now();
	progress = 0;
	ups = 25;
	settings = new RecursiveProxy(Object.assign({
		ap: false,
		theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	}, JSON.parse(localStorage.getItem('bhr-settings'))), {
		set: (...args) => {
			Reflect.set(...args);
			localStorage.setItem('bhr-settings', JSON.stringify(this.settings));
			this.emit('settingsChange', this.settings);
			return true;
		},
		deleteProperty() {
			Reflect.deleteProperty(...arguments);
			localStorage.setItem('bhr-settings', JSON.stringify(this));
			return true;
		}
	});
	storage = null;

	get max() {
		return 1000 / this.ups;
	}

	constructor(canvas) {
		super();
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.container = canvas.parentElement;
		this.#reader.addEventListener('load', event => {
			this.#read += event.target.result;
			if (!this.#readMultiple) {
				if (this.#restorePrompt) {
					this.#restorePrompt = false;
					if (this.#read && this.#read !== '-18 1i 18 1i###BMX' && !confirm("Would you like to restore the track you were previously working on?")) {
						return;
					}
				}

				this.init(this.#read);
				this.#read = '';
			}
		});

		this.mouse = new Mouse(canvas);
		this.mouse.on('down', this.press.bind(this));
		this.mouse.on('move', this.stroke.bind(this));
		this.mouse.on('up', this.clip.bind(this));
		this.mouse.on('wheel', this.scroll.bind(this));

		document.addEventListener('fullscreenchange', () => navigator.keyboard.lock(['Escape']));
		document.addEventListener('keydown', this.keydown.bind(this));
		document.addEventListener('keyup', this.keyup.bind(this));
		document.addEventListener('pointerlockchange', () => {
			if (!document.pointerLockElement) {
				const checkbox = this.container.querySelector('.bhr-game-overlay > input');
				this.scene.paused = checkbox !== null && (checkbox.checked = !checkbox.checked);
			}
		});

		// window.addEventListener('beforeunload', this.close.bind(this));
		window.addEventListener('resize', this.adjust.bind(canvas));
		window.dispatchEvent(new Event('resize'));
		window.onbeforeunload = this.close.bind(this);

		// this.on('settingsChange', (settings) => {
		// 	console.log(settings)
		// });

		const theme = document.querySelector('link#theme');
		if (theme !== null && this.settings.theme != 'dark') {
			theme.setAttribute('href', `styles/${this.settings.theme}.css`);
		}

		this.on('storageReady', async () => {
			const tracks = await this.storage.getDirectoryHandle('tracks', { create: true });
			const fileHandle = await tracks.getFileHandle('savedState', { create: true });
			const fileData = await fileHandle.getFile();
			this.#privateWritable = await fileHandle.createWritable({ keepExistingData: false });
			this.#reader.readAsText(fileData);
		});

		navigator.storage.getDirectory().then(root => {
			this.storage = root;
			this.emit('storageReady');
		}).catch(err => {
			console.warn('Storage:', err);
		});
	}

	adjust() {
		const style = getComputedStyle(this);
		this.setAttribute('height', parseFloat(style.height) * window.devicePixelRatio);
		this.setAttribute('width', parseFloat(style.width) * window.devicePixelRatio);
	}

	init(trackCode, { id = null, vehicle = 'BMX' } = {}) {
		if (!trackCode) {
			return;
		} else if (!/^bmx|mtb$/i.test(vehicle)) {
			throw new TypeError("Invalid vehicle type.");
		}

		if (this.lastFrame) {
			cancelAnimationFrame(this.lastFrame);
		}

		this.scene = new Main(this, {
			code: trackCode,
			id
		});

		this.scene.init(vehicle);
		this.lastFrame = requestAnimationFrame(this.render.bind(this));
	}

	render(time) {
		this.lastFrame = requestAnimationFrame(this.render.bind(this));
		this.delta = time - this.lastTime;
		// this.delta = Math.min(time - this.lastTime, this.max);
		if (this.delta < this.max) {
			// this.scene.update();
			this.scene.render(this.ctx);
			return;
		}

		this.scene.update(this.delta / this.max);
		this.scene.render(this.ctx);
		this.lastTime = time;
	}

	press(event) {
		this.scene.cameraLock = true;
		this.scene.cameraFocus = false;
		if (event.shiftKey || this.scene.processing) {
			return;
		}

		if (event.ctrlKey && this.scene.toolHandler.selected != 'select') {
			this.scene.toolHandler.setTool('select');
		} else if (!event.ctrlKey && this.scene.toolHandler.selected == 'select') {
			this.scene.toolHandler.setTool(this.scene.toolHandler.old);
		}

		if (!['camera', 'eraser', 'select'].includes(this.scene.toolHandler.selected)) {
			this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
			this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
		}

		this.scene.toolHandler.press(event);
	}

	stroke(event) {
		if (this.scene.toolHandler.selected != 'camera') {
			this.scene.cameraFocus = false;
		}

		if (this.scene.processing) {
			return;
		} else if (event.shiftKey) {
			this.scene.toolHandler.cache.get('camera').stroke(event);
			return;
		}

		if (!['camera', 'eraser', 'select'].includes(this.scene.toolHandler.selected)) {
			this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
			this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
		}

		this.scene.toolHandler.stroke(event);
	}

	clip(event) {
		this.scene.cameraLock = false;
		if (this.scene.processing) {
			return;
		}

		if (!['camera', 'eraser', 'select'].includes(this.scene.toolHandler.selected)) {
			this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
			this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
		}

		this.scene.toolHandler.clip(event);
	}

	keydown(event) {
		event.preventDefault();
		switch (event.key.toLowerCase()) {
			case 'backspace':
				if (event.shiftKey) {
					this.scene.restoreCheckpoint();
					break;
				}

				this.scene.removeCheckpoint();
				break;

			case 'enter':
				if (event.shiftKey) {
					this.scene.restoreCheckpoint();
					break;
				}

				this.scene.gotoCheckpoint();
				break;

			case 'tab':
				if (!this.scene.cameraFocus) {
					this.scene.cameraFocus = this.scene.firstPlayer.vehicle.head;
					break;
				}

				let index = this.scene.players.indexOf(this.scene.cameraFocus.parent.parent) + 1;
				if (this.scene.players.length <= index) {
					index = 0;
				}

				this.scene.cameraFocus = this.scene.players[index].vehicle.head;
				break;

			case '-':
				this.scene.zoomOut();
				break;

			case '+':
			case '=':
				this.scene.zoomIn();
				break;

			case 'p':
			case ' ':
				this.scene.paused = !this.scene.paused;
				this.container.querySelector('.playpause > input').checked = !this.scene.paused;
				break;
		}

		if (this.scene.editor) {
			switch (event.key.toLowerCase()) {
				case 'delete':
					if (this.scene.toolHandler.selected != 'select' || this.scene.toolHandler.currentTool.selected.length < 1) {
						break;
					}

					this.scene.toolHandler.currentTool.deleteSelected();
					break;

				// store arrays of hotkeys in each tool, then compare
				// let tools = Object.fromEntries(this.scene.toolHandler.cache.entries());
				// for (const key in tools) {
				// 	if (tools[key].shortcuts.has(event.key.toLowerCase())) {
				// 		this.scene.toolHandler.setTool(key, '?');
				// 		break;
				// 	}
				// 	console.log(key, tools[key])
				// }
				// break;
				case 'a':
					this.scene.toolHandler.setTool('brush', false);
					break;
				case 'o':
					if (event.ctrlKey) {
						if (event.shiftKey) {
							this.loadFile({
								multiple: true
							});
							break;
						}

						this.loadFile();
					}
					break;
				case 's':
					if (event.ctrlKey) {
						if (event.shiftKey) {
							this.saveAs();
							break;
						}

						// if file is open
						// this.#openFile
						console.log(this.#writable)
						// this.saveAs();
						break;
					}

					this.scene.toolHandler.setTool('brush', true);
					break;
				case 'q':
					this.scene.toolHandler.setTool('line', false);
					break;
				case 'w':
					this.scene.toolHandler.setTool('line', true);
					break;
				case 'e':
					this.scene.toolHandler.setTool('eraser');
					break;
				case 'r':
					this.scene.toolHandler.setTool(this.scene.toolHandler.selected != 'camera' ? 'camera' : this.scene.toolHandler.old);
					break;
				case 'z':
					event.ctrlKey && this.scene.history[(event.shiftKey ? 're' : 'un') + 'do']();
					break;
			}
		}
	}

	keyup(event) {
		event.preventDefault();
		switch (event.key.toLowerCase()) {
			case 'b':
				if (event.ctrlKey) {
					this.scene.switchBike();
				}
				break;

			case 'g':
				this.scene.players.length <= 1 && (this.scene.grid.size = 11 - this.scene.grid.size);
				break;

			case 'f':
			case 'f11':
				document.fullscreenElement ? document.exitFullscreen() : this.container.requestFullscreen();
				break;

			case 'escape':
				const checkbox = this.container.querySelector('.bhr-game-overlay > input');
				this.scene.paused = checkbox !== null && (checkbox.checked = !checkbox.checked);
				break;
		}
	}

	scroll(event) {
		if (event.ctrlKey) {
			this.scene.toolHandler.scroll(event);
		} else {
			if (0 < event.detail || event.wheelDelta < 0) {
				this.scene.zoomOut()
			} else if (0 > event.detail || event.wheelDelta > 0) {
				this.scene.zoomIn()
			}
		}

		let y = new Vector(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop + window.pageYOffset).toCanvas(this.canvas);
		this.scene.cameraFocus || this.scene.camera.add(this.mouse.position.difference(y));
	}

	load(code = null) {
		if (code === null) {
			this.loadFile();
			return;
		}

		code && this.init(code);
	}

	async loadFile(options = {}) {
		this.#readMultiple = Boolean(options.multiple);
		if ('fileHandles' in options || 'showOpenFilePicker' in window) {
			// store files in private local storage:
			// const root = await navigator.storage.getDirectory();
			// const fileHandle = await root.getFileHandle('Untitled.txt', { create: true });
			const fileHandles = options.fileHandles || await window.showOpenFilePicker(Object.assign({
				multiple: false, // allow multiple & merge tracks?
				types: [{
					description: 'BHR File',
					accept: { 'text/plain': ['.txt'] }
				}]
			}, arguments[0])).catch(() => []);
			for (const fileHandle of fileHandles) {
				const fileData = await fileHandle.getFile();
				this.#reader.readAsText(fileData);
				// auto-save opened file:
				// if (fileHandles.length < 2) {
				// 	this.#writable = await fileHandle.createWritable();
				// }
			}

			this.#readMultiple = false;
			return true;
		}

		const picker = document.createElement('input');
		picker.setAttribute('accept', 'text/plain');
		picker.setAttribute('type', 'file');
		picker.toggleAttribute('multiple', options.multiple);
		picker.addEventListener('change', function() {
			for (const file of this.files) {
				this.#reader.readAsText(file);
			}

			this.#readMultiple = false;
		});
		picker.click();
	}

	async saveAs() {
		// if ('showSaveFilePicker' in window) {
		// 	const fileHandle = await window.showSaveFilePicker({
		// 		suggestedName: 'bhr_track_' + new Date(new Date().setHours(new Date().getHours() - new Date().getTimezoneOffset() / 60)).toISOString().split(/t/i).join('_').replace(/\..+/, '').replace(/:/g, '-'),
		// 		types: [{
		// 			description: 'BHR File',
		// 			accept: { 'text/plain': ['.txt'] }
		// 		}]
		// 	}).catch(() => null);
		// 	if (fileHandle !== null && verifyPermission(fileHandle, true)) {
		// 		const writable = await fileHandle.createWritable();
		// 		await writable.write(this.scene.toString());
		// 		await writable.close();
		// 		return true;
		// 	}
		// }

		const date = new Date();
		const link = document.createElement('a');
		link.setAttribute('download', 'bhr_track_' + new Date(date.setHours(date.getHours() - date.getTimezoneOffset() / 60)).toISOString().split(/t/i).join('_').replace(/\..+/, '').replace(/:/g, '-'));
		link.setAttribute('href', URL.createObjectURL(new Blob([this.scene.toString()], { type: 'text/plain' })));
		link.click();
		return true;
	}

	reset() {
		if (confirm("Do you really want to start a new track?")) {
			this.init("-18 1i 18 1i###BMX");
		}
	}

	async close() {
		cancelAnimationFrame(this.lastFrame);
		await this.#privateWritable.write(this.scene.toString()).then(() => {
			return this.#privateWritable.close();
		});

		this.mouse.close();
		this.scene = null;
		window.onbeforeunload = null;
		window.removeEventListener('resize', this.adjust);
		window.close();
	}
}

async function verifyPermission(fileHandle, withWrite) {
	const opts = {};
	if (withWrite) {
		opts.mode = "readwrite";
	}

	// Check if we already have permission, if so, return true.
	if ((await fileHandle.queryPermission(opts)) === "granted") {
		return true;
	}

	// Request permission to the file, if the user grants permission, return true.
	if ((await fileHandle.requestPermission(opts)) === "granted") {
		return true;
	}

	// The user did not grant permission, return false.
	return false;
}