import Item from "./Item.js";

export default class SingleUseItem extends Item {
    used = false;
    collide(part) {
        if (part.position.distanceToSquared(this.position) < 500) {
            if (!this.used) {
                part.parent.parent.powerupsConsumed.push(this.id);
                if (part.parent.isGhost) {
                    if (!part.parent.powerupsConsumed[this.id]) {
                        part.parent.powerupsConsumed[this.id] = this;
                        
                        this.activate(part);
                    }
                } else {
                    this.used = !0;

                    this.activate(part);
                }
            }
        }
    }
}