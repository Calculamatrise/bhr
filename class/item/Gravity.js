import Triangle from "./Triangle.js";

export default class Gravity extends Triangle {
    constructor(a, b, c, d) {
        super(a, b, c, d);
        this.dir.scaleSelf(0.3);
    }
    type = "G";
    color = "#0f0";
    activate(t) {
        t.parent.parent.gravity.copy(this.dir);
    }
}