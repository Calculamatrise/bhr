import RecursiveProxy from "./RecursiveProxy.js";
import EventEmitter from "./EventEmitter.js";
import Scene from "./scenes/Scene.js";
import Mouse from "./handler/Mouse.js";
import Coordinates from "./Coordinates.js";
import TrackStorage from "./TrackStorage.js";

const DEFAULTS = {
	autoPause: false,
	autoSave: false,
	autoSaveInterval: 5,
	brightness: 100,
	interpolation: false,
	restorePreviousSession: false,
	theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const defaultsFilter = (key, value) => (typeof value == 'object' || DEFAULTS.hasOwnProperty(key)) ? value : void 0;

export default class extends EventEmitter {
	#matchMediaChangeListener = null;
	#openFile = null;
	accentColor = '#000000'; // for themes
	debug = false;
	lastFrame = null;
	lastTime = performance.now();
	progress = 0;
	ups = 25; // 50;
	mouse = new Mouse();
	scene = new Scene(this);
	settings = new RecursiveProxy(Object.assign(DEFAULTS, JSON.parse(localStorage.getItem('bhr-settings'), defaultsFilter)), {
		set: (...args) => {
			Reflect.set(...args);
			localStorage.setItem('bhr-settings', JSON.stringify(this.settings, defaultsFilter));
			this.emit('settingsChange', this.settings);
			return true;
		},
		deleteProperty() {
			Reflect.deleteProperty(...arguments);
			localStorage.setItem('bhr-settings', JSON.stringify(this, defaultsFilter));
			return true;
		}
	});
	trackStorage = new TrackStorage();
	constructor(canvas) {
		super();

		this.setCanvas(canvas);
		this.mouse.on('down', this.press.bind(this));
		this.mouse.on('move', this.stroke.bind(this));
		this.mouse.on('up', this.clip.bind(this));
		this.mouse.on('wheel', this.scroll.bind(this));

		this.on('settingsChange', settings => {
			for (const setting in settings) {
				let value = settings[setting];
				switch (setting) {
				case 'brightness':
					this.canvas.style[(value === 100 ? 'remove' : 'set') + 'Property']('filter', 'brightness(' + value + '%)');
					break;
				case 'interpolation':
					this.ups = value ? 50 : 25;
					break;
				case 'restorePreviousSession':
					// restore session..
					value && console.warn('Failed to restore session.');
					break;
				case 'theme':
					let preferredMedia = window.matchMedia('(prefers-color-scheme: dark)');
					if ('system' === value) {
						value = preferredMedia.matches ? 'dark' : 'light';
						this.#matchMediaChangeListener ||= preferredMedia.addEventListener('change', ({ matches }) => {
							this.emit('settingsChange', this.settings);
							this.emit('themePreferenceChange', matches ? 'dark' : 'light');
						}, { passive: true });
					} else if (null !== this.#matchMediaChangeListener) {
						preferredMedia.removeEventListener('change', this.#matchMediaChangeListener);
					}
					this.physicsLineColor = '#'.padEnd(7, value == 'dark' ? 'fb' : value == 'midnight' ? 'c' : '0');
					this.sceneryLineColor = '#'.padEnd(7, /^(dark|midnight)$/i.test(value) ? '6' : 'a');
					this.ctx.fillStyle = this.physicsLineColor;
					this.ctx.strokeStyle = this.physicsLineColor;
					this.scene.grid.sectors.forEach(sector => sector.resize())
				}
			}
		});
		// this.emit('settingsChange', this.settings);
		this.trackStorage.on('open', async () => {
			if (!this.settings.autoSave) return;
			await this.trackStorage.open('savedState', { cache: true });
			if (this.settings.autoSaveInterval > 0) {
				const date = new Intl.DateTimeFormat(navigator.language, { dateStyle: 'short', timeStyle: 'medium' }).format().replace(/[/\\?%*:|"<>]/g, '-').replace(/,+\s*/, '_').replace(/\s+.*$/, '');
				this.trackStorage.open(date, { overwrite: false });
				setInterval(() => {
					this.trackStorage.write(date, this.scene.track.toString(), { saveAndReplace: true });
				}, this.settings.autoSaveInterval * 1e3);
			}

			// Only show toast if the game wasn't closed properly!
			// if ('toasts' in window) {
			// 	const toast = Object.assign(document.createElement('div'), {
			// 		className: 'toast',
			// 		innerText: 'Would you like to restore the track you were last working on? '
			// 	});
			// 	toast.append(Object.assign(document.createElement('button'), {
			// 		innerText: 'Yes',
			// 		onclick: () => {
			// 			toast.remove();
			// 			fileData.text().then(code => {
			// 				this.init();
			// 				this.scene.track.write(code);
			// 			});
			// 			// fileHandle.createWritable()
			// 		}
			// 	}), Object.assign(document.createElement('button'), {
			// 		innerText: 'No',
			// 		onclick: () => toast.remove()
			// 	}));
			// 	this.constructor.serveToast(toast);
			// }
		});
		this._listen();
		Object.defineProperty(this, 'debug', { enumerable: false })
	}

	get max() {
		return 1000 / this.ups;
	}

	_listen() {
		Object.defineProperties(this, {
			_onfullscreenchange: { value: () => navigator.keyboard[(null === document.fullscreenElement ? 'un' : '') + 'lock'](['Escape']), writable: true },
			_onkeydown: { value: this.keydown.bind(this), writable: true },
			_onkeyup: { value: this.keyup.bind(this), writable: true },
			_onpaste: { value: event => {
				const text = event.clipboardData.getData('text');
				if (!/^([\w\s,-]*#){2}[\w\s,-]*(#\w*)?$/.test(text)) return;
				event.preventDefault();
				console.log(text)
			}, writable: true }
		});
		document.addEventListener('fullscreenchange', this._onfullscreenchange, { passive: true });
		document.addEventListener('keydown', this._onkeydown);
		document.addEventListener('keyup', this._onkeyup);
		document.addEventListener('paste', this._onpaste);
		Object.defineProperties(this, {
			_closebound: { value: this.close.bind(this), writable: true },
			_onbeforeunload: { value: (async event => {
				event.preventDefault();
				event.returnValue = false;
				if (this.trackStorage.writables.has('savedState')) {
					const writable = this.trackStorage.writables.get('savedState');
					// const writer = await writable.getWriter();
					// console.log(writable)
					await writable.write(this.scene.track.toString());
					await writable.close();
				}
			}).bind(this), writable: true },
			_ononline: { value: (() => {
				const TEMP_KEY = 'bhr-temp';
				let data = JSON.parse(localStorage.getItem(TEMP_KEY));
				if (data && data.hasOwnProperty('savedGhosts')) {
					if (data.savedGhosts.length > 0) {
						for (const record of data.savedGhosts) {
							this.emit('trackComplete', record);
						}
	
						delete data.savedGhosts;
					}
	
					localStorage.setItem(TEMP_KEY, JSON.stringify(data));
				}
	
				this.emit('settingsChange', this.settings);
			}).bind(this), writable: true },
			_onresize: { value: this.setCanvasSize.bind(this), writable: true }
		});
		window.navigation && navigation.addEventListener('navigate', this._closebound, { passive: true });
		window.addEventListener('beforeunload', this._onbeforeunload);
		window.addEventListener('load', () => window.dispatchEvent(new Event('online')), { once: true, passive: true });
		window.addEventListener('online', this._ononline, { passive: true });
		// new ResizeObserver(this.setCanvasSize.bind(this)).observe(this.canvas);
		window.addEventListener('resize', this._onresize, { passive: true });
		window.addEventListener('unload', this._closebound, { once: true, passive: true });
	}

	_unlisten() {
		document.removeEventListener('fullscreenchange', this._onfullscreenchange);
		document.removeEventListener('keydown', this._onkeydown);
		document.removeEventListener('keyup', this._onkeyup);
		document.removeEventListener('paste', this._onpaste);
		window.navigation && navigation.removeEventListener('navigate', this._closebound);
		window.removeEventListener('beforeunload', this._onbeforeunload);
		window.removeEventListener('online', this._ononline);
		window.removeEventListener('resize', this._onresize);
	}

	init(options = {}) {
		this.lastFrame && cancelAnimationFrame(this.lastFrame);
		options = Object.assign({}, arguments[0]);
		this.#openFile = null;
		this.scene.init(options);
		options.default && this.scene.track.write('-18 1i 18 1i###BMX');
		options.code && this.scene.track.write(options.code);
		this.lastFrame = requestAnimationFrame(this.render.bind(this));
	}

	// ups = 50;
	render(time) {
		this.lastFrame = requestAnimationFrame(this.render.bind(this));
		let delta = time - this.lastTime;
		if (this.ups > 25) {
			if (delta > 1000) {
				delta = this.max;
			}

			this.progress += delta / this.max;
			this.lastTime = time;

			while (this.progress >= 1) {
				this.scene.fixedUpdate();
				this.updates++;
				this.progress--;
			}

			this.scene.update(this.progress, delta);
			// correct wheel position so they don't sink into lines
			// this.scene.lateUpdate();
		} else {
			if (delta >= this.max) {
				this.scene.nativeUpdate(delta);
				this.lastTime = time;
			}

			// this.scene.update(delta);
		}

		this.scene.render(this.ctx);
	}

	toggleFullscreen() {
		return document.fullscreenElement ? document.exitFullscreen() : this.container.requestFullscreen()
	}

	createRecorder() {
		const lastArgument = arguments[arguments.length - 1];
		this.mediaRecorder = new MediaRecorder(this.canvas.captureStream(50));
		this.mediaRecorder.addEventListener('dataavailable', ({ data }) => {
			const objectURL = URL.createObjectURL(data);
			typeof lastArgument == 'function' && lastArgument(objectURL);
			this.emit('recorderStop', objectURL);
		}, { passive: true });
		this.mediaRecorder.addEventListener('start', event => {
			this.emit('recorderStart', event);
		}, { passive: true })
		return this.mediaRecorder;
	}

	setCanvas(canvas) {
		this.canvas = canvas;
		// experiment
		// const offscreen = this.canvas.transferControlToOffscreen();
		// this.scene.grid.postMessage({ canvas: offscreen }, [offscreen]);
		this.ctx = this.canvas.getContext('2d');
		this.container = canvas.parentElement;
		this.setCanvasSize();
		this.mouse.setTarget(canvas)
	}

	// create a separate overlaying canvas for scenery lines with a transparent background
	setCanvasSize() {
		const computedStyle = getComputedStyle(this.canvas);
		this.canvas.setAttribute('height', parseFloat(computedStyle.height) * window.devicePixelRatio);
		this.canvas.setAttribute('width', parseFloat(computedStyle.width) * window.devicePixelRatio);
		this.ctx.fillStyle = '#'.padEnd(7, this.settings.theme == 'dark' ? 'fb' : this.settings.theme == 'midnight' ? 'c' : '0');
		this.ctx.lineWidth = Math.max(2 * this.scene.camera.zoom, 0.5);
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
		this.ctx.strokeStyle = this.ctx.fillStyle;
		// this.ctx.font = '20px Arial';
		// this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		// if shrinking sectors via drawImage:
		this.ctx.imageSmoothingEnabled = !1,
		this.ctx.mozImageSmoothingEnabled = !1,
		this.ctx.oImageSmoothingEnabled = !1,
		this.ctx.webkitImageSmoothingEnabled = !1;
		// this.ctx.scale(-1, 1) // for 'left-hand' mode
	}

	async showRecentFiles() {
		if ('loadrecenttracks' in window && this.trackStorage.readyState === 1) {
			loadrecenttracks.showModal();
			if ('recenttracks' in window) {
				const results = [];
				for (const [fileName, fileHandle] of this.trackStorage.cache) {
					const fileData = await fileHandle.getFile();
					const wrapper = document.createElement('div');
					wrapper.style = 'display: flex;gap: 0.25rem;width: -webkit-fill-available;';
					const button = wrapper.appendChild(document.createElement('button'));
					button.addEventListener('click', async () => {
						this.init({ code: await fileData.text() });
					}, { passive: true });
					button.innerText = fileName;
					button.style = 'width: -webkit-fill-available;';
					const remove = wrapper.appendChild(document.createElement('button'));
					remove.addEventListener('click', () => {
						this.trackStorage.cache.delete(fileHandle.name);
						this.trackStorage.writables.delete(fileHandle.name);
						fileHandle.remove();
						wrapper.remove();
					}, { passive: true });
					remove.innerText = '🗑'; // 🗙
					remove.style = 'background-color: hsl(0 40% 40% / calc(50% + 10% * var(--brightness-multiplier)));';
					results.push(wrapper);
				}

				recenttracks.replaceChildren(...results)
			}
		}
	}

	press(event) {
		if (this.scene.processing) return;
		this.scene.camera.lock = !event.shiftKey;
		this.scene.camera.focusPoint = null;
		if (event.shiftKey) return;
		else if (event.ctrlKey) {
			this.scene.toolHandler.selected != 'select' && this.scene.toolHandler.setTool('select');
		} else if (this.scene.toolHandler.selected == 'select') {
			this.scene.toolHandler.setTool(this.scene.toolHandler.old);
		}

		if (!/^(camera|eraser|select)$/i.test(this.scene.toolHandler.selected)) {
			this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
			this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
		}

		this.scene.toolHandler._handleEvent(event);
	}

	stroke(event) {
		if (this.scene.processing) return;
		this.scene.toolHandler.selected != 'camera' && (this.scene.camera.focusPoint = null);
		if (event.shiftKey && this.mouse.down) {
			this.scene.toolHandler.cache.get('camera').stroke(event);
			return;
		}

		if (!/^(camera|eraser|select)$/i.test(this.scene.toolHandler.selected)) {
			this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
			this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
		}

		this.scene.toolHandler._handleEvent(event);
	}

	clip(event) {
		if (this.scene.processing) return;
		this.scene.camera.lock = false;
		if (!/^(camera|eraser|select)$/i.test(this.scene.toolHandler.selected)) {
			this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
			this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
		}

		event.shiftKey || this.scene.toolHandler._handleEvent(event);
	}

	async keydown(event) {
		// event.preventDefault();
		switch (event.key.toLowerCase()) {
		case 'arrowleft': {
			const focusedPlayerGhost = this.scene.ghosts.find(playerGhost => playerGhost.hitbox == this.scene.camera.focusPoint);
			if (focusedPlayerGhost) {
				this.scene.paused = true;
				focusedPlayerGhost.playbackTicks = Math.max(0, focusedPlayerGhost.playbackTicks - 5);
				focusedPlayerGhost.playbackIterator.next(focusedPlayerGhost.playbackTicks);
			}
			break;
		}
		case 'arrowright': {
			const focusedPlayerGhost = this.scene.ghosts.find(playerGhost => playerGhost.hitbox == this.scene.camera.focusPoint);
			if (focusedPlayerGhost) {
				this.scene.paused = true;
				focusedPlayerGhost.playbackIterator.next(focusedPlayerGhost.playbackTicks + 5);
			}
			break;
		}
		case 'backspace':
			if (event.shiftKey) {
				this.scene.restoreCheckpoint();
				break;
			}
			this.scene.removeCheckpoint();
			break;
		case 'enter':
			event.preventDefault();
			if (event.shiftKey) {
				this.scene.restoreCheckpoint();
				break;
			}
			this.scene.returnToCheckpoint();
			break;
		case 'tab':
			event.preventDefault();
			let playersToFocus = Array(...this.scene.players, ...this.scene.ghosts).map(({ hitbox }) => hitbox);
			let index = playersToFocus.indexOf(this.scene.camera.focusPoint) + 1;
			if (playersToFocus.length <= index) {
				index = 0;
			}

			// if player is a ghost, show time-progress bar on the bottom
			this.scene.camera.focusPoint = playersToFocus[index];
			this.scene.paused = false;
			this.scene.frozen = false;
			break;
		case '-':
			this.scene.camera.zoomOut();
			break;
		case '+':
		case '=':
			this.scene.camera.zoomIn();
			break;
		case 'p':
		case ' ':
			this.ups > 25 ? this.scene.discreteEvents.add((this.scene.paused ? 'UN' : '') + 'PAUSE') : (this.scene.paused = !this.scene.paused || (this.scene.frozen = false),
			this.emit('stateChange', this.scene.paused))
		}

		if (this.scene.track.writable) {
			switch (event.key.toLowerCase()) {
			case 'c':
				if (!event.ctrlKey || this.scene.toolHandler.selected != 'select') break;
				const selectedCode = this.scene.toolHandler.currentTool.selected.toString();
				// selectedCode.length > 3 && navigator.clipboard.writeText(selectedCode);
				const type = 'text/plain';
				selectedCode.length > 3 && navigator.clipboard.write([new ClipboardItem({ [type]: new Blob([selectedCode], { type }) })]);
				break;
			case 'delete':
				if (this.scene.toolHandler.selected != 'select') break;
				this.scene.toolHandler.currentTool.deleteSelected();
				break;
			case 'v':
				// if (!event.ctrlKey) break;
				// const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
				// const permissionStatus = await navigator.permissions.query(queryOpts).then(permissionStatus => {
				// 	permissionStatus.onchange = ({ target }) => {
				// 		target.state == 'granted' && navigator.clipboard.readText().then(console.log);
				// 	};

				// 	return permissionStatus.state;
				// });

				// if (permissionStatus == 'deined') {
				// 	alert('NotAllowedError: Read permission denied.');
				// 	break;
				// }

				// navigator.clipboard.readText().then(console.log).catch(alert);
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
				event.ctrlKey && this.openFile({ multiple: event.shiftKey });
				break;
			case 'r':
				if (event.ctrlKey) {
					if (event.shiftKey) {
						this.mediaRecorder.stop();
					}

					this.createRecorder();
					this.mediaRecorder.start();
					if ('recorder' in window) {
						recorder.style.removeProperty('display');
					}
				}
				break;
			case 's':
				if (event.ctrlKey) {
					if (event.shiftKey) {
						this.saveAs();
						break;
					}
					this.save();
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
				event.ctrlKey && this.scene.track.history[(event.shiftKey ? 're' : 'un') + 'do']()
			}
		}
	}

	keyup(event) {
		event.preventDefault();
		switch (event.key.toLowerCase()) {
		case 'b':
			event.ctrlKey && this.scene.firstPlayer && (this.scene.firstPlayer.switchBike(),
			this.emit('playerVehicleChange', this.scene.firstPlayer.vehicle.name));
			break;
		case 'f':
		case 'f11':
			document.fullscreenElement ? document.exitFullscreen() : this.container.requestFullscreen();
		}

		if (this.scene.track.writable) {
			switch (event.key.toLowerCase()) {
			case 'g':
				this.scene.grid.size = 11 - this.scene.grid.size;
				this.emit('gridStateChange', this.scene.grid.size > 1);
			}
		}
	}

	paste(event) {}
	scroll(event) {
		if (!event.ctrlKey && this.scene.toolHandler.selected !== 'camera') {
			this.scene.toolHandler._handleEvent(event);
		} else {
			event.preventDefault();
			this.scene.toolHandler.cache.get('camera').scroll(event);
		}

		let y = new Coordinates(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop + window.screenY).toCanvas(this.canvas);
		this.scene.camera.focusPoint || this.scene.camera.add(this.mouse.position.difference(y));
	}

	load(code) {
		if (!code) {
			return this.openFile();
		}

		this.init({ write: true });
		this.scene.track.write(code);
	}

	async openFile(options = {}) {
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
			if (fileHandles.length > 0) {
				this.init({ write: true });
				for (const fileHandle of fileHandles) {
					const fileData = await fileHandle.getFile();
					this.scene.track.write(await fileData.text());
					// auto-save opened file:
					if (fileHandles.length < 2) {
						this.#openFile = fileHandle;
					}

					if (!options.multiple) {
						break;
					}
				}
			}

			return true;
		}

		const picker = document.createElement('input');
		picker.setAttribute('accept', 'text/plain');
		picker.setAttribute('type', 'file');
		picker.toggleAttribute('multiple', options.multiple);
		picker.addEventListener('change', async () => {
			this.init({ write: true });
			for (const file of this.files) {
				this.scene.track.write(await file.text());
				if (!options.multiple) {
					break;
				}
			}
		});
		picker.click();
	}

	save() {
		if (this.#openFile) {
			this.#openFile.createWritable().then(writable => {
				writable.write(this.scene.track.toString()).then(() => {
					if ('toasts' in window) {
						this.constructor.serveToast(Object.assign(document.createElement('div'), {
							className: 'toast',
							innerText: 'Changes successfully saved!'
						}), 3e3);
					}

					return writable.close();
				});
			});
			return true;
		}

		return this.saveAs();
	}

	async saveAs() {
		// if ('showSaveFilePicker' in window) {
		// 	const fileHandle = await window.showSaveFilePicker({
		// 		suggestedName: 'bhr_track-' + new Intl.DateTimeFormat('en-CA', { dateStyle: 'short', timeStyle: 'medium' }).format().replace(/[/\\?%*:|"<>]/g, '-').replace(/,+\s*/, '_').replace(/\s+.*$/, ''),
		// 		types: [{
		// 			description: 'BHR File',
		// 			accept: { 'text/plain': ['.txt'] }
		// 		}]
		// 	}).catch(() => null);
		// 	if (fileHandle !== null && verifyPermission(fileHandle, true)) {
		// 		const writable = await fileHandle.createWritable();
		// 		await writable.write(this.scene.track.toString());
		// 		await writable.close();
		// 		return true;
		// 	}
		// }

		const link = document.createElement('a');
		link.setAttribute('download', 'bhr_track-' + new Intl.DateTimeFormat('en-CA', { dateStyle: 'short', timeStyle: 'medium' }).format().replace(/[/\\?%*:|"<>]/g, '-').replace(/,+\s*/, '_').replace(/\s+.*$/, ''));
		link.setAttribute('href', URL.createObjectURL(new Blob([this.scene.track.toString()], { type: 'text/plain' })));
		link.click();
		return true;
	}

	reset() {
		this.init({ default: true, write: true });
	}

	close(event) {
		cancelAnimationFrame(this.lastFrame);
		this.mouse.close();
		// this.scene.close();
		this.scene.firstPlayer?.gamepad?.close();
		this._unlisten();
	}

	static DEFAULTS = DEFAULTS;
	static serveToast(toast, timeout) {
		if ('toasts' in window) {
			toasts.appendChild(toast).scrollIntoView({ block: 'end' });
			timeout && setTimeout(() => toast.remove(), timeout);
		}
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