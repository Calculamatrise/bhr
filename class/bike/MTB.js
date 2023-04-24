import Bike from "./Bike.js";
import Vector from "../Vector.js";

export default class MTB extends Bike {
	name = 'MTB';
	constructor(parent) {
		super(parent);

		this.head.size = 14;
		this.frontWheel.size = 14;
		this.rearWheel.size = 14;

		this.head.position = new Vector(2, -3);
		this.head.old = this.head.position.clone();
		this.frontWheel.position = new Vector(23, 35);
		this.frontWheel.old = this.frontWheel.position.clone();
		this.rearWheel.position = new Vector(-23, 35);
		this.rearWheel.old = this.rearWheel.position.clone();

		this.rearSpring.lrest = 47;
		this.rearSpring.leff = 47;
		this.rearSpring.springConstant = 0.2;
		this.rearSpring.dampConstant = 0.3;

		this.chasse.lrest = 45;
		this.chasse.leff = 45;
		this.chasse.springConstant = 0.2;
		this.chasse.dampConstant = 0.3;

		this.frontSpring.lrest = 45;
		this.frontSpring.leff = 45;
		this.frontSpring.springConstant = 0.2;
		this.frontSpring.dampConstant = 0.3;

		this.rotationFactor = 8;
	}

	draw(ctx) {
		ctx.save();
		this.parent.ghost && (ctx.globalAlpha /= 2);
		ctx.lineWidth = 3.5 * this.parent.scene.zoom;
		this.rearWheel.draw(ctx);
		this.frontWheel.draw(ctx);

		let rearWheel = this.rearWheel.position.toPixel();
		let frontWheel = this.frontWheel.position.toPixel();
		ctx.beginPath()
		ctx.arc(rearWheel.x, rearWheel.y, 5 * this.parent.scene.zoom, 0, 2 * Math.PI)
		ctx.arc(frontWheel.x, frontWheel.y, 4 * this.parent.scene.zoom, 0, 2 * Math.PI)
		ctx.save()
		ctx.fillStyle = 'grey'
		ctx.fill()
		ctx.restore()

		var d = this.head.position.toPixel();
		var e = frontWheel.difference(rearWheel);
		var f = new Vector((frontWheel.y - rearWheel.y) * this.dir, (rearWheel.x - frontWheel.x) * this.dir);
		var h = d.difference(rearWheel.sum(e.scale(0.5)));

		ctx.beginPath()
		ctx.moveTo(rearWheel.x, rearWheel.y)
		ctx.lineTo(rearWheel.x + 0.4 * e.x + 0.05 * f.x, rearWheel.y + 0.4 * e.y + 0.05 * f.y)
		ctx.moveTo(rearWheel.x + 0.72 * e.x + 0.64 * h.x, rearWheel.y + 0.72 * e.y + 0.64 * h.y)
		ctx.lineTo(rearWheel.x + 0.46 * e.x + 0.4 * h.x, rearWheel.y + 0.46 * e.y + 0.4 * h.y)
		ctx.lineTo(rearWheel.x + 0.4 * e.x + 0.05 * f.x, rearWheel.y + 0.4 * e.y + 0.05 * f.y)
		ctx.lineWidth = 5 * this.parent.scene.zoom;
		ctx.stroke();

		ctx.beginPath()
		var i = new Vector(6 * Math.cos(this.pedalSpeed) * this.parent.scene.zoom, 6 * Math.sin(this.pedalSpeed) * this.parent.scene.zoom);
		ctx.moveTo(rearWheel.x + 0.72 * e.x + 0.64 * h.x, rearWheel.y + 0.72 * e.y + 0.64 * h.y),
		ctx.lineTo(rearWheel.x + 0.43 * e.x + 0.05 * f.x, rearWheel.y + 0.43 * e.y + 0.05 * f.y),
		ctx.moveTo(rearWheel.x + 0.45 * e.x + 0.3 * h.x, rearWheel.y + 0.45 * e.y + 0.3 * h.y),
		ctx.lineTo(rearWheel.x + 0.3 * e.x + 0.4 * h.x, rearWheel.y + 0.3 * e.y + 0.4 * h.y),
		ctx.lineTo(rearWheel.x + 0.25 * e.x + 0.6 * h.x, rearWheel.y + 0.25 * e.y + 0.6 * h.y),
		ctx.moveTo(rearWheel.x + 0.17 * e.x + 0.6 * h.x, rearWheel.y + 0.17 * e.y + 0.6 * h.y),
		ctx.lineTo(rearWheel.x + 0.3 * e.x + 0.6 * h.x, rearWheel.y + 0.3 * e.y + 0.6 * h.y),
		ctx.moveTo(rearWheel.x + 0.43 * e.x + 0.05 * f.x + i.x, rearWheel.y + 0.43 * e.y + 0.05 * f.y + i.y),
		ctx.lineTo(rearWheel.x + 0.43 * e.x + 0.05 * f.x - i.x, rearWheel.y + 0.43 * e.y + 0.05 * f.y - i.y),
		ctx.lineWidth = 2 * this.parent.scene.zoom;
		ctx.stroke();

		ctx.beginPath(),
		ctx.moveTo(rearWheel.x + 0.46 * e.x + 0.4 * h.x, rearWheel.y + 0.46 * e.y + 0.4 * h.y),
		ctx.lineTo(rearWheel.x + 0.28 * e.x + 0.5 * h.x, rearWheel.y + 0.28 * e.y + 0.5 * h.y),
		ctx.lineWidth = this.parent.scene.zoom;
		ctx.stroke();

		ctx.beginPath(),
		ctx.moveTo(frontWheel.x, frontWheel.y),
		ctx.lineTo(rearWheel.x + 0.71 * e.x + 0.73 * h.x, rearWheel.y + 0.71 * e.y + 0.73 * h.y),
		ctx.lineTo(rearWheel.x + 0.73 * e.x + 0.77 * h.x, rearWheel.y + 0.73 * e.y + 0.77 * h.y),
		ctx.lineTo(rearWheel.x + 0.7 * e.x + 0.8 * h.x, rearWheel.y + 0.7 * e.y + 0.8 * h.y),
		ctx.lineWidth = 3 * this.parent.scene.zoom;
		ctx.stroke();
		if (!this.parent.dead) {
			var c = rearWheel.sum(e.scale(0.3)).sum(h.scale(0.25))
			  , k = rearWheel.sum(e.scale(0.4)).sum(h.scale(0.05))
			  , d = k.sum(i)
			  , l = k.difference(i)
			  , b = rearWheel.sum(e.scale(0.67)).sum(h.scale(0.8))
			  , i = c.sum(e.scale(-0.05)).sum(h.scale(0.42))
			  , m = d.difference(i)
			  , n = i.sum(m.scale(0.5)).sum(new Vector(m.y * this.dir, -m.x * this.dir).scaleSelf(this.parent.scene.zoom * this.parent.scene.zoom).scale(200 / m.lengthSquared()))
			  , m = l.difference(i)
			  , k = i.sum(m.scale(0.5)).sum(new Vector(m.y * this.dir, -m.x * this.dir).scaleSelf(this.parent.scene.zoom * this.parent.scene.zoom).scale(200 / m.lengthSquared()));
			ctx.beginPath()
			ctx.lineWidth = 6 * this.parent.scene.zoom
			ctx.moveTo(l.x, l.y)
			ctx.lineTo(k.x, k.y)
			ctx.lineTo(i.x, i.y)
			ctx.save()
			ctx.globalAlpha = .5
			ctx.stroke()
			ctx.restore();

			ctx.beginPath()
			ctx.moveTo(d.x, d.y)
			ctx.lineTo(n.x, n.y)
			ctx.lineTo(i.x, i.y)
			ctx.stroke();

			k = c.sum(e.scale(0.1)).sum(h.scale(0.93));
			d = c.sum(e.scale(0.2)).sum(h.scale(1.09));
			ctx.beginPath()
			ctx.moveTo(i.x, i.y)
			ctx.lineTo(k.x, k.y)
			ctx.lineWidth = 8 * this.parent.scene.zoom
			ctx.stroke();

			ctx.beginPath()
			ctx.moveTo(d.x + 5 * this.parent.scene.zoom, d.y)
			ctx.arc(d.x, d.y, 5 * this.parent.scene.zoom, 0, 2 * Math.PI, true)
			ctx.lineWidth = 2 * this.parent.scene.zoom
			ctx.stroke();
			ctx.beginPath();
			switch (this.parent.cosmetics.head) {
				case 'cap':
					ctx.moveTo(...Object.values(c.sum(e.scale(0.4)).sum(h.scale(1.15))));
					ctx.lineTo(...Object.values(c.sum(e.scale(0.1)).sum(h.scale(1.05))));
					break;

				case 'hat':
					d = c.sum(e.scale(0.37)).sum(h.scale(1.19))
					i = c.difference(e.scale(0.02)).sum(h.scale(1.14))
					l = c.sum(e.scale(0.28)).sum(h.scale(1.17))
					c = c.sum(e.scale(0.09)).sum(h.scale(1.15))
					n = d.difference(e.scale(0.1)).add(h.scale(0.2))
					e = i.sum(e.scale(0.02)).add(h.scale(0.2))
					ctx.moveTo(d.x, d.y)
					ctx.lineTo(l.x, l.y)
					ctx.lineTo(n.x, n.y)
					ctx.lineTo(e.x, e.y)
					ctx.lineTo(c.x, c.y)
					ctx.lineTo(i.x, i.y)
					ctx.fill();
			}

			ctx.stroke();
			e = k.difference(b);
			e = b.sum(e.scale(0.3)).sum(new Vector(e.y, -e.x).scale(80 / e.lengthSquared() * this.dir * this.parent.scene.zoom * this.parent.scene.zoom));
			ctx.beginPath()
			ctx.moveTo(k.x, k.y)
			ctx.lineTo(e.x, e.y)
			ctx.lineTo(b.x, b.y)
			ctx.lineWidth = 5 * this.parent.scene.zoom
			ctx.stroke();
		}

		ctx.restore();
	}
}