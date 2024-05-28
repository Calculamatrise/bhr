import Coordinates from "../Coordinates.js";
import Mass from "./part/Mass.js";
import Wheel from "./part/Wheel.js";
import Spring from "./physics/Spring.js";

export default class {
	dir = 1;
	joints = [];
	pedalSpeed = 0;
	points = [];
	rotationFactor = 0;
	constructor(parent) {
		Object.defineProperty(this, 'parent', { value: parent || null });
		this.name = this.constructor.name;
		this.hitbox = new Mass(this); // hitbox
		this.hitbox.drive = this.destroy.bind(this);
		this.rearWheel = new Wheel(this);
		this.frontWheel = new Wheel(this);
		this.rearSpring = new Spring(this.hitbox, this.rearWheel);
		this.chasse = new Spring(this.rearWheel, this.frontWheel);
		this.frontSpring = new Spring(this.frontWheel, this.hitbox);
		this.points.push(this.hitbox, this.frontWheel, this.rearWheel);
		this.joints.push(this.rearSpring, this.chasse, this.frontSpring);
	}

	get rider() {
		const rider = {};

		let t = this.frontWheel.displayPosition.difference(this.rearWheel.displayPosition);
		let e = new Coordinates(t.y, -t.x).scale(this.dir);
		let s = new Coordinates(Math.cos(this.pedalSpeed), Math.sin(this.pedalSpeed)).scale(6);

		rider.head = this.rearWheel.displayPosition.sum(t.scale(0.35)).sum(this.hitbox.displayPosition.difference(this.frontWheel.displayPosition.sum(this.rearWheel.displayPosition).scale(0.5)).scale(1.2));
		rider.hand = this.rearWheel.displayPosition.sum(t.scale(0.8)).sum(e.scale(0.68));
		rider.shadowHand = rider.hand.clone();

		let i = rider.head.difference(rider.hand);
		i = new Coordinates(i.y, -i.x).scale(this.dir);

		rider.elbow = rider.head.sum(rider.hand).scale(0.5).sum(i.scale(130 / i.lengthSquared()));
		rider.shadowElbow = rider.elbow.clone();
		rider.hip = this.rearWheel.displayPosition.sum(t.scale(0.2).sum(e.scale(0.5)));
		rider.foot = this.rearWheel.displayPosition.sum(t.scale(0.4)).sum(e.scale(0.05)).sum(s);

		i = rider.hip.difference(rider.foot);
		i = new Coordinates(-i.y, i.x).scale(this.dir);

		rider.knee = rider.hip.sum(rider.foot).scale(0.5).sum(i.scale(160 / i.lengthSquared()));
		rider.shadowFoot = this.rearWheel.displayPosition.sum(t.scale(0.4)).sum(e.scale(0.05)).difference(s);

		i = rider.hip.difference(rider.shadowFoot);
		i = new Coordinates(-i.y, i.x).scale(this.dir);

		rider.shadowKnee = rider.hip.sum(rider.shadowFoot).scale(0.5).sum(i.scale(160 / i.lengthSquared()));
		return rider;
	}

	destroy() {
		this.parent.dead = true;
		this.hitbox.tangible = false;
		this.rearWheel.speed = 0;
		this.parent.createRagdoll()
	}

	draw(ctx) {
		ctx.save();
		this.parent.ghost && (ctx.globalAlpha /= 2,
		this.parent.scene.cameraFocus && this.parent.scene.cameraFocus !== this.hitbox && (ctx.globalAlpha *= Math.min(1, Math.max(0.5, this.hitbox.displayPosition.distanceTo(this.parent.scene.cameraFocus.displayPosition) / (this.hitbox.size / 2) ** 2))));
		ctx.lineWidth = 3.5 * this.parent.scene.camera.zoom;
		this.rearWheel.draw(ctx);
		this.frontWheel.draw(ctx);
	}

	swap() {
		this.dir *= -1;
		this.chasse.swap();
		let rearSpring = this.rearSpring.leff;
		this.rearSpring.leff = this.frontSpring.leff;
		this.frontSpring.leff = rearSpring;
		this.parent.ragdoll.setPosition(this.rider)
	}

	fixedUpdate() {
		if (this.parent.slow) {
			if (this.rearWheel.touching && this.frontWheel.touching && !this.parent.dead) {
				this.parent.slow = false;
				this.parent.slowParity = 0;
			} else {
				this.parent.slowParity = 1 - this.parent.slowParity;
			}
		}

		if (!this.parent.slow || this.parent.slowParity === 0) {
			!this.parent.dead && this.updatePhysics();
			for (let a = this.joints.length - 1; a >= 0; a--) {
				this.joints[a].fixedUpdate();
			}

			for (let a = this.points.length - 1; a >= 0; a--) {
				this.points[a].fixedUpdate()
			}
		}
	}

	update(progress) {
		this.parent.slow && (progress = (progress + this.parent.slowParity) / 2);
		for (let a = this.points.length - 1; a >= 0; a--) {
			this.points[a].update(progress)
		}
	}

	nativeUpdate() {
		!this.parent.dead && this.updatePhysics();
		for (let a = this.joints.length - 1; a >= 0; a--) {
			this.joints[a].fixedUpdate();
		}

		for (let a = this.points.length - 1; a >= 0; a--) {
			this.points[a].fixedUpdate();
		}

		this.parent.slow && this.rearWheel.touching && this.frontWheel.touching && (this.parent.slow = false);
		if (!this.parent.slow) {
			!this.parent.dead && this.updatePhysics();
			for (let a = this.joints.length - 1; a >= 0; a--) {
				this.joints[a].fixedUpdate();
			}

			for (let a = this.points.length - 1; a >= 0; a--) {
				this.points[a].fixedUpdate()
			}
		}
	}

	updatePhysics() {
		this.rearWheel.speed += (this.parent.gamepad.downKeys.has('up') - this.rearWheel.speed) / 10;
		let rotate = this.parent.gamepad.downKeys.has('left') - this.parent.gamepad.downKeys.has('right');
		this.rearSpring.lean(rotate * this.dir * 5);
		this.frontSpring.lean(-rotate * this.dir * 5);
		this.chasse.rotate(rotate / this.rotationFactor);
		if (this.parent.gamepad.downKeys.has('up')) {
			this.pedalSpeed += this.rearWheel.rotationSpeed / 5;
			if (!rotate) {
				this.rearSpring.lean(-7);
				this.frontSpring.lean(7)
			}
		}
	}

	move(x, y) {
		for (const point of this.points) {
			point.position.x += x;
			point.position.y += y;
			point.old.x += x;
			point.old.y += y
		}
	}

	clone() {
		const clone = new this.constructor(this.parent);
		clone.dir = this.dir;

		clone.hitbox.position.set(this.hitbox.position);
		clone.hitbox.old.set(this.hitbox.old);
		clone.hitbox.velocity.set(this.hitbox.velocity);

		clone.frontWheel.position.set(this.frontWheel.position);
		clone.frontWheel.old.set(this.frontWheel.old);
		clone.frontWheel.velocity.set(this.frontWheel.velocity);

		clone.rearWheel.position.set(this.rearWheel.position);
		clone.rearWheel.old.set(this.rearWheel.old);
		clone.rearWheel.velocity.set(this.rearWheel.velocity);
		clone.rearWheel.speed = this.rearWheel.speed;

		clone.rearSpring.leff = this.rearSpring.leff;
		clone.chasse.leff = this.chasse.leff;
		clone.frontSpring.leff = this.frontSpring.leff;
		return clone
	}
}