import Vector from "../Vector.js";

export default class Item {
    constructor(a, b, c) {
        this.position = new Vector(a, b);
        this.track = c;
        this.id = this.track.goals++
    }
    removed = false;
    get ctx() {
        return this.track.parent.ctx;
    }
    
    draw(position = this.position.toPixel()) {
        this.ctx.strokeStyle = this.track.parent.theme === "dark" ? "#fbfbfb" : "#000";
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.moveTo(position.x + 7 * this.track.zoom, position.y);
        this.ctx.arc(position.x, position.y, 7 * this.track.zoom, 0, 2 * Math.PI, !0);
        this.ctx.fill();
        this.ctx.stroke();
    }

    collide(part) {
        if (part.position.distanceToSquared(this.position) < 500 && !part.parent.tb) {
            this.activate(part);
        }
    }

    erase(t) {
        if (t.distanceTo(this.position) < this.track.toolHandler.currentTool.size + 7) {
            this.remove();
            return this
        }
        return false;
    }

    remove() {
        this.removed = true;
        this.track.remove(this.position);
        this.track.powerups.splice(this.track.powerups.indexOf(this), 1);

        return this;
    }

    toString() {
        return this.d ? this.type + " " + this.position.toString() + " " + this.d.toString() : this.type + " " + this.position.toString()
    }
}