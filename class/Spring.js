import Vector from "./Vector.js";

export default class Spring {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }

    leff = 45;
    lrest = 45;
    dampConstant= 0.3;
    springConstant = 0.5;

    get length() {
        return this.b.position.sub(this.a.position).length;
    }

    lean(a) {
        this.leff += (this.lrest - a - this.leff) / 5;
    }

    rotate(a) {
        let b = this.b.position.sub(this.a.position);
        b = new Vector(-b.y / this.leff, b.x / this.leff);
        this.a.position.addToSelf(b.scale(a));
        this.b.position.addToSelf(b.scale(-a))
    }

    update() {
        var a = this.b.position.sub(this.a.position),
            b = a.length;
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
        a = this.a.rotation;
        this.a.rotation = this.b.rotation;
        this.b.rotation = a
    }

    clone() {
        const clone = new this.constructor(this.a, this.b);
        
        clone.lrest = this.lrest;
        clone.leff = this.leff;
        clone.dampConstant= this.dampConstant;
        clone.springConstant = this.springConstant;

        return clone;
    }
}