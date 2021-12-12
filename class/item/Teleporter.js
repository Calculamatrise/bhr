import Vector from "../Vector.js";
import SingleUseItem from "./SingleUseItem.js";

export default class Teleporter extends SingleUseItem {
    constructor(a, b, c) {
        super(a, b, c);
        this.a = a;
        this.b = b
    }
    type = "W";
    get color() {
        return this.used ? "#faf" : "#f0f";
    }

    tpb(t, e) {
        this.d = new Vector(t, e);
        this.x = t;
        this.y = e;
    }

    activate(a) {
        console.log(a)
        a.parent.move(this.x - this.a, this.y - this.b)
    }
}