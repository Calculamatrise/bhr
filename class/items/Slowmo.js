import Item from "./Item.js";

export default class Slowmo extends Item {
	activate(part) { part.parent.parent.slow = true }
	static color = '#eee';
	static type = 'S';
}