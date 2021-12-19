import Triangle from "./Triangle.js";

export default class Gravity extends Triangle {
    type = "G";
    color = "#0f0";
    activate(part) {
        part.parent.parent.gravity.copy(this.dir.scale(.3));
    }
}