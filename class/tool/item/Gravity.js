import Triangle from "./Triangle.js";

export default class Gravity extends Triangle {
    constructor(a, b, c, d) {
        super(a, b, c, d);
        this.dir.scaleSelf(0.3);
    }
    activate(t) {
        t.parent.gravity.copy(this.dir);
    }
    get type() {
        return "G";
    }
    get color() {
        return "#0f0";
    }
}