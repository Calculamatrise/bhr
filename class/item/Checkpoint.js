import SingleUseItem from "./SingleUseItem.js";

export default class Checkpoint extends SingleUseItem {
    activate(a) {
        if (this.track.players.length > 1) {
            this.track.players[1].pastCheckpoint |= 1;
        } else
            this.track.firstPlayer.pastCheckpoint |= 1;
        //console.log("Checkpoint", a.parent.time, JSON.stringify(a.parent))
    }
    get type() {
        return "C";
    }
    get color() {
        return "#00f";
    }
    get newColor() {
        return "#aaf";
    }
}