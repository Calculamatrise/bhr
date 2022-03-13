import Vector from "../Vector.js";
import Item from "./Item.js";

export default class Triangle extends Item {
    constructor() {
        super(...arguments);

        this.rotation = arguments[3];
        this.dir = new Vector(-Math.sin(this.rotation * Math.PI / 180), Math.cos(this.rotation * Math.PI / 180));
    }

    static draw(ctx) {
        let position = this.position.toPixel();

        ctx.save(),
        ctx.beginPath(),
        ctx.fillStyle = this.color,
        ctx.strokeStyle = this.scene.parent.theme === "dark" ? "#fbfbfb" : "#000000",
        ctx.translate(position.x, position.y),
        ctx.rotate(this.rotation * Math.PI / 180),
        ctx.moveTo(-7 * this.scene.zoom, -10 * this.scene.zoom),
        ctx.lineTo(0, 10 * this.scene.zoom),
        ctx.lineTo(7 * this.scene.zoom, -10 * this.scene.zoom),
        ctx.closePath(),
        ctx.fill(),
        ctx.stroke(),
        ctx.restore();
    }

    collide(part) {
        if (part.position.distanceToSquared(this.position) > 1e3) {
            return;
        }

        if (part.parent.parent.dead) {
			return;
		}

        this.activate(part);
    }

    toString() {
        return this.type + " " + this.position.toString() + " " + (this.rotation - 180).toString(32)
    }
}