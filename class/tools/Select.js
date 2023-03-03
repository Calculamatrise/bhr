import Tool from "./Tool.js";

import Vector from "../Vector.js";

export default class extends Tool {
	points = [];
	selected = [];
	clip() {
		this.selected = [];
		let min = new Vector(this.points[0], this.points[1]).toCanvas(this.scene.parent.canvas);
		let max = new Vector(this.points[0] + this.points[2], this.points[1] + this.points[3]).toCanvas(this.scene.parent.canvas);
		for (const sector of this.scene.grid.range(min.map((value) => Math.floor(value / this.scene.grid.scale)), max.map((value) => Math.floor(value / this.scene.grid.scale)))) {
			if (sector.physics.length <= 0 && sector.scenery.length <= 0) {
				continue;
			}

			this.selected.push(...sector.search(min, max));
		}

		// don't remove until deselect is called
		this.points = [];
	}

	deleteSelected() {
		if (this.selected.length < 1) {
			return;
		}

		for (const object of this.selected) {
			object.remove();
		}

		this.selected = [];
	}

	draw(ctx) {
		let position = this.mouse.position.toPixel();
		if (this.points.length > 0) {
			ctx.save(),
			ctx.beginPath(),
			ctx.strokeStyle = '#87CEEB',
			ctx.fillStyle = '#87CEEB80',
			ctx.lineWidth = Math.max(2 * this.scene.zoom, 0.5),
			ctx.rect(...this.points),
			ctx.fill(),
			ctx.stroke(),
			ctx.restore();
		}

		ctx.beginPath(),
		ctx.lineWidth = 2 * window.devicePixelRatio,
		ctx.moveTo(position.x - 10 * window.devicePixelRatio, position.y),
		ctx.lineTo(position.x + 10 * window.devicePixelRatio, position.y),
		ctx.moveTo(position.x, position.y + 10 * window.devicePixelRatio),
		ctx.lineTo(position.x, position.y - 10 * window.devicePixelRatio),
		ctx.stroke(),
		ctx.restore();
	}

	rect() {
		return Array(...arguments);
	}

	stroke() {
		if (!this.mouse.down || this.mouse.old.distanceTo(this.mouse.position) < 4) {
			return;
		}

		let position = this.mouse.position.toPixel();
		let old = this.mouse.old.toPixel();
		let x = position.x - old.x > 0 ? old.x : position.x;
		let y = position.y - old.y > 0 ? old.y : position.y;
		this.points = this.rect(x, y, Math.abs(position.x - old.x), Math.abs(position.y - old.y));
	}
}