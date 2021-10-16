import Item from "./Item.js";

export default class Antigravity extends Item {
    activate(t) {
        t.parent.gravity.copy({ x: 0, y: 0});
    }
    get type() {
        return "A";
    }
    get color() {
        return "#0ff";
    }
}