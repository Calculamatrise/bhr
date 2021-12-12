import Vector from "../../Vector.js";

export default class {
    constructor(parent) {
        this.parent = parent;
    }
    size = 10;
    motor = 0;
    friction = 0;
    collide = true;
    touching = false;
    position = new Vector();
    old = new Vector();
    velocity = new Vector();
    displayPos = new Vector();
    update(delta) {
        this.displayPos = this.position;
        // this.displayPos = this.position.add(this.velocity.scale(delta));
    }
}