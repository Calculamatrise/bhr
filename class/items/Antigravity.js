import Item from "./Item.js";

export default class Antigravity extends Item {
	activate(part) { part.parent.parent.gravity.set({ x: 0, y: 0 }) }
	static color = '#0ff';
	static type = 'A';
}