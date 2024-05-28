import Collectable from "./Consumable.js";

export default class Target extends Collectable {
	activate(part) {
		super.activate(part);
		if (part.parent.parent.ghost) return;
		part.parent.parent.scene.discreteEvents.add('TARGET');
		part.parent.parent.pendingConsumables |= 2
	}

	static color = '#ff0';
	static type = 'T';
}