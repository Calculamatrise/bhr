import Vector from "../Vector.js";
import tool from "../../constant/tool.js";
import { ctx } from "../../bootstrap.js";

export default class Item {
    constructor(a, b, c) {
        this.pos = new Vector(a, b);
        this.track = c;
        this.id = tool.powerups++
    }
    removed = false;
    draw(t = this.color, e = this.pos.toPixel()) {
        ctx.strokeStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
        ctx.fillStyle = t;
        ctx.beginPath();
        ctx.moveTo(e.x + 7 * this.track.zoom, e.y);
        ctx.arc(e.x, e.y, 7 * this.track.zoom, 0, 2 * Math.PI, !0);
        ctx.fill();
        ctx.stroke();
    }
    collide(t) {
        if (t.pos.distanceToSquared(this.pos) < 500 && !t.parent.tb) {
            this.activate(t);
        }
    }
    erase(t) {
        if (t.distanceTo(this.pos) < tool.eraser.size + 7) {
            this.remove();
            return this
        }
        return false;
    }
    remove() {
        this.removed = true;
        this.track.remove(this.pos);
        this.track.powerups.splice(this.track.powerups.indexOf(this), 1);

        this.ub();
        return this
    }
    toString() {
        return this.d ? this.type + " " + this.pos.toString() + " " + this.d.toString() : this.type + " " + this.pos.toString()
    }
    ub() {}
}