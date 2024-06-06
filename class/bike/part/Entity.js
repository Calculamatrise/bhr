import Coordinates from "../../Coordinates.js";

export default class {
	old = new Coordinates();
	position = new Coordinates();
	size = 10;
	velocity = new Coordinates();
	displayPosition = this.position;
	constructor(parent, options) {
		Object.defineProperty(this, 'player', { value: parent || null });
		if (options instanceof Object) {
			for (const key in options) {
				const value = options[key];
				switch (key) {
				case 'position':
				case 'velocity':
					typeof value == 'object' && this[key].set(value);
					break;
				case 'size':
					typeof value == 'number' || typeof value == 'string' && (this[key] = value)
				}
			}
		}

		this.displayPosition = this.position;
		this.old.set(this.position);
		Object.defineProperty(this.position, 'old', { value: this.position.clone(), writable: true })
	}

	fixedUpdate() {
		this.displayPosition = this.position
	}

	update(progress) {
		this.displayPosition = this.position.sum(this.velocity.scale(progress))
	}

	clone() {
		const clone = new this.constructor(this.player);
		clone.position.set(this.position);
		clone.old.set(this.old);
		clone.velocity.set(this.velocity);
		clone.size = this.size;
		return clone
	}
}