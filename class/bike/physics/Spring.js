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

	get length() {
		return this.b.position.difference(this.a.position).length;
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
		let a = new Vector;
		a.set(this.a.position);
		this.a.position.set(this.b.position);
		this.b.position.set(a);
		a.set(this.a.old);
		this.a.old.set(this.b.old);
		this.b.old.set(a);
		a.set(this.a.velocity);
		this.a.velocity.set(this.b.velocity);
		this.b.velocity.set(a);
		a = this.a.pedalSpeed;
		this.a.pedalSpeed = this.b.pedalSpeed;
		this.b.pedalSpeed = a
	}

	update() {
		let a = this.b.position.difference(this.a.position),
			b = a.length;
		if (1 > b) return this;
		a = a.scale(1 / b);
		b = a.scale((b - this.leff) * this.springConstant);
		b.add(a.scale(this.b.velocity.difference(this.a.velocity).dot(a) * this.dampConstant));
		this.b.velocity.add(b.scale(-1));
		this.a.velocity.add(b);
	}
}