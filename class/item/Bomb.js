import Item from "./Item.js";
import Explosion from "../effect/Explosion.js";

export default class Bomb extends Item {
    activate(part) {
        if (part.parent instanceof Explosion || (part.parent.explosion ?? false) || (part.parent.parent?.explosion ?? false))
            return;

        part.parent.parent.createExplosion(part);
    }
    get type() {
        return "O";
    }
    get color() {
        return "#f00";
    }
}