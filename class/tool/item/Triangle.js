import Vector from "../../Vector.js";
import Item from "./Item.js";
import { ctx } from "../../../bootstrap.js";

export default class Triangle extends Item {
    constructor(a, b, c, d) {
        super(a, b, d);
        this.rotation = c;
        this.dir = new Vector(-Math.sin(c * Math.PI / 180), Math.cos(c * Math.PI / 180))
    }
    draw() {
        var a = this.track,
            b = this.pos.toPixel();
        ctx.fillStyle = this.color;
        ctx.beginPath(),
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.moveTo(-7 * a.zoom, -10 * a.zoom),ctx.lineTo(0, 10 * a.zoom),ctx.lineTo(7 * a.zoom, -10 * a.zoom),ctx.lineTo(-7 * a.zoom, -10 * a.zoom),ctx.fill(),ctx.stroke(),ctx.restore()
    }
    collide(a) {
        if (a.pos.distanceToSquared(this.pos) < 1E3) {
            this.activate(a);
        }
    }
    toString() {
        return this.type + " " + this.pos.toString() + " " + (this.rotation - 180).toString(32)
    }
}