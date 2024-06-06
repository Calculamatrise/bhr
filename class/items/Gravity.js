import Triangle from "./Directional.js";

export default class Gravity extends Triangle {
	activate(part) { part.player.gravity.set(this.dir.scale(.3)) }
	static color = '#0f0';
	static type = 'G';
}