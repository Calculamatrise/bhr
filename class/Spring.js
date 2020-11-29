import Vector from "./Vector.js";

export default class Spring {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.track = c;
        this.leff = this.lrest = 40;
        this.dampConstant= 0.5;
        this.springConstant = 0.7
    }
    lean(a) {
        this.leff += (this.lrest - a - this.leff) / 5
    }
    rotate(a) {
        var b = this.b.pos.sub(this.a.pos),
            b = new Vector(-b.y / this.leff,b.x / this.leff);
        this.a.pos.addToSelf(b.scale(a));
        this.b.pos.addToSelf(b.scale(-a))
    }
    update() {
        var a = this.b.pos.sub(this.a.pos),
            b = a.getLength();
        if (1 > b)
            return this;
        a = a.scale(1 / b);
        b = a.scale((b - this.leff) * this.springConstant);
        b.addToSelf(a.scale(this.b.vel.sub(this.a.vel).dot(a) * this.dampConstant));
        this.b.vel.addToSelf(b.scale(-1));
        this.a.vel.addToSelf(b);
        return this
    }
    swap() {
        var a = new Vector;
        a.copy(this.a.pos);
        this.a.pos.copy(this.b.pos);
        this.b.pos.copy(a);
        a.copy(this.a.old);
        this.a.old.copy(this.b.old);
        this.b.old.copy(a);
        a.copy(this.a.vel);
        this.a.vel.copy(this.b.vel);
        this.b.vel.copy(a);
        a = this.a.rotation;
        this.a.rotation = this.b.rotation;
        this.b.rotation = a
    }
    getLength() {
        return this.b.pos.sub(this.a.pos).getLength()
    }
    clone() {
        var a = new Spring(this.a,this.b,this.track);
        a.lrest = this.lrest;
        a.leff = this.leff;
        a.dampConstant= this.dampConstant;
        a.springConstant = this.springConstant;
        return a
    }
    toJSON() {
        return {
            type: "Spring",
            a: this.a,
            b: this.b,
            lrest: this.lrest,
            leff: this.leff,
            dampConstant: this.dampConstant,
            springConstant: this.springConstant
        }
    } 
}