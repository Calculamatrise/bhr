import SingleUseItem from "./SingleUseItem.js";

export default class Checkpoint extends SingleUseItem {
    type = "C";
    get color() {
        return this.used ? "#aaf" : "#00f";
    }

    activate(part) {
        part.parent.parent.collide("checkpoint");
    }
}