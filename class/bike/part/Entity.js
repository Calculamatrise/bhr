import Vector from "../../Vector.js";

export default class {
	old = new Vector();
	position = new Vector();
	size = 10;
	velocity = new Vector();
	displayPosition = this.position.add(this.velocity);
	constructor(parent, options) {
		this.parent = parent;
		for (const key in options = Object.assign({}, options)) {
			const option = options[key];
			switch (key) {
				case 'position':
				case 'velocity': {
					typeof option == 'object' && this[key].set(option);
					break;
				}

				case 'size': {
					if (typeof option == 'number' || typeof option == 'string') {
						this[key] = option;
					}
					break;
				}
			}
		}

		this.displayPosition = this.position.add(this.velocity);
		this.old.set(this.position);
		this.position.old = this.position.clone();
	}

	fixedUpdate() {
		this.displayPosition = this.position;
	}

	update(progress) {
		this.displayPosition = this.position.sum(this.velocity.scale(progress));
	}
}