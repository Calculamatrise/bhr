import Item from "./Item.js";

export default class Bomb extends Item {
    activate(a) {
        this.track.firstPlayer = this.track.players[0] = new Explosion(this.pos, a.parent.gravity, a.parent.time, this.track, a.parent.checkpoints)
    }
    get type() {
        return "O";
    }
    get color() {
        return "#f00";
    }
}