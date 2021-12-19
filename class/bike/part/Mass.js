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
}