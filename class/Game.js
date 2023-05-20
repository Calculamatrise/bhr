import RecursiveProxy from "./RecursiveProxy.js";
import EventEmitter from "./EventEmitter.js";
import Scene from "./scenes/Scene.js";
import Mouse from "./handler/Mouse.js";
import Vector from "./Vector.js";

export default class extends EventEmitter {
	#openFile = null;
	#privateWritable = null;
	accentColor = '#000000'; // for themes
	lastFrame = null;
	lastTime = performance.now();
	progress = 0;
	ups = 25; // 50;
	scene = new Scene(this);
	settings = new RecursiveProxy(Object.assign({
		autoPause: false,
		autoSave: false,
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
	constructor(canvas) {
		super();
		this.canvas = canvas;
		// const offscreen = this.canvas.transferControlToOffscreen();
		// this.scene.helper.postMessage({ canvas: offscreen }, [offscreen]);
		this.ctx = canvas.getContext('2d');
		this.ctx.textBaseline = 'middle';
		this.container = canvas.parentElement;

		this.mouse = new Mouse(canvas);
		this.mouse.on('down', this.press.bind(this));
		this.mouse.on('move', this.stroke.bind(this));
		this.mouse.on('up', this.clip.bind(this));
		this.mouse.on('wheel', this.scroll.bind(this));

		document.addEventListener('fullscreenchange', () => navigator.keyboard.lock(['Escape']));
		document.addEventListener('keydown', this.keydown.bind(this));
		document.addEventListener('keyup', this.keyup.bind(this));
		// document.addEventListener('paste', this.paste.bind(this));
		document.addEventListener('pointerlockchange', () => {
			if (!document.pointerLockElement) {
				const checkbox = this.container.querySelector('.bhr-game-overlay > input');
				this.scene.paused = checkbox !== null && (checkbox.checked = !checkbox.checked);
			}
		});

		this.on('settingsChange', settings => {
			'theme' in window && theme.setAttribute('href', 'styles/' + settings.theme + '.css');
			this.ctx.fillStyle = '#'.padEnd(7, this.settings.theme == 'dark' ? 'fb' : '0');
			this.ctx.strokeStyle = this.ctx.fillStyle;
			this.scene.grid.sectors.forEach(sector => sector.rendered = false);
			for (const setting in settings) {
				if (typeof settings[setting] != 'boolean' || setting == 'theme') continue;
				const id = setting.replace(/([A-Z])/g, '-$1').toLowerCase();
				const element = document.getElementById(id);
				element && (element.checked = settings[setting]);
			}
		});
		this.emit('settingsChange', this.settings);
		this.on('storageReady', async () => {
			if (!this.settings.autoSave) return;
			const tracks = await this.storage.getDirectoryHandle('tracks', { create: true });
			for await (const [fileName, fileHandle] of tracks.entries()) {
				if (fileName.endsWith('.crswap')) continue;
				console.log(fileName, fileHandle);
			}

			// Save as date, if yes is clicked on toast, open that file and createWritable.
			// new Intl.DateTimeFormat(navigator.language, { dateStyle: 'short', timeStyle: 'medium' }).format().replace(/[/\\?%*:|"<>]/g, '-').replace(/,+\s*/, '_').replace(/\s+.*$/, '')
			const fileHandle = await tracks.getFileHandle('savedState', { create: true });
			// const fileData = await fileHandle.getFile();
			this.#privateWritable = await fileHandle.createWritable({ keepExistingData: false });
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
			// 				this.scene.read(code);
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

		navigator.storage.getDirectory().then(root => {
			this.storage = root;
			this.emit('storageReady');
		}).catch(err => {
			console.warn('Storage:', err);
		});

		navigation.onnavigate = this.close.bind(this);

		// new ResizeObserver(this.setCanvasSize.bind(this)).observe(this.canvas);
		window.addEventListener('resize', this.setCanvasSize.bind(this));
		window.dispatchEvent(new Event('resize'));
		// window.onbeforeunload = this.close.bind(this);
		// window.onunload = this.close.bind(this);
		window.addEventListener('beforeunload', this.close.bind(this));
		window.addEventListener('beforeunload', function(event) {
			event.preventDefault();
			event.returnValue = false;
		});
	}

	get max() {
		return 1000 / this.ups;
	}

	init(options = {}) {
		this.lastFrame && cancelAnimationFrame(this.lastFrame);
		options = Object.assign({}, arguments[0]);
		this.#openFile = null;
		this.scene.init(options);
		this.scene.read(options.code || '-18 1i 18 1i###BMX');
		this.lastFrame = requestAnimationFrame(this.render.bind(this));
	}

	// render(time) {
	// 	this.lastFrame = requestAnimationFrame(this.render.bind(this));
	// 	let delta = time - this.lastTime;
	// 	// if (delta < this.max) {
	// 	// 	// this.scene.update();
	// 	// 	// this.scene.render(this.ctx);
	// 	// 	return;
	// 	// }

	// 	if (delta > 1000) {
	// 		delta = this.max;
	// 	}

	// 	this.progress += delta / this.max;
	// 	this.lastTime = time;

	// 	while (this.progress >= 1) {
	// 		this.scene.fixedUpdate();
	// 		this.updates++;
	// 		this.progress--;
	// 	}

	// 	// this.scene.fixedUpdate();
	// 	this.scene.update(this.progress, delta);
	// 	this.scene.render(this.ctx);
	// 	// this.lastTime = time;
	// }

	render(time) {
		this.lastFrame = requestAnimationFrame(this.render.bind(this));
		let delta = time - this.lastTime;
		if (delta < this.max) {
			// this.scene.update();
			// this.scene.render(this.ctx);
			return;
		}

		this.scene.nativeUpdate();
		this.scene.render(this.ctx);
		this.lastTime = time;
	}

	createRecorder() {
		const lastArgument = arguments[arguments.length - 1];
		this.mediaRecorder = new MediaRecorder(this.canvas.captureStream(50));
		this.mediaRecorder.addEventListener('dataavailable', ({ data }) => {
			const objectURL = URL.createObjectURL(data);
			typeof lastArgument == 'function' && lastArgument(objectURL);
			this.emit('recorderStop', objectURL);
		});
		this.mediaRecorder.addEventListener('start', event => {
			this.emit('recorderStart', event);
		})
		return this.mediaRecorder;
	}

	// create a separate overlaying canvas for scenery lines with a transparent background
	setCanvasSize() {
		const computedStyle = getComputedStyle(this.canvas);
		this.canvas.setAttribute('height', parseFloat(computedStyle.height) * window.devicePixelRatio);
		this.canvas.setAttribute('width', parseFloat(computedStyle.width) * window.devicePixelRatio);
		this.ctx.fillStyle = '#'.padEnd(7, this.settings.theme == 'dark' ? 'fb' : this.settings.theme == 'midnight' ? 'c' : '0');
		this.ctx.lineWidth = Math.max(2 * this.scene.zoom, 0.5);
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
		this.ctx.strokeStyle = this.ctx.fillStyle;
		// this.ctx.font = '20px Arial';
		// this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		// this.ctx.lineWidth = 2;
		// this.ctx.setTransform(this.scene.zoom, this.scene.camera.x, 0, this.scene.zoom, this.scene.camera.y, 0);
		// this.ctx.scale(-1, 1); // for 'left-hand' mode
	}

	async showRecentFiles() {
		if ('loadrecenttracks' in window && this.storage !== null) {
			loadrecenttracks.showModal();
			if ('recenttracks' in window) {
				const tracks = await this.storage.getDirectoryHandle('tracks', { create: true });
				const results = [];
				for await (const [fileName, fileHandle] of tracks.entries()) {
					if (fileName.endsWith('.crswap')) continue;
					const fileData = await fileHandle.getFile();
					const wrapper = document.createElement('div');
					wrapper.style = 'display: flex;gap: 0.25rem;width: -webkit-fill-available;';
					const button = wrapper.appendChild(document.createElement('button'));
					button.addEventListener('click', async event => {
						this.init({ code: await fileData.text() });
					});
					button.innerText = fileName;
					button.style = 'width: -webkit-fill-available;';
					const remove = wrapper.appendChild(document.createElement('button'));
					remove.addEventListener('click', async event => {
						// tracks.removeEntry(fileName);
						fileHandle.remove();
						wrapper.remove();
					});
					remove.innerText = '🗑'; // 🗙
					remove.style = 'background-color: hsl(0 40% 40% / calc(50% + 10% * var(--brightness-multiplier)));';
					results.push(wrapper);
					console.log(fileName, fileHandle);
				}

				recenttracks.replaceChildren(...results);
			}
		}
	}

	press(event) {
		if (this.scene.processing) return;
		this.scene.cameraLock = !event.shiftKey;
		this.scene.cameraFocus = false;
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

		this.scene.toolHandler.press(event);
	}

	stroke(event) {
		if (this.scene.processing) return;
		this.scene.toolHandler.selected != 'camera' && (this.scene.cameraFocus = false);
		if (event.shiftKey && this.mouse.down) {
			this.scene.toolHandler.cache.get('camera').stroke(event);
			return;
		}

		if (!/^(camera|eraser|select)$/i.test(this.scene.toolHandler.selected)) {
			this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
			this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
		}

		this.scene.toolHandler.stroke(event);
	}

	clip(event) {
		if (this.scene.processing) return;
		this.scene.cameraLock = false;
		if (!/^(camera|eraser|select)$/i.test(this.scene.toolHandler.selected)) {
			this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
			this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
		}

		event.shiftKey || this.scene.toolHandler.clip(event);
	}

	async keydown(event) {
		event.preventDefault();
		switch (event.key.toLowerCase()) {
			case 'arrowleft': {
				const focusedPlayerGhost = this.scene.ghosts.find(playerGhost => playerGhost.vehicle.hitbox == this.scene.cameraFocus);
				if (focusedPlayerGhost) {
					this.scene.paused = true;
					focusedPlayerGhost.ticks = Math.max(0, focusedPlayerGhost.ticks - 5);
					focusedPlayerGhost.ghostIterator.next(focusedPlayerGhost.ticks);
				}
				break;
			}

			case 'arrowright': {
				const focusedPlayerGhost = this.scene.ghosts.find(playerGhost => playerGhost.vehicle.hitbox == this.scene.cameraFocus);
				if (focusedPlayerGhost) {
					this.scene.paused = true;
					focusedPlayerGhost.ghostIterator.next(focusedPlayerGhost.ticks + 5);
				}
				break;
			}

			case 'backspace': {
				if (event.shiftKey) {
					this.scene.firstPlayer.restoreCheckpoint();
					break;
				}

				this.scene.firstPlayer.removeCheckpoint();
				break;
			}

			case 'enter': {
				if (event.shiftKey) {
					this.scene.firstPlayer.restoreCheckpoint();
					break;
				}

				this.scene.firstPlayer.gotoCheckpoint();
				break;
			}

			case 'tab': {
				let playersToFocus = Array(...this.scene.players, ...this.scene.ghosts).map(player => player.vehicle.hitbox);
				let index = playersToFocus.indexOf(this.scene.cameraFocus) + 1;
				if (playersToFocus.length <= index) {
					index = 0;
				}

				// if player is a ghost, show time-progress bar on the bottom
				this.scene.cameraFocus = playersToFocus[index];
				this.scene.paused = false;
				this.scene.frozen = false;
				break;
			}

			case '-':
				this.scene.zoomOut();
				break;
			case '+':
			case '=':
				this.scene.zoomIn();
				break;
			case 'p':
			case ' ':
				(this.scene.paused = !this.scene.paused) || (this.scene.frozen = false);
				document.querySelector('.playpause > input').checked = !this.scene.paused;
				break;
		}

		if (this.scene.editMode) {
			switch (event.key.toLowerCase()) {
				case 'c': {
					if (!event.ctrlKey || this.scene.toolHandler.selected != 'select') {
						break;
					}

					const selectedCode = this.scene.toolHandler.currentTool.selected.toString();
					// selectedCode.length > 3 && navigator.clipboard.writeText(selectedCode);
					const type = 'text/plain';
					selectedCode.length > 3 && navigator.clipboard.write([new ClipboardItem({ [type]: new Blob([selectedCode], { type }) })]);
					break;
				}

				case 'delete': {
					if (this.scene.toolHandler.selected != 'select') {
						break;
					}

					this.scene.toolHandler.currentTool.deleteSelected();
					break;
				}

				case 'v': {
					if (!event.ctrlKey) {
						break;
					}

					const queryOpts = { name: 'clipboard-read', allowWithoutGesture: false };
					const permissionStatus = await navigator.permissions.query(queryOpts).then(permissionStatus => {
						permissionStatus.onchange = ({ target }) => {
							target.state == 'granted' && navigator.clipboard.readText().then(console.log);
						};

						return permissionStatus.state;
					});

					if (permissionStatus == 'deined') {
						alert('NotAllowedError: Read permission denied.');
						break;
					}

					navigator.clipboard.readText().then(console.log).catch(alert);
					break;
				}

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
				case 'r': {
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
				}
				case 's': {
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
				}

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
				event.ctrlKey && this.scene.switchBike();
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

		if (this.scene.editMode) {
			switch (event.key.toLowerCase()) {
				case 'g':
					document.querySelector('.grid > input').checked = (this.scene.grid.size = 11 - this.scene.grid.size) > 1;
					break;
			}
		}
	}

	paste(event) {}
	scroll(event) {
		if (!event.ctrlKey) {
			this.scene.toolHandler.scroll(event);
		} else {
			this.scene.toolHandler.cache.get('camera').scroll(event);
		}

		let y = new Vector(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop + window.pageYOffset).toCanvas(this.canvas);
		this.scene.cameraFocus || this.scene.camera.add(this.mouse.position.difference(y));
	}

	load(code) {
		this.init({ write: true });
		if (!code) {
			return this.openFile();
		}

		this.scene.read(code);
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
			for (const fileHandle of fileHandles) {
				const fileData = await fileHandle.getFile();
				this.scene.read(await fileData.text());
				// auto-save opened file:
				if (fileHandles.length < 2) {
					this.#openFile = fileHandle;
				}

				if (!options.multiple) {
					break;
				}
			}

			return true;
		}

		const picker = document.createElement('input');
		picker.setAttribute('accept', 'text/plain');
		picker.setAttribute('type', 'file');
		picker.toggleAttribute('multiple', options.multiple);
		picker.addEventListener('change', async () => {
			for (const file of this.files) {
				this.scene.read(await file.text());
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
				writable.write(this.scene.toString()).then(() => {
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
		// 		await writable.write(this.scene.toString());
		// 		await writable.close();
		// 		return true;
		// 	}
		// }

		const link = document.createElement('a');
		link.setAttribute('download', 'bhr_track-' + new Intl.DateTimeFormat('en-CA', { dateStyle: 'short', timeStyle: 'medium' }).format().replace(/[/\\?%*:|"<>]/g, '-').replace(/,+\s*/, '_').replace(/\s+.*$/, ''));
		link.setAttribute('href', URL.createObjectURL(new Blob([this.scene.toString()], { type: 'text/plain' })));
		link.click();
		return true;
	}

	reset() {
		confirm("Do you really want to start a new track?") && this.init({ write: true });
	}

	async close(event) {
		await this.#privateWritable.write(this.scene.toString());
		// if (event.returnValue) return; // check if page is really closing before cancelling animation frame and whatnot
		await this.#privateWritable.close();
		if (event instanceof BeforeUnloadEvent) {
			window.onresize = null;
			window.removeEventListener('resize', this.constructor.adjust);
		} else if (event instanceof NavigateEvent) {
			cancelAnimationFrame(this.lastFrame);
			this.mouse.close();
			// this.scene.close();
			navigation.onnavigate = null;
		}
	}

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