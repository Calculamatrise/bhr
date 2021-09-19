import Mass from "./Mass.js";

export default class Wheel extends Mass {
    constructor(t, e, i = 10) {
        super(t);
        this.parent = e;
        this.size = i;
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
    update(delta) {
        this.vel.addToSelf(this.parent.parent.gravity).scaleSelf(.99);
        this.pos.addToSelf(this.vel);
        this.touching = !1;
        if (this.collide) {
            this.parent.parent.track.collide(this);
        }
        this.vel = this.pos.sub(this.old);
        this.old.copy(this.pos);
        // super.update(t);
    }
    clone() {
        const wheel = new Wheel(this.pos, this.parent, this.size);
        wheel.old = this.old.clone();
        wheel.vel = this.vel.clone();
        wheel.motor = this.motor;
        
        return wheel
    }
}