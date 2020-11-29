import Mass from "./Mass.js";

export default class Wheel extends Mass {
    constructor(t, e) {
        super(t);
        this.parent = e;
        this.size = 10;
        this.friction = 0;
        this.gravity = !0;
        this.collide = !0;
        this.motor = 0;
        this.pedalSpeed = 0;
    }
    drive(a) {
        this.pos.addToSelf(a.scale(this.motor * this.parent.dir));
        if (this.brake) {
            this.pos.addToSelf(a.scale(0.3 * -a.dot(this.vel)));
        }
        this.pedalSpeed = a.dot(this.vel) / this.size;
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
        var a = new Wheel(this.pos, this.track);
        a.old = this.old.clone();
        a.vel = this.vel.clone();
        a.motor = this.motor;
        return a
    }
}