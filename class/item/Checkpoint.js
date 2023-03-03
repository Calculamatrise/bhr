import SingleUseItem from "./SingleUseItem.js";

export default class Checkpoint extends SingleUseItem {
	type = 'C';
	static color = '#00f';
	activate(part) {
		if (part.parent.parent.ghost) {
			return;
		}

		part.parent.parent.pendingConsumables |= 1;
	}
}