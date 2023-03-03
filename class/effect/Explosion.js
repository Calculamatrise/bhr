import BodyPart from "../bike/part/Entity.js";
import Shard from "./Shard.js";

export default class Explosion {
	motor = 30 + 20 * Math.random();
	constructor(parent, part) {
		this.parent = parent;

		this.head = new BodyPart(this.position, this);
		this.head.velocity.x = 20;
		this.position = part.position.clone();
		this.shards = [
			new Shard(this.parent, this.position),
			new Shard(this.parent, this.position),
			new Shard(this.parent, this.position),
			new Shard(this.parent, this.position),
			new Shard(this.parent, this.position)
		]
	}

	draw(ctx) {
		if (this.motor > 0) {
			this.motor -= 10;

			const position = this.position.toPixel();
			ctx.save(),
			ctx.beginPath(),
			ctx.fillStyle = '#ff0',
			ctx.moveTo(position.x + this.motor / 2 * Math.cos(Math.random() * 2 * Math.PI), position.y + this.motor / 2 * Math.sin(Math.random() * 2 * Math.PI));
			for (let a = 1; a < 16; a++) {
				let d = (this.motor + 30 * Math.random()) / 2;
				ctx.lineTo(position.x + d * Math.cos(Math.random() * 2 * Math.PI + 2 * Math.PI * a / 16), position.y + d * Math.sin(Math.random() * 2 * Math.PI + 2 * Math.PI * a / 16));
			}

			ctx.fill();
			ctx.restore();
		}

		for (const shard of this.shards) {
			shard.draw(ctx);
		}
	}

	update(delta) {
		for (const shard of this.shards) {
			shard.update(delta);
		}
	}
}