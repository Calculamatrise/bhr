import Player from "../Player.js";

import ToolHandler from "../handler/Tool.js";
import UndoManager from "../managers/Undo.js";

import Vector from "../Vector.js";
import PhysicsLine from "../grid/sector/PhysicsLine.js";
import SceneryLine from "../grid/sector/SceneryLine.js";

import Grid from "../grid/Grid.js";

import Target from "../item/Target.js";
import Checkpoint from "../item/Checkpoint.js";
import Bomb from "../item/Bomb.js";
import Boost from "../item/Boost.js";
import Gravity from "../item/Gravity.js";
import Antigravity from "../item/Antigravity.js";
import Slowmo from "../item/Slowmo.js";
import Teleporter from "../item/Teleporter.js";

// implement Track class w/ draw/move/scale/flip methods etc..
export default class {
	camera = new Vector();
	cameraLock = false;
	cameraFocus = null;
	collectables = [];
	currentTime = 0;
	transformMode = false;
	freezeFrame = true;
	grid = new Grid(this);
	helper = new Worker('./class/scenes/TrackRenderer.js');
	history = new UndoManager();
	parent = null;
	paused = false;
	pictureMode = false;
	players = []
	processing = true;
	progress = 0;
	sprogress = 0;
	toolHandler = new ToolHandler(this);
	zoomFactor = .6 * window.devicePixelRatio;
	constructor(parent) {
		this.parent = parent;
		// this.helper.postMessage({ canvas: this.parent.canvas.transferControlToOffscreen() }, [offscreen]);
		// this.helper.addEventListener('message', ({ data }) => {
		// 	switch (data.cmd) {
		// 		case 'ADD_LINE': {
		// 			this.addLine(...data.args);
		// 			break;
		// 		}
		// 	}
		// });
	}

	get targets() {
		return this.collectables.filter(({ type }) => type === 'T').length;
	}

	get timeText() {
		let t = this.currentTime / this.parent.max / .03;
		return Math.floor(t / 6e4) + ':' + String((t % 6e4 / 1e3).toFixed(2)).padStart(5, '0');
	}

	get firstPlayer() {
		return this.players[0] ?? null;
	}

	get zoom() {
		return this.zoomFactor;
	}

	set zoom(value) {
		this.zoomFactor = Math.min(window.devicePixelRatio * 4, Math.max(window.devicePixelRatio / 5, Math.round(value * window.devicePixelRatio * 10) / 10));
		this.parent.ctx.lineWidth = Math.max(2 * this.zoom, 0.5);
		for (const sector of this.grid.sectors) {
			sector.resize();
		}
	}

	init(options = {}) {
		options = Object.assign({ vehicle: 'BMX' }, arguments[0]);
		if (!/^bmx|mtb$/i.test(options.vehicle)) {
			throw new TypeError("Invalid vehicle type.");
		}

		'id' in options && (this.id = options.id);
		clearInterval(this.processingTimeout);
		clearInterval(this.sprocessingTimeout);
		this.grid.rows.clear();
		this.players.splice(0);
		this.players.push(new Player(this, { vehicle: options.vehicle }));
		this.cameraFocus = this.firstPlayer.vehicle.head;
		this.camera = this.firstPlayer.vehicle.head.position.clone();
		this.editMode = options.write;
		if (options.write) {
			this.toolHandler.setTool('line');
		}
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

	checkpointEvent(method) {
		this.paused = this.parent.settings.ap;
		this.parent.container.querySelector('.playpause > input').checked = !this.paused;
		this.cameraFocus = this.firstPlayer.vehicle.head;
		this.camera = this.firstPlayer.vehicle.head.position.clone();
		for (let i = 1; i < this.players.length; i++) {
			this.players[i][method]();
		}
	}

	watchGhost(data, { id, vehicle = 'BMX' } = {}) {
		const records = data.split(/\s*,\s*/g).map(item => item.split(/\s+/g).reduce((newArr, arr) => isNaN(arr) ? arr : newArr.add(parseInt(arr)), new Set()));
		const v = records.at(-1);
		if (['BMX', 'MTB'].includes(v.toUpperCase())) {
			vehicle = v;
		}

		this.reset();
		let player = id && this.players.find(player => player.id == id);
		if (!player) {
			player = new Player(this, {
				records,
				vehicle
			});
			player.id = id;
			this.players.push(player);
		}

		this.cameraFocus = player.vehicle.head;
		this.paused = false;
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

	update() {
		if (this.freezeFrame && this.parent.settings.ap && this.firstPlayer.gamepad.downKeys.size > 0) {
			this.freezeFrame = false;
			this.paused = false;
			this.parent.container.querySelector('.playpause > input').checked = !this.paused;
		}

		if (!this.paused && !this.processing) {
			for (const player of this.players) {
				player.update();
			}

			this.currentTime += this.parent.max;
			// this.currentTime++
		}

		this.cameraFocus && this.camera.add(this.cameraFocus.position.difference(this.camera).scale(.3));
	}

	render(ctx) {
		// return this.helper.postMessage({
		// 	cmd: 'RENDER_SCENE',
		// 	grid: this.grid.sectors
		// });
		this.draw(ctx);
		for (let i = this.players.length - 1; i >= 0; i--) {
			this.players[i].draw(ctx);
		}

		this.cameraFocus || this.toolHandler.draw(ctx);
	}

	draw(ctx) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		// ctx.clearRect(this.camera.x, this.camera.y, ctx.canvas.width / this.zoom, ctx.canvas.height / this.zoom);
		let min = new Vector(0, 0).toCanvas(ctx.canvas).oppositeScale(this.grid.scale).map(Math.floor);
		let max = new Vector(ctx.canvas.width, ctx.canvas.height).toCanvas(ctx.canvas).oppositeScale(this.grid.scale).map(Math.floor);
		let sectors = this.grid.range(min, max);
		for (const sector of sectors) {
			sector.physics.length + sector.scenery.length > 0 && sector.render(ctx);
		}

		for (const sector of sectors) {
			for (const powerup of sector.powerups) {
				powerup.draw(ctx);
			}
		}

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

		// // centered timer
		// ctx.save()
		// ctx.font = '20px Arial';
		// ctx.textAlign = 'center';
		// ctx.textBaseline = 'end';
		// ctx.fillText(this.timeText, ctx.canvas.width / 2, 20);
		// ctx.restore()

		// replace with message display system
		let i = this.timeText;
		if (this.processing) {
			i = "Loading, please wait... " + Math.floor((this.progress + this.sprogress) / 2);
		} else if (this.paused && !this.parent.settings.ap) {
			i += " - Game paused";
		} else if (this.firstPlayer && this.firstPlayer.dead) {
			i = "Press ENTER to restart";
			if (this.firstPlayer.snapshots.length > 1) {
				i += " or BACKSPACE to cancel Checkpoint"
			}
		} else if (this.id === void 0) {
			if (this.grid.size === 10 && ['line', 'brush'].includes(this.toolHandler.selected)) {
				i += " - Grid ";
			}

			i += " - " + this.toolHandler.selected;
			if (this.toolHandler.selected === 'brush') {
				i += " ( size " + this.toolHandler.currentTool.length + " )";
			}
		}

		i = this.firstPlayer.targetsCollected + ` / ${this.targets}  -  ` + i
		const text = ctx.measureText(i)
		const goalRadius = (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 2;
		const goalStrokeWidth = 1;
		const left = 12 * window.devicePixelRatio;
		let rect = ctx.roundedRect(left - goalRadius / 2, 12 - goalRadius / 2, text.width + goalRadius + goalStrokeWidth / 2 + 10, goalRadius, 40, { padding: 5 });
		ctx.textBaseline = 'middle';
		ctx.save()
		ctx.clip()
		ctx.filter = 'blur(10px)'
		ctx.drawImage(ctx.canvas, rect.x, rect.y, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height);
		ctx.filter = 'none'
		ctx.fillStyle = 'rgba(128,128,128,0.4)'
		ctx.fill()
		ctx.restore()
		ctx.fillText(i, left + rect.padding * 2, 12)
		ctx.beginPath()
		ctx.arc(left, 12, goalRadius / 1.5, 0, 2 * Math.PI)
		ctx.save()
		ctx.fillStyle = '#ff0'
		ctx.fill()
		ctx.lineWidth = goalStrokeWidth
		ctx.stroke()
		ctx.restore()
		if (this.players.length > 1) {
			ctx.save();
			ctx.textAlign = 'right'
			for (var p = 1, player = this.players[p]; p < this.players.length; player = this.players[++p]) {
				i = (player.name || 'Ghost') + (player.targetsCollected === this.targets ? " finished!" : ": " + player.targetsCollected + " / " + this.targets);
				const text = ctx.measureText(i)
				let rect = ctx.roundedRect(ctx.canvas.width - text.width - 40, 8 * (p - 1) + (p * 12) - (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 4, text.width, (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 2, 40, { padding: 5 });
				ctx.save()
				ctx.clip()
				ctx.filter = 'blur(10px)'
				ctx.drawImage(ctx.canvas, rect.x, rect.y, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height)
				ctx.filter = 'none'
				ctx.fillStyle = 'rgba(128,128,128,0.4)'
				ctx.fill()
				ctx.restore()
				ctx.fillText(i, ctx.canvas.width - 40, 8 * (p - 1) + (p * 12))
			}

			ctx.restore()
		}
	}

	erase(vector) {
		let x = Math.floor(vector.x / this.grid.scale - 0.5);
		let y = Math.floor(vector.y / this.grid.scale - 0.5);
		return [
			...this.grid.sector(x, y).erase(vector),
			...this.grid.sector(x, y + 1).erase(vector),
			...this.grid.sector(x + 1, y).erase(vector),
			...this.grid.sector(x + 1, y + 1).erase(vector)
		]
	}

	addLine(start, end, type) {
		const line = new (type ? SceneryLine : PhysicsLine)(start.x, start.y, end.x, end.y, this);
		if (line.len >= 2 && line.len < 1e5) {
			this.addLineInternal(line);
			if (arguments[3] !== false) {
				this.history.push({
					undo: line.remove.bind(line),
					redo: () => this.addLineInternal(line)
				});
			}

			return line;
		}
	}

	addLineInternal(line) {
		for (const sector of this.grid.findTouchingSectors(line.a, line.b)) {
			sector[line.type].push(line);
			sector.rendered = false;
		}
	}

	// Fix this garbage.
	read(a = "-18 1i 18 1i###BMX") {
		// this.helper.postMessage({
		// 	cmd: 'PARSE_TRACK',
		// 	code: arguments[0]
		// });
		const [physics, scenery, powerups] = a.split('#');
		physics && this.processChunk(physics.split(/,+/g));
		scenery && this.processChunk(scenery.split(/,+/g), 1);
		if (!powerups) return;
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
			}
		}
	}

	processChunk(array, scenery = false, index = 0) {
		let chunk = 400;
		while (chunk-- && index < array.length) {
			let line = array[index].split(/\s+/g);
			if (line.length < 4) return;
			for (let o = 0; o < line.length - 2; o += 2) {
				let x = parseInt(line[o], 32),
					y = parseInt(line[o + 1], 32),
					l = parseInt(line[o + 2], 32),
					c = parseInt(line[o + 3], 32);
				isNaN(x + y + l + c) || this.addLine({ x, y }, { x: l, y: c }, scenery, false)
			}
			++index;
		}

		if (index < array.length) {
			this.processing = true;
			this[(scenery ? 's' : '') + 'progress'] = index * 100 / array.length
			this[(scenery ? 's' : '') + 'processingTimeout'] = setTimeout(this.processChunk.bind(this), 0, array, scenery, index);
			return;
		}

		this.processing = false;
	}

	remove(item) {
		for (const sector of this.grid.findTouchingSectors(item.a ?? item.position, item.b ?? item.position)) {
			sector.remove(item);
		}
	}

	reset() {
		this.currentTime = 0;
		for (const sector of this.grid.sectors) {
			sector.fix();
		}

		for (const player of this.players) {
			player.reset();
		}

		this.parent.settings.ap && (this.freezeFrame = true);
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

		return Array(physics.map(line => line.toString()).join(','), scenery.map(line => line.toString()).join(','), powerups.map(powerup => powerup.toString()).join(','), this.firstPlayer.vehicle.name).join('#');
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