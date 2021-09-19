import Triangle from "./Triangle.js";

export default class Boost extends Triangle {
    activate(a) {
        for (var a = a.parent.masses, b = 0, c = a.length; b < c; b++) {
            a[b].pos.addToSelf(this.dir);
        }
    }
    get type() {
        return "B";
    }
    get color() {
        return "#ff0";
    }
}