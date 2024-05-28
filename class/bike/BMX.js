import Bike from "./Bike.js";
import Coordinates from "../Coordinates.js";

export default class BMX extends Bike {
	constructor(parent) {
		super(...arguments);

		this.hitbox.size = 14;
		this.frontWheel.size = 11.7;
		this.rearWheel.size = 11.7;

		this.hitbox.position.set(new Coordinates(0, -1));
		this.hitbox.displayPosition = this.hitbox.position;
		this.hitbox.old = this.hitbox.position.clone();
		this.rearWheel.position = new Coordinates(-21, 38);
		this.rearWheel.displayPosition = this.rearWheel.position;
		this.rearWheel.old = this.rearWheel.position.clone();
		this.frontWheel.position = new Coordinates(21, 38);
		this.frontWheel.displayPosition = this.frontWheel.position;
		this.frontWheel.old = this.frontWheel.position.clone();

		this.rearSpring.lrest = 45;
		this.rearSpring.leff = 45;
		this.rearSpring.springConstant = .35;
		this.rearSpring.dampConstant = .3;

		this.chasse.lrest = 42;
		this.chasse.leff = 42;
		this.chasse.springConstant = .35;
		this.chasse.dampConstant = .3;

		this.frontSpring.lrest = 45;
		this.frontSpring.leff = 45;
		this.frontSpring.springConstant = .35;
		this.frontSpring.dampConstant = .3;

		this.rotationFactor = 6;
	}

	get rider() {
		const rider = {};

		let t = this.frontWheel.displayPosition.difference(this.rearWheel.displayPosition);
		let e = new Coordinates(t.y, -t.x).scale(this.dir);
		let s = new Coordinates(Math.cos(this.pedalSpeed), Math.sin(this.pedalSpeed)).scale(6);

		let r = this.hitbox.displayPosition.difference(this.rearWheel.displayPosition).difference(t.scale(0.5));
		let a = this.rearWheel.displayPosition.sum(t.scale(0.3)).sum(e.scale(0.25));

		rider.head = a.sum(t.scale(0.15)).sum(r.scale(1.05));
		// rider.head = this.hitbox.displayPosition.difference(t.scale(0.05)).sum(e.scale(0.3));
		rider.sternum /* .head */ = a.sum(t.scale(0.05)).sum(r.scale(0.88));
		rider.hand = this.rearWheel.displayPosition.sum(t.scale(0.8)).sum(e.scale(0.68));
		rider.shadowHand = rider.hand.clone();

		let i = rider.sternum.difference(rider.hand);
		i = new Coordinates(i.y, -i.x).scale(this.dir);

		rider.elbow = i.scale(130 / i.lengthSquared()).sum(rider.sternum.difference(rider.hand).scale(.4)).sum(rider.hand);
		rider.shadowElbow = rider.elbow.clone();
		rider.hip = a.difference(t.scale(0.1)).sum(r.scale(0.3));
		rider.foot = this.rearWheel.displayPosition.sum(t.scale(0.4)).sum(e.scale(0.05)).sum(s);

		i = rider.hip.difference(rider.foot);
		i = new Coordinates(-i.y, i.x).scale(this.dir);

		rider.knee = rider.hip.sum(rider.foot).scale(0.5).sum(i.scale(200 / i.lengthSquared()));
		rider.shadowFoot = this.rearWheel.displayPosition.sum(t.scale(0.4)).sum(e.scale(0.05)).difference(s);

		i = rider.hip.difference(rider.shadowFoot);
		i = new Coordinates(-i.y, i.x).scale(this.dir);

		rider.shadowKnee = rider.hip.sum(rider.shadowFoot).scale(0.5).sum(i.scale(200 / i.lengthSquared()));
		return rider;
	}

	draw(ctx) {
		super.draw(ctx);
		let rearWheel = this.rearWheel.displayPosition.toPixel();
		let frontWheel = this.frontWheel.displayPosition.toPixel();
		let l = frontWheel.difference(rearWheel);
		let i = new Coordinates(frontWheel.y - rearWheel.y, rearWheel.x - frontWheel.x).scale(this.dir);
		let a = rearWheel.sum(l.scale(0.3)).sum(i.scale(0.25));
		let n = rearWheel.sum(l.scale(0.84)).sum(i.scale(0.42));
		let c = rearWheel.sum(l.scale(0.84)).sum(i.scale(0.37));
		let w = rearWheel.sum(l.scale(0.4)).sum(i.scale(0.05));

		ctx.lineWidth = this.parent.scene.camera.zoom * 3;
		ctx.beginPath()
		ctx.moveTo(rearWheel.x, rearWheel.y)
		ctx.lineTo(a.x, a.y)
		ctx.lineTo(n.x, n.y)
		ctx.moveTo(c.x, c.y)
		ctx.lineTo(w.x, w.y)
		ctx.lineTo(rearWheel.x, rearWheel.y);

		c = new Coordinates(Math.cos(this.pedalSpeed), Math.sin(this.pedalSpeed)).scale(this.parent.scene.camera.zoom * 6);
		let foot = w.sum(c);
		let shadowFoot = w.difference(c);

		let C = rearWheel.sum(l.scale(0.17)).sum(i.scale(0.38));
		let X = rearWheel.sum(l.scale(0.3)).sum(i.scale(0.45));
		let T = rearWheel.sum(l.scale(0.25)).sum(i.scale(0.4));

		ctx.moveTo(foot.x, foot.y);
		ctx.lineTo(shadowFoot.x, shadowFoot.y);
		ctx.moveTo(C.x, C.y);
		ctx.lineTo(X.x, X.y);
		ctx.moveTo(w.x, w.y);
		ctx.lineTo(T.x, T.y);

		C = rearWheel.sum(l.scale(0.97));
		X = rearWheel.sum(l.scale(0.8)).sum(i.scale(0.48));
		T = rearWheel.sum(l.scale(0.86)).sum(i.scale(0.5));
		let Y = rearWheel.sum(l.scale(0.82)).sum(i.scale(0.65));
		let hand = rearWheel.sum(l.scale(0.78)).sum(i.scale(0.67));

		ctx.moveTo(rearWheel.x + l.x, rearWheel.y + l.y),
		ctx.lineTo(C.x, C.y)
		ctx.lineTo(X.x, X.y)
		ctx.lineTo(T.x, T.y)
		ctx.lineTo(Y.x, Y.y)
		ctx.lineTo(hand.x, hand.y)
		ctx.stroke();

		if (!this.parent.dead) {
			i = this.hitbox.displayPosition.toPixel().difference(rearWheel).difference(l.scale(0.5));
			ctx.beginPath();
			switch (this.parent.cosmetics.head) {
			case 'cap':
				ctx.moveTo(...Object.values(a.sum(l.scale(0.4)).sum(i.scale(1.1))))
				ctx.lineTo(...Object.values(a.sum(l.scale(0.05)).sum(i.scale(1.05))))
				break;
			case 'hat':
				let head = a.sum(l.scale(0.35)).sum(i.scale(1.15));
				let h = a.difference(l.scale(0.05)).sum(i.scale(1.1));
				ctx.moveTo(head.x, head.y),
				ctx.lineTo(...Object.values(a.sum(l.scale(0.25)).sum(i.scale(1.13)))),
				ctx.lineTo(...Object.values(head.difference(l.scale(0.1)).sum(i.scale(0.2)))),
				ctx.lineTo(...Object.values(h.sum(l.scale(0.02)).sum(i.scale(0.2)))),
				ctx.lineTo(...Object.values(a.sum(l.scale(0.05)).sum(i.scale(1.11)))),
				ctx.lineTo(h.x, h.y),
				ctx.fill()
			}

			ctx.lineWidth = this.parent.scene.camera.zoom * 2
			ctx.stroke();
		}

		ctx.restore()
	}
}