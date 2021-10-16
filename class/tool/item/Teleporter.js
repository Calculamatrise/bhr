import Vector from "../../Vector.js";
import SingleUseItem from "./SingleUseItem.js";

export default class Teleporter extends SingleUseItem {
    constructor(a, b, c) {
        super(a, b, c);
        this.a = a;
        this.b = b
    }
    tpb(t, e) {
        this.d = new Vector(t, e);
        this.x = t;
        this.y = e;
    }
    activate(a) {
        console.log(a)
        a.parent.moveVehicle(this.x - this.a, this.y - this.b)
    }
    get type() {
        return "W";
    }
    get color() {
        return "#f0f";
    }
    get newColor() {
        return "#faf";
    }
}