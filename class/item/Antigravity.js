import Item from "./Item.js";

export default class Antigravity extends Item {
    type = "A";
    color = "#0ff";
    activate(t) {
        t.parent.gravity.copy({ x: 0, y: 0});
    }
}