import Item from "./Item.js";

export default class extends Item {
	id = self.crypto.randomUUID(); // generate ID based on position and timestamp?
	get used() { // collected
		return this.scene.firstPlayer.consumablesUsed.has(this.id)
	}

	activate(part) {
		part.player.consumablesUsed.add(this.id)
	}

	draw(ctx, position = this.position.toPixel()) {
		ctx.beginPath();
		ctx.arc(position.x, position.y, 7 * this.scene.camera.zoom, 0, 2 * Math.PI);
		ctx.save();
		ctx.fillStyle = this.used ? this.constructor.color.replaceAll('0', 'a') : this.constructor.color;
		ctx.fill();
		ctx.restore();
		ctx.stroke()
	}

	collide(part) {
		// part.position.distanceTo(this.position) < part.size + this.size + ctx.lineWidth
		if (part.position.distanceToSquared(this.position) >= 500 || part.player.dead || part.player.consumablesUsed.has(this.id)) {
			return;
		}

		this.activate(part)
	}

	toJSON() {
		return Object.assign(super.toJSON(), {
			id: this.id
		})
	}
}