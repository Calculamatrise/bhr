import Vector from "../../Vector.js";

export default class Spring {
	dampConstant = .5;
	leff = 40;
	lrest = 40;
	springConstant = .7;
	constructor(a, b) {
		this.a = a;
		this.b = b;
	}

	get vector() {
		return this.b.position.difference(this.a.position);
	}

	get length() {
		return this.vector.length;
	}

	lean(rotation) {
		this.leff += (this.lrest - rotation - this.leff) / 5;
	}

	rotate(a) {
		let b = this.b.position.difference(this.a.position);
		b = new Vector(-b.y / this.leff, b.x / this.leff);
		this.a.position.add(b.scale(a));
		this.b.position.add(b.scale(-a));
	}

	swap() {
		let a = this.a.position.clone();
		this.a.position.set(this.b.position);
		this.b.position.set(a);
		// a.set(this.a.displayPosition);
		// this.a.displayPosition.set(this.b.displayPosition);
		// this.b.displayPosition.set(a);
		a.set(this.a.old);
		this.a.old.set(this.b.old);
		this.b.old.set(a);
		a.set(this.a.velocity);
		this.a.velocity.set(this.b.velocity);
		this.b.velocity.set(a);
		a = this.a.rotationSpeed;
		this.a.rotationSpeed = this.b.rotationSpeed;
		this.b.rotationSpeed = a
	}

	fixedUpdate() {
		let distance = this.b.position.difference(this.a.position);
		let length = distance.length;
		if (length < 1) return;
		distance = distance.scale(1 / length);
		let force = distance.scale((length - this.leff) * this.springConstant);
		force.add(distance.scale(this.b.velocity.difference(this.a.velocity).dot(distance) * this.dampConstant));
		this.b.velocity.add(force.scale(-1));
		this.a.velocity.add(force);
	}
}