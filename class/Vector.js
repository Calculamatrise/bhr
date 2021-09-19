import { canvas } from "../bootstrap.js";

export default class Vector {
    constructor(x = 0, y = 0) {
        if (typeof x === "object") {
            if (x.hasOwnProperty("x")) {
                this.x = parseFloat(x.x);
            }

            if (x.hasOwnProperty("y")) {
                this.y = parseFloat(x.y);
            }
        } else {
            this.x = parseFloat(x);
            this.y = parseFloat(y);
        }
    }
    get length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    get absolute() {
        return this.toPixel();
    }
    toPixel() {
        return new Vector((this.x - window.game.track.camera.x) * window.game.track.zoom + canvas.width / 2, (this.y - window.game.track.camera.y) * window.game.track.zoom + canvas.height / 2);
    }
    toCanvas() {
        return new Vector(Math.round((this.x - canvas.width / 2) / window.game.track.zoom + window.game.track.camera.x), Math.round((this.y - canvas.height / 2) / window.game.track.zoom + window.game.track.camera.y));
    }
    copy(a) {
        this.x = a.x;
        this.y = a.y;
        return this
    }
    addToSelf(a) {
        this.x += a.x;
        this.y += a.y;
        return this
    }
    subtractFromSelf(a) {
        this.x -= a.x;
        this.y -= a.y;
        return this 
    }
    scaleSelf(a) {
        this.x *= a;
        this.y *= a;
        return this
    }
    add(a) {
        return new Vector(this.x + a.x,this.y + a.y)
    }
    sub(a) {
        return new Vector(this.x - a.x,this.y - a.y)
    }
    scale(a) {
        return new Vector(this.x * a,this.y * a)
    }
    oppositeScale(a) {
        return new Vector(this.x / a,this.y / a)
    }
    dot(a) {
        return this.x * a.x + this.y * a.y
    }
    lengthSquared() {
        return this.x * this.x + this.y * this.y
    }
    distanceTo(a) {
        var b = this.x - a.x,
            a = this.y - a.y;
        return Math.sqrt(b * b + a * a)
    }
    distanceToSquared(a) {
        var b = this.x - a.x,
            a = this.y - a.y;
        return b * b + a * a
    }
    clone() {
        return new Vector(this.x,this.y)
    }
    toString() {
        return Math.round(this.x).toString(32) + " " + Math.round(this.y).toString(32)
    }
}