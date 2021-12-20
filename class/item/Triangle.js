import Vector from "../Vector.js";
import Item from "./Item.js";

export default class Triangle extends Item {
    constructor(track, x, y, d) {
        super(track, x, y);

        this.rotation = d;
        this.dir = new Vector(-Math.sin(this.rotation * Math.PI / 180), Math.cos(this.rotation * Math.PI / 180));
    }
    
    draw(ctx) {
        let position = this.position.toPixel();

        ctx.save(),
        ctx.beginPath(),
        ctx.fillStyle = this.color,
        ctx.strokeStyle = this.track.parent.theme === "dark" ? "#fbfbfb" : "#000000",
        ctx.translate(position.x, position.y),
        ctx.rotate(this.rotation * Math.PI / 180),
        ctx.moveTo(-7 * this.track.zoom, -10 * this.track.zoom),
        ctx.lineTo(0, 10 * this.track.zoom),
        ctx.lineTo(7 * this.track.zoom, -10 * this.track.zoom),
        ctx.lineTo(-7 * this.track.zoom, -10 * this.track.zoom),
        ctx.fill(),
        ctx.stroke(),
        ctx.restore()
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