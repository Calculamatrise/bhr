import Vector from "../Vector.js";
import Mass from "../bike/part/Mass.js";

export default class Shard extends Mass {
	collide = true;
	friction = .05;
	rotation = 6.2 * Math.random();
	rotationFactor = Math.random() - Math.random();
	shape = [1, 0.7, 0.8, 0.9, 0.5, 1, 0.7, 1];
	size = 2 + 9 * Math.random();
	velocity = new Vector(11 * (Math.random() - Math.random()), 11 * (Math.random() - Math.random()));
	constructor(parent, vector) {
		super(parent);
		this.position = new Vector(vector.x + 5 * (Math.random() - Math.random()), vector.y + 5 * (Math.random() - Math.random()));
		this.old = new Vector(this.position.x, this.position.y);
	}

	draw(ctx) {
		var a = this.position.toPixel(),
			b = this.shape[0] * this.size * this.parent.scene.zoom,
			d = a.x + b * Math.cos(this.rotation),
			c = a.y + b * Math.sin(this.rotation);
		ctx.save();
		ctx.beginPath(),
			ctx.moveTo(d, c),
			ctx.fillStyle = this.parent.scene.parent.settings.theme === "dark" ? "#fbfbfb" : "#000000";
		for (let e = 2; 8 > e; e++)
			c = this.shape[e - 1] * this.size * this.parent.scene.zoom / 2,
				d = a.x + c * Math.cos(this.rotation + 6.283 * e / 8),
				c = a.y + c * Math.sin(this.rotation + 6.283 * e / 8),
				ctx.lineTo(d, c);
		ctx.fill();
		ctx.restore();
	}

	drive(velocity) {
		this.pedalSpeed = velocity.dot(this.velocity) / this.size;
		this.position.add(velocity.scale(-velocity.dot(this.velocity) * this.friction));
		this.rotation += this.rotationFactor;
		let b = velocity.getLength();
		if (b > 0) {
			velocity = new Vector(-velocity.y / b, velocity.x / b);
			this.old.add(velocity.scale(0.8 * velocity.dot(this.velocity)));
		}
	}

	update() {
		this.rotation += this.rotationFactor;
		this.velocity.add(this.parent.gravity).scaleSelf(.99);
		this.position.add(this.velocity);

		this.touching = !1;
		if (this.collide) {
			this.parent.scene.collide(this);
		}
		this.velocity = this.position.difference(this.old);
		this.old.set(this.position);
		// super.update();
	}
}