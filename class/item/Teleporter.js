import Vector from "../Vector.js";
import SingleUseItem from "./SingleUseItem.js";

export default class Teleporter extends SingleUseItem {
    alt = null;
    type = "W";
    static clip() {
        this.mouse.old.copy(this.mouse.position);
        if (this.teleporter !== null) {
            if (this.teleporter.position.distanceTo(this.mouse.old) > 40) {
                this.teleporter.createAlt(this.mouse.old.x, this.mouse.old.y);

                let x = Math.floor(this.teleporter.alt.x / this.scene.grid.scale);
                let y = Math.floor(this.teleporter.alt.y / this.scene.grid.scale);
                this.scene.grid.sector(x, y, true).powerups.push(this.teleporter);
            } else {
                this.teleporter.remove();
            }

            this.teleporter = null;
        }
    }

    get color() {
        return this.used ? "#faf" : "#f0f";
    }

    createAlt(x, y) {
        this.alt = new Vector(x, y);
    }

    draw(ctx) {
        super.draw(ctx);
        if (this.alt) {
            super.draw(ctx, this.alt.toPixel());
        }
    }

    collide(part) {
        if (this.alt === null) {
            return;
        }

        if (part.position.distanceToSquared(this.alt) < 500) {
            if (this.used) {
                return;
            }

            part.parent.parent.itemsCollected.add(this.id);

            this.activate(part, true);
            if (part.parent.parent.ghost) {
                return;
            }

            this.used = true;
            return;
        }

        super.collide(part);
    }

    activate(part, alt = false) {
        if (alt) {
            part.parent.move(this.position.x - this.alt.x, this.position.y - this.alt.y);

            return;
        }
        
        part.parent.move(this.alt.x - this.position.x, this.alt.y - this.position.y);
    }

    erase(vector) {
        if (vector.distanceTo(this.alt) < this.scene.toolHandler.currentTool.size + 7) {
            this.remove();

            return this;
        }

        return super.erase(vector);
    }

    toString() {
        return this.type + " " + this.position.toString() + " " + this.alt.toString();
    }
}