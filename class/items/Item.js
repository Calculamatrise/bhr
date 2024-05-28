import Coordinates from "../Coordinates.js";

export default class {
	sectors = new Set()
	size = 7;
	type = this.constructor.type;
	constructor(scene, x, y) {
		Object.defineProperty(this, 'scene', { value: scene || null });
		this.position = new Coordinates(x, y)
	}

	draw(ctx, position = this.position.toPixel()) {
		ctx.beginPath();
		ctx.arc(position.x, position.y, this.size * this.scene.camera.zoom, 0, 2 * Math.PI);
		let fillStyle = ctx.fillStyle;
		ctx.fillStyle = this.constructor.color;
		ctx.fill();
		ctx.fillStyle = fillStyle;
		ctx.stroke()
	}

	collide(part) {
		part.position.distanceToSquared(this.position) < 500 && this.activate(part)
	}

	erase(vector) {
		return vector.distanceTo(this.position) < this.scene.toolHandler.currentTool.size + this.size
	}

	remove() {
		this.scene.grid.removeItem(this);
		this.removed = true;
		return this
	}

	toJSON() {
		return {
			position: this.position.toJSON(),
			size: this.size
		}
	}

	toString() {
		return this.constructor.type + ' ' + this.position.toString()
	}

	static clip() {}
	static draw(ctx) {
		this.prototype.draw.call(this, ctx);
		return;
		// let position = this.mouse.position.toPixel();
		ctx.beginPath();
		ctx.arc(position.x, position.y, 7 * this.scene.camera.zoom, 0, 2 * Math.PI);
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