import Triangle from "./Triangle.js";

export default class Boost extends Triangle {
    type = "B";
    color = "#ff0";
    activate(a) {
        for (var a = a.parent.masses, b = 0, c = a.length; b < c; b++) {
            a[b].position.addToSelf(this.dir);
        }
    }
}