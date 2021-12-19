import Item from "./Item.js";

export default class Bomb extends Item {
    type = "O";
    color = "#f00";
    activate(part) {
        part.parent.parent.createExplosion(part);
    }
}