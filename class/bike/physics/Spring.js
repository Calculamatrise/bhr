import Vector from "../../Vector.js";

export default class Spring {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    leff = 40;
    lrest = 40;
    dampConstant = .5;
    springConstant = .7;
    getLength() {
        return this.b.position.sub(this.a.position).getLength();
    }

    lean(rotation) {
        this.leff += (this.lrest - rotation - this.leff) / 5;
    }

    rotate(a) {
        let b = this.b.position.sub(this.a.position);
        b = new Vector(-b.y / this.leff, b.x / this.leff);
        this.a.position.addToSelf(b.scale(a));
        this.b.position.addToSelf(b.scale(-a));
    }

    update() {
        let a = this.b.position.sub(this.a.position),
            b = a.getLength();
        if (1 > b)
            return this;
        a = a.scale(1 / b);
        b = a.scale((b - this.leff) * this.springConstant);
        b.addToSelf(a.scale(this.b.velocity.sub(this.a.velocity).dot(a) * this.dampConstant));
        this.b.velocity.addToSelf(b.scale(-1));
        this.a.velocity.addToSelf(b);

        return this;
    }
    
    swap() {
        let a = new Vector;
        a.copy(this.a.position);
        this.a.position.copy(this.b.position);
        this.b.position.copy(a);
        a.copy(this.a.old);
        this.a.old.copy(this.b.old);
        this.b.old.copy(a);
        a.copy(this.a.velocity);
        this.a.velocity.copy(this.b.velocity);
        this.b.velocity.copy(a);
        a = this.a.pedalSpeed;
        this.a.pedalSpeed = this.b.pedalSpeed;
        this.b.pedalSpeed = a
    }
}