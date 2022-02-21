import Item from "./Item.js";

export default class SingleUseItem extends Item {
	id = ++super.constructor.count;
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

        if (part.parent.parent.itemsCollected.has(this.id)) {
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