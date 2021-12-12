import Vector from "../Vector.js";
import tool from "../../constant/tool.js";

export default class Item {
    constructor(a, b, c) {
        this.position = new Vector(a, b);
        this.track = c;
        this.id = tool.powerups++
    }
    removed = false;
    get ctx() {
        return this.track.parent.ctx;
    }
    draw(t = this.color, e = this.position.toPixel()) {
        this.ctx.strokeStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
        this.ctx.fillStyle = t;
        this.ctx.beginPath();
        this.ctx.moveTo(e.x + 7 * this.track.zoom, e.y);
        this.ctx.arc(e.x, e.y, 7 * this.track.zoom, 0, 2 * Math.PI, !0);
        this.ctx.fill();
        this.ctx.stroke();
    }
    collide(t) {
        if (t.position.distanceToSquared(this.position) < 500 && !t.parent.tb) {
            this.activate(t);
        }
    }
    erase(t) {
        if (t.distanceTo(this.position) < tool.eraser.size + 7) {
            this.remove();
            return this
        }
        return false;
    }
    remove() {
        this.removed = true;
        this.track.remove(this.position);
        this.track.powerups.splice(this.track.powerups.indexOf(this), 1);

        this.ub();
        return this
    }
    toString() {
        return this.d ? this.type + " " + this.position.toString() + " " + this.d.toString() : this.type + " " + this.position.toString()
    }
    ub() {}
}