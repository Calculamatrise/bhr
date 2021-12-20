import SingleUseItem from "./SingleUseItem.js";

export default class Target extends SingleUseItem {
    type = "T";
    
    get color() {
        return this.used ? "#ffa" : "#ff0";
    }

    activate(part) {
        part.parent.parent.collide("target");
    }
    
    remove() {
        super.remove();
        
        this.track.targets--
    }
}