import Item from "./Item.js";

export default class Slowmo extends Item {
    activate(t) {
        t.parent.slow = !0;
    }
    get type() {
        return "S";
    }
    get color() {
        return "#eee";
    }
}