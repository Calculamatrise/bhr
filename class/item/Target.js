import SingleUseItem from "./SingleUseItem.js";

export default class Target extends SingleUseItem {
	type = 'T';
	static color = '#ff0'
	activate(part) {
		if (part.parent.parent.ghost) {
			return;
		}

		part.parent.parent.pendingConsumables |= 2;
	}
}