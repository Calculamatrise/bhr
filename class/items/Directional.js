import Item from "./Item.js";
import Coordinates from "../Coordinates.js";

export default class Triangle extends Item {
	constructor() {
		super(...arguments);
		this.rotation = Math.max(arguments[3], 0);
	}

	get dir() {
		return new Coordinates(-Math.sin(this.rotation * Math.PI / 180), Math.cos(this.rotation * Math.PI / 180))
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.save();
		let position = this.position.toPixel();
		ctx.translate(position.x, position.y);
		ctx.rotate(this.rotation * Math.PI / 180);
		ctx.moveTo(-7 * this.scene.camera.zoom, -10 * this.scene.camera.zoom);
		ctx.lineTo(0, 10 * this.scene.camera.zoom);
		ctx.lineTo(7 * this.scene.camera.zoom, -10 * this.scene.camera.zoom);
		ctx.closePath();
		ctx.fillStyle = this.constructor.color;
		ctx.fill();
		ctx.restore();
		ctx.stroke();
	}

	collide(part) {
		if (part.position.distanceToSquared(this.position) > 1e3) return;
		this.activate(part)
	}

	toJSON() {
		return Object.assign(super.toJSON(), {
			dir: this.dir.toJSON(),
			rotation: this.rotation
		})
	}

	toString() {
		return this.type + ' ' + this.position.toString() + ' ' + (this.rotation - 180).toString(32)
	}
}