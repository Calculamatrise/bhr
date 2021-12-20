import Vector from "../Vector.js";

export default class Item {
    constructor(track, x, y) {
        this.track = track;
        this.position = new Vector(x, y);
        this.id = this.track.goals++
    }

    track = null;
    removed = false; 
    draw(ctx, position = this.position.toPixel()) {
        ctx.beginPath(),
        ctx.fillStyle = this.color,
        ctx.strokeStyle = this.track.parent.theme === "dark" ? "#fbfbfb" : "#000",
        ctx.arc(position.x, position.y, 7 * this.track.zoom, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.stroke();
    }

    collide(part) {
        if (part.position.distanceToSquared(this.position) < 500) {
            this.activate(part);
        }
    }

    erase(vector) {
        if (vector.distanceTo(this.position) < this.track.toolHandler.currentTool.size + 7) {
            this.remove();
            
            return this;
        }

        return false;
    }

    remove() {
        this.removed = true;
        this.track.remove(this.position);
        this.alt && this.track.remove(this.alt);
        this.track.powerups.splice(this.track.powerups.indexOf(this), 1);

        return this;
    }

    toString() {
        return this.type + " " + this.position.toString();
    }
}