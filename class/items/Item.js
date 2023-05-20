import Vector from "../Vector.js";

export default class {
	scene = null;
	size = 7;
	removed = false;
	constructor(scene, x, y) {
		this.scene = scene;
		this.position = new Vector(x, y);
	}

	draw(ctx, position = this.position.toPixel()) {
		ctx.beginPath();
		ctx.arc(position.x, position.y, 7 * this.scene.zoom, 0, 2 * Math.PI);
		ctx.save();
		ctx.fillStyle = this.constructor.color;
		ctx.fill();
		ctx.restore();
		ctx.stroke();
	}

	collide(part) {
		part.position.distanceToSquared(this.position) < 500 && this.activate(part);
	}

	erase(vector) {
		return vector.distanceTo(this.position) < this.scene.toolHandler.currentTool.size + this.size && this.remove();
	}

	remove() {
		this.removed = true;
		this.scene.remove(this);
		return this;
	}

	toString() {
		return this.type + ' ' + this.position.toString();
	}

	static clip() {}
	static draw(ctx) {
		this.prototype.draw.call(this, ctx);
		return;
		// let position = this.mouse.position.toPixel();
		ctx.beginPath();
		ctx.arc(position.x, position.y, 7 * this.scene.zoom, 0, 2 * Math.PI);
		ctx.save();
		ctx.fillStyle = this.constructor.color;
		ctx.fill();
		ctx.restore();
		ctx.stroke();
	}

	static press() {
		this.anchor = this.mouse.position.clone();
		this.addPowerup(new this(this.scene, this.mouse.old.x, this.mouse.old.y));
	}

	static scroll() {}
	static stroke() {}
}