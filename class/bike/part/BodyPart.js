import Mass from "./Mass.js";

export default class BodyPart extends Mass {
    constructor(t, e) {
        super(t);
        this.parent = e;
        this.size = 10;
        this.friction = 0;
        this.collide = !0;
    }
    drive(t) {
        this.pos.addToSelf(t.scale(-t.dot(this.vel) * this.friction));
        this.touching = !0
    }
    update(t) {
        this.vel.addToSelf(this.parent.gravity).scaleSelf(.99);
        this.pos.addToSelf(this.vel);
        this.touching = !1;
        if (this.collide) {
            this.parent.track.collide(this);
        }
        this.vel = this.pos.sub(this.old);
        this.old.copy(this.pos);
        // super.update(t);
    }
    clone() {
        var t = new BodyPart(this.pos, this.parent);
        t.old = this.old.clone();
        t.vel = this.vel.clone();
        t.size = this.size;
        t.friction = this.friction;
        return t;
    }
}