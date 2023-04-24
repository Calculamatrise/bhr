import PhysicsLine from "./PhysicsLine.js";
import SceneryLine from "./SceneryLine.js";

export default class {
	physics = []
	scenery = []
	powerups = []
	rendered = false;
	// cache separate canvas for scenery lines
	canvas = document.createElement('canvas'); // new OffscreenCanvas(0,0)
	ctx = this.canvas.getContext('2d');
	constructor(parent, row, column) {
		this.parent = parent;
		this.row = row;
		this.column = column;
		this.resize();
	}

	// don't necessarily have to redraw every single line.
	// when a line is added, it can be drawn normally on top of the canvas.
	cache() {
		let offsetX = this.row * this.parent.scale * this.parent.scene.zoom;
		let offsetY = this.column * this.parent.scale * this.parent.scene.zoom;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.strokeStyle = /^(dark|midnight)$/i.test(this.parent.scene.parent.settings.theme) ? '#666' : '#aaa';
		for (const line of this.scenery) {
			line.draw(this.ctx, offsetX, offsetY);
		}

		this.ctx.strokeStyle = /^dark$/i.test(this.parent.scene.parent.settings.theme) ? '#fbfbfb' : /^midnight$/i.test(this.parent.scene.parent.settings.theme) ? '#ccc' : '#000';
		for (const line of this.physics) {
			line.draw(this.ctx, offsetX, offsetY);
		}

		this.rendered = true;
		// this.parent.scene.parent.emit('sceneCached');
	}

	render(ctx) {
		let offsetX = this.row * this.parent.scale * this.parent.scene.zoom;
		let offsetY = this.column * this.parent.scale * this.parent.scene.zoom;
		if (!this.rendered) {
			this.cache();
		}

		ctx.drawImage(this.canvas, Math.floor(ctx.canvas.width / 2 - this.parent.scene.camera.x * this.parent.scene.zoom + offsetX), Math.floor(ctx.canvas.height / 2 - this.parent.scene.camera.y * this.parent.scene.zoom + offsetY));
		// ctx.drawImage(this.canvas, Math.floor(ctx.canvas.width / 2 - this.parent.scene.camera.x * this.parent.scene.zoom + offsetX), Math.floor(ctx.canvas.height / 2 - this.parent.scene.camera.y * this.parent.scene.zoom + offsetY));
	}

	resize() {
		this.canvas.width = this.parent.scale * this.parent.scene.zoom;
		this.canvas.height = this.parent.scale * this.parent.scene.zoom;
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = Math.max(2 * this.parent.scene.zoom, 0.5);
		// this.ctx.setTransform(this.parent.scene.zoom, 0, 0, this.parent.scene.zoom, 0, 0);
		this.rendered = false;
	}

	fix() { // escape collision
		for (const line of this.physics) {
			line.collided = false;
		}
	}

	collide(part) {
		for (let line = this.physics.length - 1; line >= 0; line--) {
			this.physics[line].collide(part);
		}

		if (!part.parent.dead) {
			for (let powerup = this.powerups.length - 1; powerup >= 0; powerup--) {
				this.powerups[powerup].collide(part);
			}
		}
	}

	search(min, max) {
		const filter = ({ a, b }) => (min.x < a.x && a.x < max.x && min.y < a.y && a.y < max.y) || (min.x < b.x && b.x < max.x && min.y < b.y && b.y < max.y);
		return {
			physics: this.physics.filter(filter),
			scenery: this.scenery.filter(filter),
			powerups: this.powerups.filter(({ position }) => min.x < position.x && position.x < max.x && min.y < position.y && position.y < max.y)
		}
	}

	erase(vector) {
		let cache = [];
		if (!this.parent.scene.toolHandler.currentTool.ignoring.has('physics')) {
			for (let line of this.physics) {
				(line = line.erase(vector)) && cache.push(line);
			}
		}

		if (!this.parent.scene.toolHandler.currentTool.ignoring.has('scenery')) {
			for (let line of this.scenery) {
				(line = line.erase(vector)) && cache.push(line);
			}
		}

		if (!this.parent.scene.toolHandler.currentTool.ignoring.has('powerups')) {
			for (let powerup of this.powerups) {
				(powerup = powerup.erase(vector)) && cache.push(powerup);
			}
		}

		return cache;
	}

	remove(item) {
		if (item instanceof PhysicsLine) {
			this.physics.splice(this.physics.indexOf(item), 1);
		} else if (item instanceof SceneryLine) {
			this.scenery.splice(this.scenery.indexOf(item), 1);
		} else {
			this.powerups.splice(this.powerups.indexOf(item), 1);
			const collectable = this.parent.scene.collectables.indexOf(item);
			if (collectable !== -1) {
				this.parent.scene.collectables.splice(collectable, 1);
			}
		}

		this.rendered = false;
	}

	delete() {
		return this.parent.rows.has(this.row) && this.parent.rows.get(this.row).delete(this.column);
	}
}