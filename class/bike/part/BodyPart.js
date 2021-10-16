import Mass from "./Mass.js";

export default class BodyPart extends Mass {
    constructor(t, e, i = 10) {
        super(t);
        this.parent = e;
        this.size = i;
        this.friction = 0;
        this.collide = !0;
    }
    drive(t) {
        this.pos.addToSelf(t.scale(-t.dot(this.vel) * this.friction));
        this.touching = !0
    }
    update(delta) {
        this.vel.addToSelf(this.parent.parent.gravity).scaleSelf(.99);
        this.pos.addToSelf(this.vel);
        // this.pos.lerpTowards(this.pos.add(this.vel), Math.cos(Math.PI * .5), delta);
        this.touching = !1;
        if (this.collide) {
            this.parent.parent.track.collide(this);
        }
        
        this.vel = this.pos.sub(this.old);
        this.old.copy(this.pos);
        // super.update(delta);
    }
    clone() {
        const bodyPart = new BodyPart(this.pos, this.parent, this.size);
        bodyPart.old = this.old.clone();
        bodyPart.vel = this.vel.clone();
        bodyPart.friction = this.friction;

        return bodyPart;
    }
}