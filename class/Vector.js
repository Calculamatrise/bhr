import { canvas, track } from "../bootstrap.js";

export default class Vector {
    constructor(a, b) {
        this.x = a;
        this.y = b
    }
    toPixel() {
        return new Vector((this.x - track.camera.x) * track.zoom + canvas.width / 2,(this.y - track.camera.y) * track.zoom + canvas.height / 2)
    }
    adjustToCanvas() {
        return new Vector((this.x - canvas.width / 2) / track.zoom + track.camera.x,(this.y - canvas.height / 2) / track.zoom + track.camera.y)
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
    oppositeScaleSelf(a) {
        this.x /= a;
        this.y /= a;
        return this
    }
    clone() {
        return new Vector(this.x,this.y)
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
    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y)
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
    toString() {
        return Math.round(this.x).toString(32) + " " + Math.round(this.y).toString(32)
    }
    toJSON() {
        return [this.x, this.y]
    }
}