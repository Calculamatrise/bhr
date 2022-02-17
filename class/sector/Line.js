import Vector from "../Vector.js";

export default class Line {
    constructor(t, e, i, s, n) {
        this.a = t instanceof Vector ? t : new Vector(t, e);
        this.b = e instanceof Vector ? e : new Vector(i, s);
        this.vector = this.b.sub(this.a);
        this.len = this.vector.length;
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
        let c = new Vector(0,0);
        if (b <= 0) {
            c.copy(this.a)
        } else if (b >= this.len) {
            c.copy(this.b)
        } else {
            c.copy(this.a.add(this.vector.oppositeScale(this.len).scale(b)));
        }

        return vector.sub(c).length <= this.scene.toolHandler.currentTool.size ? this.remove() : !1
    }

    commit() {
        this.scene.addLineInternal(this);
    }

    remove() {
        this.removed = true;
        this.scene.remove(this.a, this.b);
        this.scene[this.type].splice(this.scene[this.type].indexOf(this), 1);
        
        return this;
    }

    toString() {
        return `${this.a} ${this.b}`;
    }
}