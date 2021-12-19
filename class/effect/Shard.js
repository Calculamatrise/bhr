import Vector from "../Vector.js";
import Mass from "../bike/part/Mass.js";

export default class Shard extends Mass {
    constructor(parent, vector) {
        super(parent);

        this.position = new Vector(vector.x + 5 * (Math.random() - Math.random()), vector.y + 5 * (Math.random() - Math.random()));
        this.old = new Vector(this.position.x, this.position.y);
    }

    velocity = new Vector(11 * (Math.random() - Math.random()), 11 * (Math.random() - Math.random()));
    size = 2 + 9 * Math.random();
    rotation = 6.2 * Math.random();
    rotationFactor = Math.random() - Math.random();
    friction = .05;
    collide = !0;
    shape = [ 1, 0.7, 0.8, 0.9, 0.5, 1, 0.7, 1 ]

    draw(ctx) {
        var a = this.position.toPixel(),
            b = this.shape[0] * this.size * this.parent.track.zoom,
            d = a.x + b * Math.cos(this.rotation),
            c = a.y + b * Math.sin(this.rotation);
        ctx.save();
        ctx.beginPath(),
        ctx.moveTo(d, c),
        ctx.fillStyle = this.parent.track.parent.theme === "dark" ? "#fbfbfb" : "#000000";
        for (let e = 2; 8 > e; e++)
            c = this.shape[e - 1] * this.size * this.parent.track.zoom / 2,
            d = a.x + c * Math.cos(this.rotation + 6.283 * e / 8),
            c = a.y + c * Math.sin(this.rotation + 6.283 * e / 8),
            ctx.lineTo(d, c);
        ctx.fill();
        ctx.restore();
    }

    drive(velocity) {
        this.pedalSpeed = velocity.dot(this.velocity) / this.size;
        this.position.addToSelf(velocity.scale(-velocity.dot(this.velocity) * this.friction));
        this.rotation += this.rotationFactor;
        let b = velocity.length;
        if (b > 0) {
            velocity = new Vector(-velocity.y / b, velocity.x / b);
            this.old.addToSelf(velocity.scale(0.8 * velocity.dot(this.velocity)));
        }
    }
    
    update(delta) {
        this.rotation += this.rotationFactor;
        this.velocity.addToSelf(this.parent.gravity).scaleSelf(0.99);
        this.position.addToSelf(this.velocity);
        
        this.touching = !1;
        if (this.collide) {
            this.parent.track.collide(this);
        }
        this.velocity = this.position.sub(this.old);
        this.old.copy(this.position)
    }
}