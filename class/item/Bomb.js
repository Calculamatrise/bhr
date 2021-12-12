import Item from "./Item.js";
import Explosion from "../effect/Explosion.js";

export default class Bomb extends Item {
    type = "O";
    color = "#f00";
    activate(part) {
        if (part.parent instanceof Explosion || (part.parent.explosion ?? false) || (part.parent.parent?.explosion ?? false))
            return;

        part.parent.parent.createExplosion(part);
    }
}