import Vector from "../Vector.js";
import Item from "./Item.js";

export default class Triangle extends Item {
    constructor(a, b, c, d) {
        super(a, b, d);
        this.rotation = c;
        this.dir = new Vector(-Math.sin(c * Math.PI / 180), Math.cos(c * Math.PI / 180))
    }
    
    draw() {
        var a = this.track,
            b = this.position.toPixel();
        this.ctx.strokeStyle = this.track.parent.theme === "dark" ? "#fbfbfb" : "#000000";
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath(),
        this.ctx.save();
        this.ctx.translate(b.x, b.y);
        this.ctx.rotate(this.rotation * Math.PI / 180);
        this.ctx.moveTo(-7 * a.zoom, -10 * a.zoom),
        this.ctx.lineTo(0, 10 * a.zoom),
        this.ctx.lineTo(7 * a.zoom, -10 * a.zoom),
        this.ctx.lineTo(-7 * a.zoom, -10 * a.zoom),
        this.ctx.fill(),
        this.ctx.stroke(),
        this.ctx.restore()
    }

    collide(a) {
        if (a.position.distanceToSquared(this.position) < 1E3) {
            this.activate(a);
        }
    }

    toString() {
        return this.type + " " + this.position.toString() + " " + (this.rotation - 180).toString(32)
    }
}