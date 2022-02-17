import Vector from "../Vector.js";

export default class Item {
    constructor(scene, x, y) {
        this.scene = scene;
        this.position = new Vector(x, y);
        this.id = this.scene.goals++
    }

    scene = null;
    removed = false; 
    draw(ctx, position = this.position.toPixel()) {
        ctx.beginPath(),
        ctx.fillStyle = this.color,
        ctx.strokeStyle = this.scene.parent.theme === "dark" ? "#fbfbfb" : "#000",
        ctx.arc(position.x, position.y, 7 * this.scene.zoom, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.stroke();
    }

    collide(part) {
        if (part.position.distanceToSquared(this.position) < 500) {
            this.activate(part);
        }
    }

    erase(vector) {
        if (vector.distanceTo(this.position) < this.scene.toolHandler.currentTool.size + 7) {
            this.remove();
            
            return this;
        }

        return false;
    }

    remove() {
        this.removed = true;
        this.scene.remove(this.position);
        this.alt && this.scene.remove(this.alt);
        this.scene.powerups.splice(this.scene.powerups.indexOf(this), 1);

        return this;
    }

    toString() {
        return this.type + " " + this.position.toString();
    }
}