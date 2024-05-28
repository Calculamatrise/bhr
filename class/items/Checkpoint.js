import Collectable from "./Consumable.js";

export default class Checkpoint extends Collectable {
	activate(part) {
		super.activate(part);
		if (part.parent.parent.ghost) return;
		part.parent.parent.pendingConsumables |= 1
		// part.parent.parent.discreteEvents.add('checkpointReached')
	}

	static color = '#00f';
	static type = 'C';
}