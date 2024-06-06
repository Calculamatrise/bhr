import Item from "./Item.js";

export default class Bomb extends Item {
	activate(part) {
		part.player.dead || part.player.createExplosion(part);
	}

	static color = '#f00';
	static type = 'O';
}