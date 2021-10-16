import Vector from "../../Vector.js";
import tool from "../../../constant/tool.js";

export default class Line {
    constructor(t, e, i, s, n) {
        this.a = t instanceof Vector ? t : new Vector(t, e);
        this.b = e instanceof Vector ? e : new Vector(i, s);
        this.vector = this.b.sub(this.a);
        this.len = this.vector.getLength();
        this.Remove = false;
        this.track = n;
    }
    draw(t, e, i) {
        t.beginPath();
        t.moveTo(this.a.x * this.track.zoom - e, this.a.y * this.track.zoom - i);
        t.lineTo(this.b.x * this.track.zoom - e, this.b.y * this.track.zoom - i);
        t.stroke();
    }
    erase(t) {
        let b = t.sub(this.a).dot(this.vector.oppositeScale(this.len));
        let c = new Vector();
        if (b <= 0) {
            c.copy(this.a);
        } else if (b >= this.len) {
            c.copy(this.b);
        } else {
            c.copy(this.a.add(this.vector.oppositeScale(this.len).scale(b)));
        }
        return t.sub(c).getLength() <= tool.eraser.size ? (this.remove(), this) : !1;
    }
    remove() {
        this.Remove = !0;
        this.track.remove(this.a, this.b);
        return this;
    }
    xb() {
        this.track.addLineInternal(this);
    }
    toString() {
        return this.a + this.getEnd();
    }
}