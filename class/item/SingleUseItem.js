import Item from "./Item.js";

export default class SingleUseItem extends Item {
	id = ++super.constructor.count;
	used = false;
	draw(ctx, position = this.position.toPixel()) {
		ctx.beginPath(),
		ctx.fillStyle = this.used ? this.constructor.color.replaceAll('0', 'a') : this.constructor.color,
		ctx.strokeStyle = this.scene.parent.settings.theme == 'dark' ? '#fbfbfb' : '#000',
		ctx.arc(position.x, position.y, 7 * this.scene.zoom, 0, 2 * Math.PI),
		ctx.fill(),
		ctx.stroke();
	}

	collide(part) {
		if ((part.position.distanceToSquared(this.position) > 500) || this.used || part.parent.parent.dead || part.parent.parent.itemsCollected.has(this.id)) {
			return;
		}

		part.parent.parent.itemsCollected.add(this.id);
		this.activate(part);
		if (part.parent.parent.ghost) {
			return;
		}

		this.used = true;
	}
}