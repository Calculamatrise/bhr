import Coordinates from "../../Coordinates.js";

export default class {
	old = new Coordinates();
	position = new Coordinates();
	size = 10;
	velocity = new Coordinates();
	displayPosition = this.position.add(this.velocity);
	constructor(parent, options) {
		Object.defineProperty(this, 'parent', { value: parent || null });
		for (const key in options = Object.assign({}, options)) {
			const value = options[key];
			switch (key) {
			case 'position':
			case 'velocity':
				typeof value == 'object' && this[key].set(value);
				break;
			case 'size':
				typeof value == 'number' || typeof value == 'string' && (this[key] = value);
				break;
			}
		}

		this.displayPosition = this.position.add(this.velocity);
		this.old.set(this.position);
		this.position.old = this.position.clone()
	}

	fixedUpdate() {
		this.displayPosition = this.position
	}

	update(progress) {
		this.displayPosition = this.position.sum(this.velocity.scale(progress))
	}
}