import Coordinates from "../../Coordinates.js";
import PhysicsLine from "../../items/line/PhysicsLine.js";
import SceneryLine from "../../items/line/SceneryLine.js";
import Target from "../../items/Target.js";
import Checkpoint from "../../items/Checkpoint.js";
import Boost from "../../items/Boost.js";
import Gravity from "../../items/Gravity.js";
import Bomb from "../../items/Bomb.js";
import Slowmo from "../../items/Slowmo.js";
import Antigravity from "../../items/Antigravity.js";
import Teleporter from "../../items/Teleporter.js";
import HistoryManager from "../../managers/History.js";

export default class extends Worker {
	// backgroundHelper = new Worker("./class/experiment/helpers/BackgroundRenderer.js", { type: 'module' });
	consumables = [];
	history = new HistoryManager();
	physicsLines = [];
	powerupTypes = {};
	sceneryLines = [];
	mode = 'readwrite'; // mode -- transformMode
	constructor(parent) {
		super("./class/scenes/track/Parser.js" /*, { type: 'module' } */);
		Object.defineProperty(this, 'scene', { value: parent || null });
		Object.defineProperty(this, 'writable', { value: false, writable: true });
		// Object.defineProperty(this.backgroundHelper, 'cachedBoard', { value: null, writable: true });
		// Object.defineProperty(this.backgroundHelper, 'cachedSectors', { value: null, writable: true });
		// this.backgroundHelper.addEventListener('message', ({ data }) => {
		// 	data.hasOwnProperty('board') && (this.backgroundHelper.cachedBoard = data.board);
		// 	data.hasOwnProperty('grid') && (this.backgroundHelper.cachedSectors = data.grid);
		// 	switch(data.code) {
		// 	case 0:
		// 		console.log(data);
		// 		// this.ready = true;
		// 		this.processing = false;
		// 		this.scene.parent.emit('load');
		// 		break;
		// 	case 2:
		// 		data.hasOwnProperty('physicsProgress') && (this.physicsProgress = data.physicsProgress);
		// 		data.hasOwnProperty('sceneryProgress') && (this.sceneryProgress = data.sceneryProgress);
		// 		break;
		// 	}
		// });
		this.clear()
	}

	get targets() {
		return this.consumables.filter(({ type }) => type === 'T').length;
	}

	addLine(start, end, scenery) {
		let line = new (scenery ? SceneryLine : PhysicsLine)(start.x, start.y, end.x, end.y, this.scene);
		if (line.length >= 2 && line.length < 1e5) {
			this.scene.grid.addItem(line);
			this[scenery ? 'sceneryLines' : 'physicsLines'].push(line);

			let cache = arguments[3];
			if (cache !== false) {
				this.history.push({
					undo: line.remove.bind(line),
					redo: () => this.scene.grid.addItem(line)
				})
			}
		}
	}

	addPowerup(powerup) {
		this.scene.grid.addItem(powerup);
		this.powerupTypes[powerup.type] ||= [];
		this.powerupTypes[powerup.type].push(powerup)
	}

	clear() {
		clearTimeout(this.processingPhysics);
		clearTimeout(this.processingScenery);
		this.processingPhysics = null;
		this.processingScenery = null;
		this.powerupTypes = {};
		this.processing = false;
		this.physicsProgress = 100;
		this.sceneryProgress = 100;
		this.consumables.splice(0);
		this.physicsLines.splice(0);
		this.sceneryLines.splice(0);
	}

	collide(part) {
		let i = this.scene.grid.scale
		  , x = Math.floor(part.position.x / i - 0.5)
		  , y = Math.floor(part.position.y / i - 0.5);
		for (let sector of this.scene.grid.findSectorGroup(x, y, { fix: true })) {
			sector.collide(part);
		}
	}

	draw(ctx) {
		let min = new Coordinates().toCanvas(ctx.canvas).oppositeScale(this.scene.grid.scale);
		let max = new Coordinates(ctx.canvas.width, ctx.canvas.height).toCanvas(ctx.canvas).oppositeScale(this.scene.grid.scale).map(Math.floor);
		let sectors = this.scene.grid.range(min, max);
		for (const sector of sectors.filter(sector => sector.physics.length + sector.scenery.length > 0)) {
			sector.render(ctx);
		}
		// if (null !== this.backgroundHelper.cachedSectors) {
		// 	for (let x = Math.floor(min.x); x <= max.x; x++) {
		// 		for (let y = Math.floor(min.y); y <= max.y; y++) {
		// 			let sector = this.backgroundHelper.cachedSectors.find(sector => sector.row === x && sector.column === y);
		// 			if (!sector) continue;
		// 			// console.log(sector)
		// 			ctx.drawImage(sector.bitmap, ctx.canvas.width / 2 + (x * this.scene.grid.scale - this.scene.camera.x), ctx.canvas.height / 2 + (y * this.scene.grid.scale - this.scene.camera.y));
		// 		}
		// 	}
		// }
		// if (null !== this.backgroundHelper.cachedBoard) {
		// 	let min = new Coordinates().toCanvas(ctx.canvas);
		// 	let max = new Coordinates(ctx.canvas.width, ctx.canvas.height).toCanvas(ctx.canvas).map(Math.floor);
		// 	ctx.drawImage(this.backgroundHelper.cachedBoard, this.backgroundHelper.cachedBoard.width / 2 + min.x, this.backgroundHelper.cachedBoard.height / 2 + min.y, max.x - min.x, max.y - min.y, 0, 0, ctx.canvas.width, ctx.canvas.height);
		// }

		if (!this.scene.pictureMode) {
			ctx.save();
			ctx.beginPath();
			for (const type in this.powerupTypes) {
				for (const powerup of this.powerupTypes[type]) {
					powerup.draw(ctx)
				}
			}
			ctx.restore()
		}
	}

	erase(vector) {
		// check if is readonly
		if (this.state === 'readonly') return;
		let i = this.scene.grid.scale - 0.5
		  , x = Math.floor(vector.x / i)
		  , y = Math.floor(vector.y / i)
		  , cache = [];
		for (let i = 0; i < 4; i % 2 == 0 ? x += 1 - i % 4 : y += i % 2, i++) {
			let sector = this.scene.grid.sector(x, y);
			sector && cache.push(...sector.erase(vector));
		}

		for (let item of cache) {
			if (this.physicsLines.indexOf(item) !== -1) {
				this.physicsLines.splice(item, 1);
			} else if (this.sceneryLines.indexOf(item) !== -1) {
				this.sceneryLines.splice(item, 1);
			} else {
				for (let type in this.powerupTypes) {
					if (this.powerupTypes[type].indexOf(item) !== -1) {
						this.powerupTypes[type].splice(item, 1)
					}
				}
			}
		}

		this.history.push({
			undo: () => cache.forEach(item => this.grid.addItem(item)),
			redo: () => cache.forEach(item => item.remove())
		})
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

		this[(scenery ? 'scenery' : 'physics') + 'Progress'] = Math.round(index * 100 / array.length);
		if (index < array.length) {
			this['processing' + (scenery ? 'Scenery' : 'Physics')] = setTimeout(this.processChunk.bind(this), 0, array, scenery, index);
			return;
		}

		this.processing = this.physicsProgress < 100 || this.sceneryProgress < 100;
		this.processing || this.scene.parent.emit('load');
	}

	read(data) {
		data ||= '-18 1i 18 1i###BMX';
		// this.backgroundHelper.postMessage({
		// 	code: 1,
		// 	data,
		// 	scene: {
		// 		camera: {
		// 			x: this.scene.camera.x,
		// 			y: this.scene.camera.y,
		// 			zoom: this.scene.camera.zoom
		// 		},
		// 		parent: { settings: { theme: this.scene.parent.settings.theme }}
		// 	}
		// });
		let parts = data.split('#')
		  , physics = parts.shift()
		  , scenery = parts.shift()
		  , powerups = parts.shift()
		  , vehicle = parts.shift()
		this.processing = true;
		physics && (this.physicsProgress = 0,
		this.processChunk(physics.split(/,+/g)));
		scenery && (this.sceneryProgress = 0,
		this.processChunk(scenery.split(/,+/g), true))
		if (!powerups) return;
		for (let powerup of powerups.split(/,+/g)) {
			powerup = powerup.split(/\s+/g);
			let x = parseInt(powerup[1], 32);
			let y = parseInt(powerup[2], 32);
			let a = parseInt(powerup[3], 32);
			switch (powerup[0]) {
			case 'T':
				powerup = new Target(this.scene, x, y);
				this.consumables.push(powerup);
				break;
			case 'C':
				powerup = new Checkpoint(this.scene, x, y);
				this.consumables.push(powerup);
				break;
			case 'B':
				powerup = new Boost(this.scene, x, y, a + 180);
				break;
			case 'G':
				powerup = new Gravity(this.scene, x, y, a + 180);
				break;
			case 'O':
				powerup = new Bomb(this.scene, x, y);
				break;
			case 'S':
				powerup = new Slowmo(this.scene, x, y);
				break;
			case 'A':
				powerup = new Antigravity(this.scene, x, y);
				break;
			case 'W':
				powerup = new Teleporter(this.scene, x, y);
				powerup.createAlt(a, parseInt(powerup[4], 32));
				this.consumables.push(powerup)
			}

			this.addPowerup(powerup);
			if (powerup instanceof Teleporter) {
				x = Math.floor(powerup.alt.x / this.scene.grid.scale);
				y = Math.floor(powerup.alt.y / this.scene.grid.scale);
				let sector = this.scene.grid.sector(x, y, true);
				sector.powerups.push(powerup);
				powerup.sectors.add(sector)
			}
		}
	}

	rotate() { }
	scale() { }
	transform(scaleX, translateX, rotateX, scaleY, translateY, rotateY) {
		this.scale(scaleX, scaleY);
		this.translate(translateX, translateY);
		this.rotate(rotateX, rotateY)
	}

	translate(x, y) {
		// Filter sectors that are currently visible
		// let sectorsInView = this.scene.grid.sectors.filter();
		// Only move objects in sectors that are visible, and objects that will be visible
		// Before filtering sectors, convert offset units to sectors and add to the range
		// If the size of a sector is 100 and the track is being moved 200 units, when filtering the sectors, subtract 2 from the min and add 2 to the max?

		// Maybe have worker move the rest after the visible sections are moved?

		// let physics = [];
		// let scenery = [];
		// let powerups = [];
		// for (const sector of this.grid.sectors) {
		// 	physics.push(...sector.physics.filter(line => (line = this.grid.coords(line.a)) && line.x == sector.row && line.y == sector.column));
		// 	scenery.push(...sector.scenery.filter(line => (line = this.grid.coords(line.a)) && line.x == sector.row && line.y == sector.column));
		// 	powerups.push(...sector.powerups.map(powerup => powerup.position.add(offset) && powerup));
		// }

		// this.init({ write: true });
		// this.read(Array(Array.from(new Set(physics)).map(line => line.a.add(offset) && line.b.add(offset) && line).join(','), scenery.map(line => line.a.add(offset) && line.b.add(offset) && line).join(','), powerups.join(','), this.firstPlayer.vehicle.name).join('#'));
	}

	close() {
		this.backgroundHelper.terminate()
	}

	toString() {
		let physics = []
		  , scenery = []
		  , powerups = [];
		for (const sector of this.scene.grid.sectors) {
			physics.push(...sector.physics.filter(line => (line = this.scene.grid.coords(line.a)) && line.x == sector.row && line.y == sector.column));
			scenery.push(...sector.scenery.filter(line => (line = this.scene.grid.coords(line.a)) && line.x == sector.row && line.y == sector.column));
			powerups.push(...sector.powerups)
		}

		return Array(physics.join(','), scenery.join(','), powerups.join(','), this.firstPlayer.vehicle.name).join('#')
	}
}