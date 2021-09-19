import SingleUseItem from "./SingleUseItem.js";

export default class Target extends SingleUseItem {
    activate(a) {
        if (this.track.players.length > 1) {
            this.track.players[1].targetsCollected++
        } else {
            this.track.firstPlayer.targetsCollected++;
            if (this.track.firstPlayer.targetsCollected === this.track.targets) {
                a.parent.pastCheckpoint = 2
            }
        }
    }
    vb() {
        a.parent.ha.hasOwnProperty(this.id) || (a.parent.ha[this.id] = ++a.parent.firstPlayer.targetsCollected)
    }
    ub() {
        this.track.targets--
    }
    get type() {
        return "T";
    }
    get color() {
        return "#ff0";
    }
    get newColor() {
        return "#ffa";
    }
}