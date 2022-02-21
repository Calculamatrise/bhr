import SingleUseItem from "./SingleUseItem.js";

export default class Checkpoint extends SingleUseItem {
    type = "C";
    get color() {
        return this.used ? "#aaf" : "#00f";
    }

    activate(part) {
        if (part.parent.parent.ghost) {
            return;
        }

        part.parent.parent.pendingConsumables |= 1;
    }
}