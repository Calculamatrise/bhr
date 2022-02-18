import Vector from "../../Vector.js";

export default class {
    constructor(parent) {
        this.parent = parent;
    }
    
    size = 10;
    friction = 0;
    collide = true;
    touching = false;
    position = new Vector();
    old = new Vector();
    velocity = new Vector();
    clone() {
        const clone = new this.constructor(this.parent);
        
        clone.size = this.size;
        clone.position = this.position.clone();
        clone.old = this.old.clone();
        clone.velocity = this.velocity.clone();
        clone.friction = this.friction;

        return clone;
    }
}