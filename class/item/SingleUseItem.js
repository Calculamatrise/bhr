import Item from "./Item.js";

export default class SingleUseItem extends Item {
	used = false;
	collide(part) {
		if (part.position.distanceToSquared(this.position) > 500) {
			return;
		}

		if (this.used) {
			return;
		}

		if (part.parent.parent.dead) {
			return;
		}

		part.parent.parent.powerupsConsumed.push(this.id);

		this.activate(part);
		if (part.parent.ghost) {
			return;
		}

		this.used = true;
	}
}