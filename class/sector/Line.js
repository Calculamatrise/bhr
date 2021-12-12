import Vector from "../Vector.js";

export default class Line {
    constructor(t, e, i, s, n) {
        this.a = t instanceof Vector ? t : new Vector(t, e);
        this.b = e instanceof Vector ? e : new Vector(i, s);
        this.vector = this.b.sub(this.a);
        this.len = this.vector.length;
        this.track = n;
    }
    removed = false;
    // draw(ctx) {
    //     let point1 = this.a.toPixel();
    //     let point2 = this.b.toPixel();

    //     ctx.save();

    //     if (this.track.lineShading) {
    //         ctx.shadowOffsetX = 2;
    //         ctx.shadowOffsetY = 2;
    //         ctx.shadowBlur = Math.max(2, this.track.zoom * 10);
    //         ctx.shadowColor = this.type === "scenery" ? this.track.parent.theme.dark ? "#999999" : "#AAAAAA" : this.track.parent.theme.dark ? "#FFFFFF" : "#000000";
    //     }

    //     ctx.strokeStyle = this.type === "scenery" ? this.track.parent.theme.dark ? "#999999" : "#AAAAAA" : this.track.parent.theme.dark ? "#FFFFFF" : "#000000";
    //     ctx.lineWidth = Math.max(this.track.zoom * 2, 0.5);
    //     ctx.lineCap = "round";
    //     ctx.beginPath();
    //     ctx.moveTo(point1.x, point1.y);
    //     ctx.lineTo(point2.x, point2.y);
    //     ctx.stroke();
    //     ctx.restore();
    // }
    draw(ctx, e, i) {
        ctx.beginPath();
        ctx.moveTo(this.a.x * this.track.zoom - e, this.a.y * this.track.zoom - i);
        ctx.lineTo(this.b.x * this.track.zoom - e, this.b.y * this.track.zoom - i);
        ctx.stroke()
    }
    erase(t) {
        let b = t.sub(this.a).dot(this.vector.oppositeScale(this.len));
        let c = new Vector(0,0);
        if (b <= 0) {
            c.copy(this.a)
        } else if (b >= this.len) {
            c.copy(this.b)
        } else {
            c.copy(this.a.add(this.vector.oppositeScale(this.len).scale(b)));
        }

        return t.sub(c).length <= this.track.toolHandler.currentTool.size ? this.remove() : !1
    }
    remove() {
        this.removed = true;
        this.track.remove(this.a, this.b);
        this.track[this.type].splice(this.track[this.type].indexOf(this), 1);
        
        return this;
    }
    xb() {
        this.track.addLineInternal(this)
    }
    toString() {
        return `${this.a} ${this.b}`;
    }
}