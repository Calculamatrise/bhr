import Vector from "../../Vector.js";

export default class {
    constructor(t, e, i, s, n) {
        this.a = t instanceof Vector ? t : new Vector(t, e);
        this.b = e instanceof Vector ? e : new Vector(i, s);
        this.vector = this.b.sub(this.a);
        this.len = this.vector.getLength();
        this.scene = n;
    }
    removed = false;
    draw(ctx, e, i) {
        ctx.beginPath();
        ctx.moveTo(this.a.x * this.scene.zoom - e, this.a.y * this.scene.zoom - i);
        ctx.lineTo(this.b.x * this.scene.zoom - e, this.b.y * this.scene.zoom - i);
        ctx.stroke()
    }

    erase(vector) {
        let b = vector.sub(this.a).dot(this.vector.oppositeScale(this.len));
        let c = new Vector();
        if (b >= this.len) {
            c.copy(this.b)
        } else {
            c.copy(this.a);
            if (b > 0) {
                c.addToSelf(this.vector.oppositeScale(this.len).scale(b));
            }
        }

        return vector.sub(c).getLength() <= this.scene.toolHandler.currentTool.size && this.remove();
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