import Mass from "./Mass.js";

export default class extends Mass {
	motor = 0.3;
	rotationSpeed = 0;
	speed = 0;
	collide(vector) {
		this.position.add(vector.scale(this.speed * this.player.vehicle.dir));
		this.player.dead || (this.player.gamepad.downKeys.has('down') && this.addFriction(vector));
		this.rotationSpeed = vector.dot(this.velocity) / this.size;
		this.touching = true;
	}

	draw(ctx) {
		let position = this.displayPosition.toPixel();
		ctx.beginPath();
		ctx.arc(position.x, position.y, this.size * this.player.scene.camera.zoom - ctx.lineWidth / 2, 0, 2 * Math.PI);
		ctx.stroke();
	}
}