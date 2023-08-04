import Player from "../Player.js";

import ToolHandler from "../handler/Tool.js";
import UndoManager from "../managers/Undo.js";

import Vector from "../Vector.js";
import PhysicsLine from "../items/line/PhysicsLine.js";
import SceneryLine from "../items/line/SceneryLine.js";

import Grid from "../grid/Grid.js";

import Target from "../items/Target.js";
import Checkpoint from "../items/Checkpoint.js";
import Bomb from "../items/Bomb.js";
import Boost from "../items/Boost.js";
import Gravity from "../items/Gravity.js";
import Antigravity from "../items/Antigravity.js";
import Slowmo from "../items/Slowmo.js";
import Teleporter from "../items/Teleporter.js";

// implement Track class w/ draw/move/scale/flip methods etc..
export default class {
	camera = new Vector();
	cameraLock = false;
	cameraFocus = null;
	collectables = [];
	currentTime = 0;
	editMode = false
	frozen = false;
	ghosts = [];
	grid = new Grid(this);
	history = new UndoManager();
	parent = null;
	paused = false;
	pictureMode = false;
	players = [];
	processing = false;
	progress = 100;
	sprogress = 100;
	toolHandler = new ToolHandler(this);
	// transformMode = false;
	zoomFactor = .6 * window.devicePixelRatio;
	canvasPool = []
	constructor(parent) {
		this.parent = parent;
		// this.helper.postMessage({ canvas: this.parent.canvas.transferControlToOffscreen() }, [offscreen]);
		// this.helper.addEventListener('message', ({ data }) => {
		// 	switch (data.cmd) {
		// 		case 'ADD_LINE': {
		// 			this.addLine(...data.args);
		// 			break;
		// 		}

		// 		case 'ADD_LINES': {
		// 			// this.addLine(...data.args);
		// 			console.log(data)
		// 			data.combined.forEach(line => {
		// 				this.addLine(...line);
		// 			});

		// 			this.processing = false;
		// 			break;
		// 		}
		// 	}
		// });
		this.grid.helper.addEventListener('message', ({ data }) => {
			switch(data.cmd) {
				case 'CANVAS_POOL': {
					this.canvasPool = Array.from(data.pool);
					break;
				}
			}
		})
	}

	#transformMode = false;
	get transformMode() {
		return this.#transformMode;
	}

	set transformMode(value) {
		this.#transformMode = value;
		this.toolHandler.setTool('camera');
		if (!value) {
			const cameraTool = this.toolHandler.cache.get('camera');
			this.moveTrack(cameraTool.trackOffset);
		}
	}

	get targets() {
		return this.collectables.filter(({ type }) => type === 'T').length;
	}

	get timeText() {
		let t = (this.ghostInFocus ? this.ghostInFocus.playbackTicks : (this.currentTime / this.parent.max)) / .03;
		return Math.floor(t / 6e4) + ':' + String((t % 6e4 / 1e3).toFixed(2)).padStart(5, '0');
	}

	get firstPlayer() {
		return this.players[0] ?? null;
	}

	get ghostInFocus() {
		return this.ghosts.find(({ vehicle }) => vehicle.hitbox == this.cameraFocus);
	}

	get zoom() {
		return this.zoomFactor;
	}

	set zoom(value) {
		this.zoomFactor = Math.min(window.devicePixelRatio * 4, Math.max(window.devicePixelRatio / 5, Math.round(value * 10) / 10));
		this.parent.ctx.lineWidth = Math.max(2 * this.zoom, 0.5);
		this.grid.resize();
	}

	init(options = {}) {
		options = Object.assign({ vehicle: 'BMX' }, arguments[0]);
		if (!/^bmx|mtb$/i.test(options.vehicle)) {
			throw new TypeError("Invalid vehicle type.");
		}

		'id' in options && (this.id = options.id);
		clearInterval(this.processingTimeout);
		clearInterval(this.sprocessingTimeout);
		this.collectables.splice(0);
		this.grid.rows.clear();
		this.ghosts.splice(0);
		this.firstPlayer && this.firstPlayer.gamepad.close();
		this.players.splice(0);
		this.players.push(new Player(this, { vehicle: options.vehicle }));
		this.processing = false;
		this.progress = this.sprogress = 100;
		this.cameraFocus = this.firstPlayer.vehicle.hitbox;
		this.camera.set(this.cameraFocus.position);
		this.editMode = options.write ?? this.editMode;
		this.toolHandler.setTool(this.editMode ? 'line' : 'camera');
	}

	zoomIn() {
		this.zoom += .2;
	}

	zoomOut() {
		this.zoom -= .2;
	}

	switchBike() {
		this.firstPlayer.setVehicle(this.firstPlayer.vehicle.name != 'BMX' ? 'BMX' : 'MTB');
	}

	checkpointEvent() {
		// for (const ghostPlayer of this.ghosts) {
		// 	ghostPlayer.ghostIterator.next(this.currentTime);
		// }

		this.paused = false;
		this.parent.emit('stateChange', this.paused);
		this.parent.settings.autoPause && (this.frozen = true);
		this.cameraFocus = this.firstPlayer.vehicle.hitbox;
		this.camera.set(this.cameraFocus.position);
	}

	watchGhost(data, { id, vehicle = 'BMX' } = {}) {
		const parts = data.trim().split(/\s*,\s*/g);
		let v = parts.pop();
		let time = parts.at(-1);

		/^(BMX|MTB)$/i.test(v) && (vehicle = v);

		const records = parts.map(item => item.split(/\s+/g).reduce((newArr, arr) => isNaN(arr) ? arr : newArr.add(parseInt(arr)), new Set()));
		let player = id && this.ghosts.find(player => player.id == id);
		if (!id || !player) {
			player = new Player(this, {
				records,
				time,
				vehicle
			});
			player.id = id;
			this.ghosts.push(player);
		}

		this.reset();
		this.cameraFocus = player.vehicle.hitbox;
		this.camera.set(this.cameraFocus.position);
		this.frozen = false;
		this.paused = false;

		let progress = document.querySelector('.replay-progress');
		progress && (progress.style.removeProperty('display'),
		progress.setAttribute('max', player.runTime ?? 100),
		progress.setAttribute('value', player.ticks));

		this.parent.emit('replayQueued', player, arguments);
	}

	collide(part) {
		let x = Math.floor(part.position.x / this.grid.scale - .5);
		let y = Math.floor(part.position.y / this.grid.scale - .5);

		this.grid.sector(x, y).fix();
		this.grid.sector(x, y + 1).fix();
		this.grid.sector(x + 1, y).fix();
		this.grid.sector(x + 1, y + 1).fix();

		this.grid.sector(x, y).collide(part);
		this.grid.sector(x + 1, y).collide(part);
		this.grid.sector(x + 1, y + 1).collide(part);
		this.grid.sector(x, y + 1).collide(part);
	}

	fixedUpdate() {
		this.parent.settings.autoPause && this.firstPlayer.gamepad.downKeys.size > 0 && (this.frozen = false);
		if (!this.paused && !this.processing && !this.frozen) {
			for (const player of this.players) {
				player.fixedUpdate();
			}

			for (const playerGhost of this.ghosts) {
				playerGhost.ghostIterator.next();
				// playerGhost.fixedUpdate();
			}

			this.currentTime += this.parent.max;
			// this.currentTime++
		}
	}

	update(progress, delta) {
		if (!this.paused && !this.processing && !this.frozen) {
			for (const player of this.players.filter(player => player.targetsCollected !== this.targets)) {
				player.update(...arguments);
			}

			for (const playerGhost of this.ghosts.filter(ghostPlayer => ghostPlayer.targetsCollected !== this.targets)) {
				playerGhost.update(...arguments);
			}
		}

		this.cameraFocus && this.camera.add(this.cameraFocus.position.difference(this.camera).scale(delta / 100));
	}

	nativeUpdate(delta) {
		this.parent.settings.autoPause && this.firstPlayer.gamepad.downKeys.size > 0 && (this.frozen = false);
		if (!this.paused && !this.processing && !this.frozen) {
			for (const player of this.players) {
				player.nativeUpdate();
			}

			for (const playerGhost of this.ghosts) {
				playerGhost.ghostIterator.next();
			}

			this.currentTime += this.parent.max;
			// this.currentTime++
		}

		this.cameraFocus && this.camera.add(this.cameraFocus.position.difference(this.camera).scale(delta / 100));
	}

	render(ctx) {
		this.draw(ctx);
		if (!this.transformMode) {
			for (const playerGhost of this.ghosts) {
				playerGhost.draw(ctx);
			}

			for (let i = this.players.length - 1; i >= 0; i--) {
				this.players[i].draw(ctx);
			}
		}

		this.cameraFocus || this.toolHandler.draw(ctx);
	}

	draw(ctx) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		// ctx.clearRect(0, 0, ctx.canvas.width / this.zoom, ctx.canvas.height / this.zoom);
		let min = new Vector(0, 0).toCanvas(ctx.canvas).oppositeScale(this.grid.scale).map(Math.floor);
		let max = new Vector(ctx.canvas.width, ctx.canvas.height).toCanvas(ctx.canvas).oppositeScale(this.grid.scale).map(Math.floor);
		let sectors = this.grid.range(min, max);
		for (const sector of sectors.filter(sector => sector.physics.length + sector.scenery.length > 0)) {
			sector.render(ctx);
		}

		// for (const sector of this.canvasPool) {
		// 	// sector.render(ctx);
		// 	ctx.drawImage(sector.canvas.image, Math.floor(sector.canvas.width / 2 - this.camera.x * this.zoom + sector.row * this.zoom), Math.floor(sector.canvas.height / 2 - this.camera.y * this.zoom + sector.column * this.zoom));
		// }

		if (this.pictureMode) {
			const imageData = ctx.getImageData(ctx.canvas.width / 2 - this.pictureMode.width / 2, ctx.canvas.height / 2 - this.pictureMode.height / 2, this.pictureMode.width, this.pictureMode.height);
			ctx.save();
			ctx.fillStyle = 'hsla(0, 0%, 0%, 0.4)';
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.lineWidth = 2;
			ctx.strokeRect(ctx.canvas.width / 2 - this.pictureMode.width / 2 - ctx.lineWidth / 2, ctx.canvas.height / 2 - this.pictureMode.height / 2 - ctx.lineWidth / 2, this.pictureMode.width + ctx.lineWidth, this.pictureMode.height + ctx.lineWidth);
			ctx.putImageData(imageData, ctx.canvas.width / 2 - this.pictureMode.width / 2, ctx.canvas.height / 2 - this.pictureMode.height / 2);
			ctx.fillStyle = 'red';
			let fontSize = Math.max(12, Math.min(16, Math.min(ctx.canvas.width, ctx.canvas.height) * (4 / 100)));
			ctx.font = fontSize + 'px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillText('Use your mouse to drag & fit an interesting part of your track in the thumbnail', ctx.canvas.width / 2, ctx.canvas.height * (2 / 100));
			ctx.restore();
			return;
		}

		for (const sector of sectors.filter(sector => sector.powerups.length > 0)) {
			for (const powerup of sector.powerups) {
				powerup.draw(ctx);
			}
		}
		
		if (!this.transformMode) {
			// // centered timer
			// ctx.save()
			// // ctx.font = '20px Arial';
			// ctx.textAlign = 'center';
			// ctx.fillText(this.timeText, ctx.canvas.width / 2, 10);
			// ctx.restore()

			// replace with message display system
			let i = this.timeText;
			if (this.processing) {
				i = "Loading, please wait... " + Math.floor((this.progress + this.sprogress) / 2);
			} else if (this.paused) {
				i += " - Game paused";
			} else if (this.firstPlayer && this.firstPlayer.dead && this.cameraFocus == this.firstPlayer.vehicle.hitbox) {
				i = "Press ENTER to restart";
				if (this.firstPlayer.snapshots.length > 1) {
					i += " or BACKSPACE to cancel Checkpoint"
				}
			} else if (this.editMode) {
				i += " - " + this.toolHandler.selected.replace(/^\w/, char => char.toUpperCase());
				if (this.toolHandler.selected === 'brush') {
					i += " ( size " + this.toolHandler.currentTool.length + " )";
				}
			}

			i = this.firstPlayer.targetsCollected + ` / ${this.targets}  -  ` + i
			let text = ctx.measureText(i)
			const goalRadius = (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 2;
			const goalStrokeWidth = 1;
			const left = 12;
			ctx.roundedRect(left - goalRadius / 2, 12 - goalRadius / 2, text.width + goalRadius + goalStrokeWidth / 2 + 10, goalRadius, 40, { padding: 5 });
			ctx.save()
			ctx.fillStyle = 'hsl(0deg 0% 50% / 50%)'
			ctx.fill()
			ctx.restore()
			ctx.fillText(i, left + goalRadius * 2, 12)
			ctx.save()
			// drawImage for powerups
			ctx.beginPath()
			ctx.fillStyle = '#ff0'
			ctx.lineWidth = goalStrokeWidth
			ctx.arc(left, 12, goalRadius / 1.5, 0, 2 * Math.PI)
			ctx.fill()
			ctx.stroke()
			ctx.restore()
			if (this.ghosts.length > 0) {
				ctx.save();
				ctx.textAlign = 'right'
				for (const index in this.ghosts) {
					let playerGhost = this.ghosts[index];
					i = (playerGhost.name || 'Ghost') + (playerGhost.targetsCollected === this.targets ? " finished!" : ": " + playerGhost.targetsCollected + " / " + this.targets);
					text = ctx.measureText(i)
					const textHeight = text.actualBoundingBoxAscent + text.actualBoundingBoxDescent;
					ctx.roundedRect(ctx.canvas.width - 12 - text.width, 12 + textHeight * index + index * 12 - textHeight / 2, text.width, (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 2, 40, { padding: 5 });
					ctx.save()
					ctx.fillStyle = 'hsl(0deg 0% 50% / 50%)' // if ghost is in focus, make it apparent
					ctx.fill()
					ctx.restore()
					ctx.fillText(i, ctx.canvas.width - 12, 12 + textHeight * index + index * 12)
				}

				ctx.restore()
			}
		}
	}

	erase(vector) {
		let x = Math.floor(vector.x / this.grid.scale - 0.5);
		let y = Math.floor(vector.y / this.grid.scale - 0.5);
		let cache = [];
		cache.push(...this.grid.sector(x, y).erase(vector));
		cache.push(...this.grid.sector(x + 1, y).erase(vector));
		cache.push(...this.grid.sector(x + 1, y + 1).erase(vector));
		cache.push(...this.grid.sector(x, y + 1).erase(vector));
		cache = Array.from(new Set(cache));
		this.history.push({
			undo: () => cache.forEach(item => this.grid.addItem(item)),
			redo: () => cache.forEach(item => item.remove())
		});
	}

	addLine(start, end, type) {
		const line = new (type ? SceneryLine : PhysicsLine)(start.x, start.y, end.x, end.y, this);
		if (line.length >= 2 && line.length < 1e5) {
			// this.offscreenGrid.postMessage({
			// 	cmd: 'ADD_LINE',
			// 	args: { start, end, type }
			// });
			this.grid.addItem(line);
			if (arguments[3] !== false) {
				this.history.push({
					undo: line.remove.bind(line),
					redo: () => this.grid.addItem(line)
				});
			}

			return line;
		}
	}

	// Fix this garbage.
	read(a = "-18 1i 18 1i###BMX") {
		// this.grid.helper.postMessage({
		// 	cmd: 'PARSE_TRACK',
		// 	code: arguments[0]
		// });
		// return;
		this.processing = true;
		const [physics, scenery, powerups] = String(a).split('#');
		physics && (this.progress = 0, this.processChunk(physics.split(/,+/g)));
		scenery && (this.sprogress = 0, this.processChunk(scenery.split(/,+/g), 1));
		if (powerups) {
			for (let powerup of powerups.split(/,+/g)) {
				powerup = powerup.split(/\s+/g);
				let x = parseInt(powerup[1], 32);
				let y = parseInt(powerup[2], 32);
				let a = parseInt(powerup[3], 32);
				switch (powerup[0]) {
					case "T":
						powerup = new Target(this, x, y);
						this.collectables.push(powerup);
						break;
					case "C":
						powerup = new Checkpoint(this, x, y);
						this.collectables.push(powerup);
						break;
					case "B":
						powerup = new Boost(this, x, y, a + 180);
						break;
					case "G":
						powerup = new Gravity(this, x, y, a + 180);
						break;
					case "O":
						powerup = new Bomb(this, x, y);
						break;
					case "S":
						powerup = new Slowmo(this, x, y);
						break;
					case "A":
						powerup = new Antigravity(this, x, y);
						break;
					case "W":
						powerup = new Teleporter(this, x, y);
						powerup.createAlt(a, parseInt(powerup[4], 32));
						this.collectables.push(powerup);
						break;
				}

				if (powerup) {
					x = Math.floor(x / this.grid.scale);
					y = Math.floor(y / this.grid.scale);
					this.grid.sector(x, y, true).powerups.push(powerup);
					if (powerup instanceof Teleporter) {
						x = Math.floor(powerup.alt.x / this.grid.scale);
						y = Math.floor(powerup.alt.y / this.grid.scale);
						this.grid.sector(x, y, true).powerups.push(powerup);
					}
				}
			}
		}
	}

	processChunk(array, scenery = false, index = 0) {
		let chunk = 100; // 100
		while (chunk-- && index < array.length) {
			let coords = array[index].split(/\s+/g);
			if (coords.length < 4) continue; // return; // ?
			for (let o = 0; o < coords.length - 2; o += 2) {
				let x = parseInt(coords[o], 32),
					y = parseInt(coords[o + 1], 32),
					l = parseInt(coords[o + 2], 32),
					c = parseInt(coords[o + 3], 32);
				isNaN(x + y + l + c) || this.addLine({ x, y }, { x: l, y: c }, scenery, false)
			}
			++index;
		}

		this[(scenery ? 's' : '') + 'progress'] = Math.round(index * 100 / array.length);
		if (index < array.length) {
			this[(scenery ? 's' : '') + 'processingTimeout'] = setTimeout(this.processChunk.bind(this), 0, array, scenery, index);
			return;
		}

		this.processing = this.progress < 100 || this.sprogress < 100;
		this.processing || this.parent.emit('load');
	}

	moveTrack(offset) {
		let physics = [];
		let scenery = [];
		let powerups = [];
		for (const sector of this.grid.sectors) {
			physics.push(...sector.physics.filter(line => (line = this.grid.coords(line.a)) && line.x == sector.row && line.y == sector.column));
			scenery.push(...sector.scenery.filter(line => (line = this.grid.coords(line.a)) && line.x == sector.row && line.y == sector.column));
			powerups.push(...sector.powerups.map(powerup => powerup.position.add(offset) && powerup));
		}

		this.init({ write: true });
		this.read(Array(Array.from(new Set(physics)).map(line => line.a.add(offset) && line.b.add(offset) && line).join(','), scenery.map(line => line.a.add(offset) && line.b.add(offset) && line).join(','), powerups.join(','), this.firstPlayer.vehicle.name).join('#'));
	}

	remove(item) {
		for (const sector of this.grid.findTouchingSectors(item.a ?? item.position, item.b ?? item.position)) {
			sector.remove(item);
		}

		// const collectable = this.parent.scene.collectables.indexOf(item);
		// if (collectable !== -1) {
		// 	this.parent.scene.collectables.splice(collectable, 1);
		// }
	}

	reset() {
		this.currentTime = 0;
		for (const player of this.players) {
			player.reset(...arguments);
		}

		for (const playerGhost of this.ghosts) {
			playerGhost.reset();
		}

		this.cameraFocus = this.firstPlayer.vehicle.hitbox;
		this.camera.set(this.cameraFocus.position);
		this.paused = false;
		this.parent.settings.autoPause && (this.frozen = true);

		let progress = document.querySelector('.replay-progress');
		progress && (this.cameraFocus === this.firstPlayer.vehicle.hitbox ? progress.style.setProperty('display', 'none') : (progress.style.removeProperty('display'),
		progress.setAttribute('max', this.cameraFocus.parent.parent.runTime ?? 100),
		progress.setAttribute('value', this.cameraFocus.parent.parent.ticks)));
	}

	toString() {
		let physics = [];
		let scenery = [];
		let powerups = [];
		for (const sector of this.grid.sectors) {
			physics.push(...sector.physics.filter(line => (line = this.grid.coords(line.a)) && line.x == sector.row && line.y == sector.column));
			scenery.push(...sector.scenery.filter(line => (line = this.grid.coords(line.a)) && line.x == sector.row && line.y == sector.column));
			powerups.push(...sector.powerups);
		}

		return Array(physics.join(','), scenery.join(','), powerups.join(','), this.firstPlayer.vehicle.name).join('#');
	}
}

CanvasRenderingContext2D.prototype.roundedRect = function(x, y, width, height, radius = 0, options = {}) {
	if ('padding' in options) {
		x -= options.padding;
		y -= options.padding;
		width += options.padding * 2;
		height += options.padding * 2;
	}

	radius = Math.min(width / 2, height / 2, radius);
	this.beginPath();
	this.moveTo(x + width - radius, y);
	this.arcTo(x + width, y, x + width, y + radius, radius);
	this.lineTo(x + width, y + height - radius);
	this.arcTo(x + width, y + height, x + width - radius, y + height, radius);
	this.lineTo(x + radius, y + height);
	this.arcTo(x, y + height, x, y + height - radius, radius);
	this.lineTo(x, y + radius, x, y, radius);
	this.arcTo(x, y, x + radius, y, radius);
	this.closePath();
	return { x, y, width, height, ...options }
}