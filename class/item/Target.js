import SingleUseItem from "./SingleUseItem.js";

export default class Target extends SingleUseItem {
    type = "T";
    get color() {
        return this.used ? "#ffa" : "#ff0";
    }

    activate(part) {
        if (part.parent.parent.ghost) {
            return;
        }

        part.parent.parent.pendingConsumables |= 2;
    }
}