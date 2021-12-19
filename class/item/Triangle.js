import Vector from "../Vector.js";
import Item from "./Item.js";

export default class Triangle extends Item {
    constructor(a, b, c, d) {
        super(a, b, d);

        this.rotation = c;
        this.dir = new Vector(-Math.sin(c * Math.PI / 180), Math.cos(c * Math.PI / 180));
    }
    
    draw() {
        let position = this.position.toPixel();
        this.ctx.strokeStyle = this.track.parent.theme === "dark" ? "#fbfbfb" : "#000000";
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath(),
        this.ctx.save();
        this.ctx.translate(position.x, position.y);
        this.ctx.rotate(this.rotation * Math.PI / 180);
        this.ctx.moveTo(-7 * this.track.zoom, -10 * this.track.zoom),
        this.ctx.lineTo(0, 10 * this.track.zoom),
        this.ctx.lineTo(7 * this.track.zoom, -10 * this.track.zoom),
        this.ctx.lineTo(-7 * this.track.zoom, -10 * this.track.zoom),
        this.ctx.fill(),
        this.ctx.stroke(),
        this.ctx.restore()
    }

    collide(part) {
        if (part.position.distanceToSquared(this.position) < 1E3) {
            this.activate(part);
        }
    }

    toString() {
        return this.type + " " + this.position.toString() + " " + (this.rotation - 180).toString(32)
    }
}