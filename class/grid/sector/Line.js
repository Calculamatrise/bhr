import Vector from "../../Vector.js";

export default class {
	removed = false;
    constructor(t, e, i, s, n) {
        this.a = t instanceof Vector ? t : new Vector(t, e);
        this.b = e instanceof Vector ? e : new Vector(i, s);
        this.vector = this.b.difference(this.a);
        this.len = this.vector.getLength();
        this.scene = n;
    }

    draw(ctx, e, i) {
        ctx.beginPath();
        ctx.moveTo(this.a.x * this.scene.zoom - e, this.a.y * this.scene.zoom - i);
        ctx.lineTo(this.b.x * this.scene.zoom - e, this.b.y * this.scene.zoom - i);
        ctx.stroke()
    }

    erase(vector) {
        let b = vector.difference(this.a).dot(this.vector.oppositeScale(this.len));
        let c = new Vector();
        if (b >= this.len) {
            c.set(this.b)
        } else {
            c.set(this.a);
            if (b > 0) {
                c.add(this.vector.oppositeScale(this.len).scale(b));
            }
        }

        return vector.difference(c).getLength() <= this.scene.toolHandler.currentTool.size && this.remove();
    }

    commit() {
        this.scene.addLineInternal(this);
    }

    remove() {
        this.removed = true;
        return this.scene.remove(this.a, this.b), this;
    }

    toString() {
        return `${this.a.toString()} ${this.b.toString()}`;
    }
}