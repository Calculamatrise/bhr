import Collectable from "./Consumable.js";

export default class Target extends Collectable {
	activate(part) {
		super.activate(part);
		if (part.player.ghost) return;
		part.player.scene.discreteEvents.add('TARGET');
		part.player.pendingConsumables |= 2
	}

	static color = '#ff0';
	static type = 'T';
}