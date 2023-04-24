import Triangle from "./Triangle.js";

export default class Boost extends Triangle {
	type = 'B';
	static color = '#ff0';
	activate(part) {
		for (const mass of part.parent.masses || part.parent.points) {
			mass.position.add(this.dir);
		}
	}
}