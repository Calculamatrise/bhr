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

        if (part.parent.parent.targetsCollected !== part.parent.parent.scene.targets) {
            return;
        }

        part.parent.parent.pendingConsumables |= 2;
    }
    
    remove() {
        super.remove();
        
        this.scene.targets--
    }
}