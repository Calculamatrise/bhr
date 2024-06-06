import Item from "./Item.js";

export default class Slowmo extends Item {
	activate(part) { part.player.slow = true }
	static color = '#eee';
	static type = 'S';
}