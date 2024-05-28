import Shard from "./Shard.js";

export default class Explosion {
	duration = 80; // duration in milliseconds
	size = 24 + 16 * Math.random();
	constructor(parent, part) {
		Object.defineProperty(this, 'parent', { value: parent || null });
		this.position = part.position.clone();
		this.shards = [
			new Shard(this, this.position),
			new Shard(this, this.position),
			new Shard(this, this.position),
			new Shard(this, this.position),
			new Shard(this, this.position)
		];
		this.sizeDiminution = this.size / (this.duration / (this.parent.scene.parent.ups / 2));
	}

	draw(ctx) {
		if (this.size > 0) {
			// this.size -= this.sizeDiminution;
			ctx.beginPath()
			let position = this.position.toPixel();
			ctx.moveTo(position.x + this.size / 2 * Math.cos(Math.random() * 2 * Math.PI) * this.parent.scene.camera.zoom, position.y + this.size / 2 * Math.sin(Math.random() * 2 * Math.PI) * this.parent.scene.camera.zoom);
			for (let a = 1; a < 16; a++) {
				let d = (this.size + 30 * Math.random()) / 2 * this.parent.scene.camera.zoom;
				ctx.lineTo(position.x + d * Math.cos(Math.random() * 2 * Math.PI + 2 * Math.PI * a / 16), position.y + d * Math.sin(Math.random() * 2 * Math.PI + 2 * Math.PI * a / 16));
			}

			ctx.save()
			ctx.fillStyle = '#ff0'
			ctx.fill()
			ctx.restore();
		}

		for (const shard of this.shards) {
			shard.draw(ctx);
		}
	}

	fixedUpdate() {
		this.size -= this.sizeDiminution;
		for (const shard of this.shards) {
			shard.fixedUpdate();
		}
	}

	update(progress, delta) {
		for (const shard of this.shards) {
			shard.update(...arguments);
		}
	}
}