import Vector from "../../Vector.js";

export default class Mass {
    constructor(t = new Vector(0, 0), e = new Vector(0, 0)) {
        this.pos = t.clone();
        this.old = t.clone();
        this.real = t.add(e);
        this.vel = e.clone();
    }
    update(t) {
        this.real = this.pos.add(this.vel.scale(t));
    }
}