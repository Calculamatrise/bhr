import Tool from "./Tool.js";

export default class extends Tool {
	anchor = null;
	scenery = false;
	clip() {
		if (this.anchor !== null) {
			this.scene.addLine(this.anchor, this.mouse.position, this.scenery);
			this.anchor = null;
		}
	}

	draw(ctx) {
		let position = this.mouse.position.toPixel();
		if (this.scene.cameraLock && this.anchor !== null) {
			let old = this.anchor.toPixel();
			let start = position.x < 50;
			let end = position.x > this.scene.parent.canvas.width - 50;
			if (start || end) {
				this.scene.camera.x += 4 / this.scene.zoom * (1 + (start && -2));
				this.mouse.position.x += 4 / this.scene.zoom * (1 + (start && -2));
			}

			start = position.y < 50;
			end = position.y > this.scene.parent.canvas.height - 50;
			if (start || end) {
				this.scene.camera.y += 4 / this.scene.zoom * (1 + (start && -2));
				this.mouse.position.y += 4 / this.scene.zoom * (1 + (start && -2));
			}

			position = this.mouse.position.toPixel();
			ctx.save(),
			ctx.beginPath(),
			ctx.lineWidth = Math.max(2 * this.parent.scene.zoom, 0.5),
			ctx.strokeStyle = '#f00',
			ctx.moveTo(old.x, old.y),
			ctx.lineTo(position.x, position.y),
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

	press() {
		this.anchor = this.mouse.position.clone();
	}
}