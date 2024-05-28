import Item from "./Item.js";

export default class Bomb extends Item {
	activate(part) {
		part.parent.parent.dead || part.parent.parent.createExplosion(part);
	}

	static color = '#f00';
	static type = 'O';
}