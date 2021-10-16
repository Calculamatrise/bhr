import Line from "./Line.js";

export default class SceneryLine extends Line {
    getEnd() {
        this.ma = !0;
        var t = " " + this.b.toString(),
        e = this.track.grid[Math.floor(this.b.x / this.track.scale)][Math.floor(this.b.y / this.track.scale)].search(this.b, "sline");
        if (e !== void 0) {
            t += e.getEnd()
        }
        return t
    }
    toString() {
        return this.a + this.getEnd()
    }
    get hb() {
        return !0;
    }
}