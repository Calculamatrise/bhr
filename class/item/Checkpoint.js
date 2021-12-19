import SingleUseItem from "./SingleUseItem.js";

export default class Checkpoint extends SingleUseItem {
    type = "C";

    get color() {
        return this.used ? "#aaf" : "#00f";
    }

    activate(part) {
        if (this.track.players.length > 1) {
            this.track.players[1].pastCheckpoint |= 1;
        } else
            this.track.firstPlayer.pastCheckpoint |= 1;
        //console.log("Checkpoint", a.parent.time, JSON.stringify(a.parent))
    }
}