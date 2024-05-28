import Item from "./Item.js";

export default class GravitationalField extends Item {
	size = 16;
	// activate(part) {
	// 	part.parent.parent.gravity.set(this.dir.scale(.3));
	// }

	update() {
		// constantly pull masses in radius
	}

	static color = '#0f0';
	static type = 'F';
}