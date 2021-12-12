import Entity from "./Entity.js";

export default class BodyPart extends Entity {
    constructor(t, e, i = 10) {
        super(t);
        this.parent = e;
        this.size = i;
        this.friction = 0;
        this.collide = !0;
    }

    clone() {
        const bodyPart = new this.constructor(this.pos, this.parent, this.size);

        bodyPart.position = this.position.snapshot();
        bodyPart.old = this.old.snapshot();
        bodyPart.velocity = this.velocity.snapshot();
        bodyPart.friction = this.friction;

        return bodyPart;
    }
}