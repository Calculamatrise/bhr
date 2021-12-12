import SingleUseItem from "./SingleUseItem.js";

export default class Target extends SingleUseItem {
    type = "T";
    get color() {
        return this.used ? "#ffa" : "#ff0";
    }

    activate(part) {
        if (this.track.players.length > 1) {
            this.track.players[1].targetsCollected++
        } else {
            this.track.firstPlayer.targetsCollected++;
            if (this.track.firstPlayer.targetsCollected === this.track.targets) {
                part.parent.pastCheckpoint = 2
            }
        }
    }

    vb(part) {
        part.parent.ha.hasOwnProperty(this.id) || (part.parent.ha[this.id] = ++part.parent.firstPlayer.targetsCollected)
    }
    
    remove() {
        super.remove();
        
        this.track.targets--
    }
}