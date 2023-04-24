import Vector from "../Vector.js";
import Entity from "./part/Entity.js";
import Wheel from "./part/Wheel.js";
import Spring from "./physics/Spring.js";

export default class {
	dir = 1;
	pedalSpeed = 0;
	masses = [];
	rotationFactor = 0;
	springs = [];
	constructor(parent) {
		this.parent = parent;

		this.head = new Entity(this);
		this.head.drive = this.destroy.bind(this);
		this.rearWheel = new Wheel(this);
		this.frontWheel = new Wheel(this);

		this.rearSpring = new Spring(this.head, this.rearWheel);
		this.chasse = new Spring(this.rearWheel, this.frontWheel);
		this.frontSpring = new Spring(this.frontWheel, this.head);

		this.masses.push(this.head, this.frontWheel, this.rearWheel);
		this.springs.push(this.rearSpring, this.chasse, this.frontSpring);
	}

	get rider() {
		const rider = {};

		let t = this.frontWheel.position.difference(this.rearWheel.position);
		let e = new Vector(t.y, -t.x).scale(this.dir);
		let s = new Vector(Math.cos(this.pedalSpeed), Math.sin(this.pedalSpeed)).scale(6);

		rider.head = this.rearWheel.position.sum(t.scale(0.35)).sum(this.head.position.difference(this.frontWheel.position.sum(this.rearWheel.position).scale(0.5)).scale(1.2));
		rider.hand = this.rearWheel.position.sum(t.scale(0.8)).sum(e.scale(0.68));
		rider.shadowHand = rider.hand.clone();

		let i = rider.head.difference(rider.hand);
		i = new Vector(i.y, -i.x).scale(this.dir);

		rider.elbow = rider.head.sum(rider.hand).scale(0.5).sum(i.scale(130 / i.lengthSquared()));
		rider.shadowElbow = rider.elbow.clone();
		rider.hip = this.rearWheel.position.sum(t.scale(0.2).sum(e.scale(0.5)));
		rider.foot = this.rearWheel.position.sum(t.scale(0.4)).sum(e.scale(0.05)).sum(s);

		i = rider.hip.difference(rider.foot);
		i = new Vector(-i.y, i.x).scale(this.dir);

		rider.knee = rider.hip.sum(rider.foot).scale(0.5).sum(i.scale(160 / i.lengthSquared()));
		rider.shadowFoot = this.rearWheel.position.sum(t.scale(0.4)).sum(e.scale(0.05)).difference(s);

		i = rider.hip.difference(rider.shadowFoot);
		i = new Vector(-i.y, i.x).scale(this.dir);

		rider.shadowKnee = rider.hip.sum(rider.shadowFoot).scale(0.5).sum(i.scale(160 / i.lengthSquared()));
		return rider;
	}

	swap() {
		this.dir *= -1;
		this.chasse.swap();
		let rearSpring = this.rearSpring.leff;
		this.rearSpring.leff = this.frontSpring.leff;
		this.frontSpring.leff = rearSpring;
	}

	update(delta) {
		if (!this.parent.dead)
			this.updateControls();

		for (let a = this.springs.length - 1; a >= 0; a--) {
			this.springs[a].update();
		}

		for (let a = this.masses.length - 1; a >= 0; a--) {
			this.masses[a].update(delta);
		}

		if (this.rearWheel.touching && this.frontWheel.touching) {
			this.parent.slow = false;
		}

		if (!this.parent.slow && !this.parent.dead) {
			this.updateControls();
			for (let a = this.springs.length - 1; a >= 0; a--) {
				this.springs[a].update();
			}

			for (let a = this.masses.length - 1; a >= 0; a--) {
				this.masses[a].update(delta);
			}
		}
	}

	updateControls() {
		this.rearWheel.motor += (this.parent.gamepad.downKeys.has('up') - this.rearWheel.motor) / 10;
		let rotate = this.parent.gamepad.downKeys.has('left') - this.parent.gamepad.downKeys.has('right');
		this.rearSpring.lean(rotate * this.dir * 5);
		this.frontSpring.lean(-rotate * this.dir * 5);
		this.chasse.rotate(rotate / this.rotationFactor);
		if (this.parent.gamepad.downKeys.has('up')) {
			this.pedalSpeed += this.rearWheel.pedalSpeed / 5;
			if (!rotate) {
				this.rearSpring.lean(-7);
				this.frontSpring.lean(7);
			}
		}
	}

	move(x, y) {
		for (const mass of this.masses) {
			mass.position.x += x;
			mass.position.y += y;
			mass.old.x += x;
			mass.old.y += y;
		}
	}

	destroy() {
		this.parent.dead = true;
		this.head.collide = false;
		this.rearWheel.motor = 0;
		this.parent.createRagdoll();
	}

	clone() {
		const clone = new this.constructor(this.parent);
		clone.dir = this.dir;

		clone.head.position.set(this.head.position);
		clone.head.old.set(this.head.old);
		clone.head.velocity.set(this.head.velocity);

		clone.frontWheel.position.set(this.frontWheel.position);
		clone.frontWheel.old.set(this.frontWheel.old);
		clone.frontWheel.velocity.set(this.frontWheel.velocity);

		clone.rearWheel.position.set(this.rearWheel.position);
		clone.rearWheel.old.set(this.rearWheel.old);
		clone.rearWheel.velocity.set(this.rearWheel.velocity);
		clone.rearWheel.motor = this.rearWheel.motor;

		clone.rearSpring.leff = this.rearSpring.leff;
		clone.chasse.leff = this.chasse.leff;
		clone.frontSpring.leff = this.frontSpring.leff;
		return clone;
	}
}