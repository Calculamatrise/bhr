import Triangle from "./Triangle.js";

export default class Boost extends Triangle {
    type = "B";
    color = "#ff0";
    activate(part) {
        for (const mass of part.parent.masses) {
            mass.position.add(this.dir);
        }
    }
}