import Vector from "../../Vector.js";
import Line from "./Line.js";

export default class PhysicsLine extends Line {
    collide(a) {
        if (this.yb) return this;
        this.yb = !0;
        var b = a.pos,
            c = a.vel,
            d = a.size,
            e = new Vector(0,0),
            f = 0,
            e = b.sub(this.a),
            h = e.dot(this.vector) / this.len / this.len;
        if (0 <= h && 1 >= h && (c = 0 > (e.x * this.vector.y - e.y * this.vector.x) * ((e.x - c.x) * this.vector.y - (e.y - c.y) * this.vector.x) ? -1 : 1,
        e = e.sub(this.vector.scale(h)), f = e.getLength(), (f < d || 0 > c) && (0 !== f || 514 === this.track.id)))
            return b.addToSelf(e.scale((d * c - f) / f)),
            a.drive(new Vector(-e.y / f,e.x / f)),
            this;
        if (h * this.len < -d || h * this.len > this.len + d)
            return this;
        e = b.sub(0 < h ? this.b : this.a);
        f = e.getLength();
        if (f < d && 0 !== f)
            return b.addToSelf(e.scale((d - f) / f)),
            a.drive(new Vector(-e.y / f,e.x / f)),
            this
    }
    getEnd() {
        this.ma = !0;
        var a = " " + this.b.toString(),
            b = this.track.grid[Math.floor(this.b.x / this.track.scale)][Math.floor(this.b.y / this.track.scale)].search(this.b, "line");
        b !== void 0 && (a += b.getEnd());
        return a
    }
    toString() {
        return this.a + this.getEnd()
    }
}