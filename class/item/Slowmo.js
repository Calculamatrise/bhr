import Item from "./Item.js";

export default class Slowmo extends Item {
    type = "S";
    color = "#eee";
    activate(t) {
        t.parent.slow = !0;
    }
}