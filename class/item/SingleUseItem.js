import Item from "./Item.js";

export default class SingleUseItem extends Item {
    constructor(a, b, c) {
        super(a, b, c);
        
        this.used = !1
    }
    draw() {
        super.draw(this.color);
        if (this.d) {
            super.draw(this.color, this.d.toPixel());
        }
    }
    collide(a) {
        if (a.position.distanceToSquared(this.position) < 500) {
            this.Ea(a);
        }
        if (this.d) {
            if (a.position.distanceToSquared(this.d) < 500) {
                this.Ea(a);
            }
        }
    }
    Ea(a) {
        if (a.parent.tb) {
            this.vb(a)
        } else {
            if (!this.used) {
                if (a.parent.isGhost) {
                    if (!a.parent.powerupsConsumed[this.id]) {
                        a.parent.powerupsConsumed[this.id] = this;
                        this.activate(a)
                    }
                } else {
                    this.used = !0;
                    this.activate(a)
                }
            }
        }
    }
}