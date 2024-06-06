import Collectable from "./Consumable.js";

export default class Checkpoint extends Collectable {
	activate(part) {
		super.activate(part);
		if (part.player.ghost) return;
		part.player.pendingConsumables |= 1
		// part.player.discreteEvents.add('checkpointReached')
	}

	static color = '#00f';
	static type = 'C';
}