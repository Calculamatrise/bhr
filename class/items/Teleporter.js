import Consumable from "./Consumable.js";
import Coordinates from "../Coordinates.js";

export default class Teleporter extends Consumable {
	alt = null;
	type = 'W';
	constructor() {
		super(...arguments);
		arguments.length > 3 && this.createAlt(arguments[arguments.length - 2], arguments[arguments.length - 1]);
	}

	createAlt(x, y) {
		this.alt = new Coordinates(x, y);
	}

	draw(ctx) {
		super.draw(ctx);
		this.alt && super.draw(ctx, this.alt.toPixel())
	}

	collide(part) {
		if (this.alt === null) return;
		if (part.position.distanceToSquared(this.alt) < 500 && !part.player.dead && !part.player.consumablesUsed.has(this.id)) {
			part.player.consumablesUsed.add(this.id);
			this.activate(part, true);
			return
		}

		super.collide(part);
	}

	activate(part, alt = false) {
		if (alt) {
			return part.parent.move(this.position.x - this.alt.x, this.position.y - this.alt.y)
		}

		part.parent.move(this.alt.x - this.position.x, this.alt.y - this.position.y)
	}

	erase(vector) {
		let erase = vector.distanceTo(this.alt) < this.scene.toolHandler.currentTool.size + this.size || super.erase(vector);
		erase && this.scene.grid.removeItem(this);
		return false
	}

	toJSON() {
		return Object.assign(super.toJSON(), {
			alt: this.alt.toJSON()
		})
	}

	toString() {
		return this.type + ' ' + this.position.toString() + ' ' + this.alt.toString()
	}

	static color = '#f0f';
	static type = 'W';
}