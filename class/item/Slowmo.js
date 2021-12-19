import Item from "./Item.js";

export default class Slowmo extends Item {
    type = "S";
    color = "#eee";
    activate(part) {
        part.parent.parent.slow = true;
    }
}