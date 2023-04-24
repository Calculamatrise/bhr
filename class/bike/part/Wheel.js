import Entity from "./Entity.js";

export default class extends Entity {
	motor = 0;
	pedalSpeed = 0;
	draw(ctx) {
		let position = this.position.toPixel();
		ctx.beginPath();
		ctx.arc(position.x, position.y, this.size * this.parent.parent.scene.zoom - ctx.lineWidth / 2, 0, 2 * Math.PI);
		ctx.stroke();
	}

	drive(velocity) {
		this.position.add(velocity.scale(this.motor * this.parent.dir));
		if (this.parent.parent.gamepad.downKeys.has('down')) {
			this.position.add(velocity.scale(.3 * -velocity.dot(this.velocity)));
		}

		this.pedalSpeed = velocity.dot(this.velocity) / this.size;
		this.touching = true;
	}
}