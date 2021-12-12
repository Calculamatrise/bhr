import Item from "./Item.js";

export default class SingleUseItem extends Item {
    used = false;
    collide(part) {
        if (part.position.distanceToSquared(this.position) < 500 || (this.d && part.position.distanceToSquared(this.d) < 500)) {
            if (part.parent.tb) {
                this.vb(part)
            } else {
                if (!this.used) {
                    part.parent.parent.powerupsConsumed.push(this.id);
                    if (part.parent.isGhost) {
                        if (!part.parent.powerupsConsumed[this.id]) {
                            part.parent.powerupsConsumed[this.id] = this;
                            this.activate(part)
                        }
                    } else {
                        this.activate(part);
                        this.used = !0;
                    }
                }
            }
        }
    }
}