import Spring from "../physics/Spring.js";
import Mass from "./Mass.js";

export default class {
	points = [];
	joints = [];
	constructor(parent, stickman) {
		Object.defineProperty(this, 'parent', { value: parent || null });
		this.points.push(
			this.head = new Mass(this.parent),
			this.hip = new Mass(this.parent),
			this.elbow = new Mass(this.parent),
			this.shadowElbow = new Mass(this.parent),
			this.hand = new Mass(this.parent),
			this.shadowHand = new Mass(this.parent),
			this.knee = new Mass(this.parent),
			this.shadowKnee = new Mass(this.parent),
			this.foot = new Mass(this.parent),
			this.shadowFoot = new Mass(this.parent)
		);
		for (const point of this.points) {
			point.size = 3;
			point.friction = 0.05;
		}

		this.head.size = this.hip.size = 8;
		this.joints.push(
			new Spring(this.head, this.hip),
			new Spring(this.head, this.elbow),
			new Spring(this.elbow, this.hand),
			new Spring(this.head, this.shadowElbow),
			new Spring(this.shadowElbow, this.shadowHand),
			new Spring(this.hip, this.knee),
			new Spring(this.knee, this.foot),
			new Spring(this.hip, this.shadowKnee),
			new Spring(this.shadowKnee, this.shadowFoot)
		);
		for (const joint of this.joints) {
			joint.springConstant = 0.4;
			joint.dampConstant = 0.7;
		}

		this.setPosition(stickman)
	}

	draw(ctx) {
		const head = this.head.displayPosition.toPixel();
		// const sternum = this.sternum.displayPosition.toPixel();
		const elbow = this.elbow.displayPosition.toPixel();
		const hand = this.hand.displayPosition.toPixel();
		const shadowElbow = this.shadowElbow.displayPosition.toPixel();
		const shadowHand = this.shadowHand.displayPosition.toPixel();
		const knee = this.knee.displayPosition.toPixel();
		const foot = this.foot.displayPosition.toPixel();
		const shadowKnee = this.shadowKnee.displayPosition.toPixel();
		const shadowFoot = this.shadowFoot.displayPosition.toPixel();
		const hip = this.hip.displayPosition.toPixel();
		const sternum = head.difference(hand.difference(hip).scale(0.08)).difference(head.difference(hip).scale(0.2));

		// ctx.save();
		this.parent.ghost && (ctx.globalAlpha /= 2,
		this.parent.scene.camera.focusPoint && this.parent.scene.camera.focusPoint !== this.parent.hitbox && (ctx.globalAlpha *= Math.min(1, Math.max(0.5, this.parent.hitbox.displayPosition.distanceTo(this.parent.scene.camera.focusPoint.displayPosition) / (this.parent.hitbox.size / 2) ** 2))));
		ctx.lineWidth = 6 * this.parent.scene.camera.zoom;

		ctx.beginPath()
		this.parent.dead && (ctx.moveTo(sternum.x, sternum.y),
		ctx.lineTo(shadowElbow.x, shadowElbow.y),
		ctx.lineTo(shadowHand.x, shadowHand.y))
		ctx.moveTo(hip.x, hip.y)
		ctx.lineTo(shadowKnee.x, shadowKnee.y)
		ctx.lineTo(shadowFoot.x, shadowFoot.y)
		ctx.save();
		ctx.strokeStyle = this.parent.scene.parent.physicsLineColor + '80';
		ctx.stroke();
		ctx.restore();

		ctx.beginPath()
		// ctx.moveTo(head.x, head.y)
		ctx.moveTo(sternum.x, sternum.y)
		ctx.lineTo(elbow.x, elbow.y)
		ctx.lineTo(hand.x, hand.y)
		ctx.moveTo(hip.x, hip.y)
		ctx.lineTo(knee.x, knee.y)
		ctx.lineTo(foot.x, foot.y)
		ctx.stroke();

		ctx.lineWidth = 8 * this.parent.scene.camera.zoom;

		ctx.beginPath()
		ctx.moveTo(hip.x, hip.y)
		ctx.lineTo(sternum.x, sternum.y)
		ctx.stroke();

		ctx.beginPath()
		ctx.lineWidth = 2 * this.parent.scene.camera.zoom;
		// this.head.size * (this.parent.scene.camera.zoom / 2.8)
		ctx.arc(head.x, head.y, 5 * this.parent.scene.camera.zoom, 0, 2 * Math.PI),
		ctx.stroke()

		ctx.globalAlpha = 1;
		// ctx.restore();
	}

	fixedUpdate() {
		for (const joint of this.joints) {
			joint.fixedUpdate();
		}

		for (const point of this.points) {
			point.fixedUpdate()
		}
	}

	update(progress) {
		for (const point of this.points) {
			point.update(progress)
		}
	}

	nativeUpdate() {
		this.fixedUpdate();
		if (!this.parent.slow || this.parent.slowParity === 0) {
			this.fixedUpdate();
		}
	}

	setPosition(stickman) {
		for (const part in stickman) {
			if (!this.hasOwnProperty(part)) continue;
			this[part].position.set(stickman[part]);
			this[part].displayPosition.set(this[part].position);
		}
	}

	setVelocity(a, b) {
		a.scaleSelf(0.5);
		b.scaleSelf(0.5);
		for (const joint of this.joints) {
			let len = joint.length;
			len > 20 && (len = 20);
			joint.lrest = len;
			joint.leff = len;
		}

		for (let c = 1; c < 5; c++) {
			this.joints[c].lrest = 13;
			this.joints[c].leff = 13;
		}

		let upper = [this.head, this.elbow, this.shadowElbow, this.hand, this.shadowHand];
		let lower = [this.hip, this.knee, this.shadowKnee, this.foot, this.shadowFoot];
		for (const point of upper) {
			point.old = point.position.difference(a);
		}

		for (const point of lower) {
			point.old = point.position.difference(b);
		}

		for (const point of this.points) {
			point.velocity.set(point.position.difference(point.old));
			point.velocity.x += Math.random() - Math.random();
			point.velocity.y += Math.random() - Math.random();
		}
	}

	clone() {
		const stickman = {};
		for (const part in this) {
			if (part instanceof Mass) {
				stickman[part] = this[part].position.clone();
			}
		}

		return new this.constructor(this.parent, stickman);
	}
}