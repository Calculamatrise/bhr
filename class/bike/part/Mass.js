import Vector from "../../Vector.js";

export default class {
	friction = 0;
	collide = true;
	friction = 0;
	old = new Vector();
	position = new Vector();
	size = 10;
	touching = false;
	velocity = new Vector();
	constructor(parent) {
		this.parent = parent;
	}
}