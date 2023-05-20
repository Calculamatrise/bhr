import Item from "./Item.js";

export default class extends Item {
	id = self.crypto.randomUUID();
	get used() {
		return this.scene.firstPlayer.itemsCollected.has(this.id);
	}

	draw(ctx, position = this.position.toPixel()) {
		ctx.beginPath();
		ctx.arc(position.x, position.y, 7 * this.scene.zoom, 0, 2 * Math.PI);
		ctx.save();
		ctx.fillStyle = this.used ? this.constructor.color.replaceAll('0', 'a') : this.constructor.color;
		ctx.fill();
		ctx.restore();
		ctx.stroke();
	}

	collide(part) {
		if (part.position.distanceToSquared(this.position) > 500 || part.parent.parent.dead || part.parent.parent.itemsCollected.has(this.id)) {
			return;
		}

		part.parent.parent.itemsCollected.add(this.id);
		this.activate(part);
	}
}