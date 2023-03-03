import Vector from "../Vector.js";

export default class Item {
	scene = null;
	removed = false;
	static count = 0;
	constructor(scene, x, y) {
		this.scene = scene;
		this.position = new Vector(x, y);
	}

	static draw(ctx, position = this.position.toPixel()) {
		ctx.beginPath(),
		ctx.fillStyle = this.constructor.color,
		ctx.strokeStyle = this.scene.parent.settings.theme == 'dark' ? '#fbfbfb' : '#000',
		ctx.arc(position.x, position.y, 7 * this.scene.zoom, 0, 2 * Math.PI),
		ctx.fill(),
		ctx.stroke();
	}

	draw() {
		this.constructor.draw.apply(this, arguments);
	}

	collide(part) {
		if (part.position.distanceToSquared(this.position) < 500) {
			this.activate(part);
		}
	}

	erase(vector) {
		if (vector.distanceTo(this.position) < this.scene.toolHandler.currentTool.size + 7) {
			return this.remove();
		}

		return false;
	}

	remove() {
		this.removed = true;
		this.scene.remove(this.position);
		return this;
	}

	toString() {
		return this.type + ' ' + this.position.toString();
	}
}