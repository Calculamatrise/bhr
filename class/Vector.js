export default class {
    constructor(x = 0, y = 0) {
        if (typeof x === "object") {
            if (x.hasOwnProperty("x")) {
                this.x = parseFloat(x.x);
            }

            if (x.hasOwnProperty("y")) {
                this.y = parseFloat(x.y);
            }
        } else if (Array.isArray(x)) {
            if (x.length > 0) {
                if (typeof x[0] === "number" || typeof x[0] === "string") {
                    this.x = parseFloat(x[0]);
                }

                if (x.length > 1 && (typeof x[1] === "number" || typeof x[1] === "string")) {
                    this.y = parseFloat(x[1]);
                }
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
        return new this.constructor((this.x - window.game.track.camera.x) * window.game.track.zoom + window.game.canvas.width / 2 * window.devicePixelRatio, (this.y - window.game.track.camera.y) * window.game.track.zoom + window.game.canvas.height / 2 * window.devicePixelRatio);
    }

    toCanvas() {
        return new this.constructor(Math.round((this.x - window.game.canvas.width / 2) / window.game.track.zoom + window.game.track.camera.x), Math.round((this.y - window.game.canvas.height / 2) / window.game.track.zoom + window.game.track.camera.y)).scale(window.devicePixelRatio);
    }

    copy(a) {
        this.x = a.x;
        this.y = a.y;

        return this;
    }

    addToSelf(a) {
        this.x += a.x;
        this.y += a.y;

        return this;
    }

    subtractFromSelf(a) {
        this.x -= a.x;
        this.y -= a.y;

        return this;
    }

    scaleSelf(a) {
        this.x *= a;
        this.y *= a;

        return this;
    }

    lerp(target, alpha) {
        this.x = (1 - alpha) * this.x + alpha * target.x;
        this.y = (1 - alpha) * this.y + alpha * target.y;

        return this;
    }

    lerpTowards(target, smoothing, delta) {
        return this.lerp(target, 1 - Math.pow(smoothing, delta));
    }

    add(a) {
        return new this.constructor(this.x + a.x, this.y + a.y);
    }

    sub(a) {
        return new this.constructor(this.x - a.x, this.y - a.y);
    }
    
    scale(a) {
        return new this.constructor(this.x * a, this.y * a);
    }

    oppositeScale(a) {
        return new this.constructor(this.x / a, this.y / a);
    }

    dot(a) {
        return this.x * a.x + this.y * a.y;
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    distanceTo(a) {
        return Math.sqrt((this.x - a.x) ** 2 + (this.y - a.y) ** 2);
    }

    distanceToSquared(a) {
        return (this.x - a.x) ** 2 + (this.y - a.y) ** 2;
    }

    clone() {
        return new this.constructor(this.x,this.y);
    }

    toString() {
        return Math.round(this.x).toString(32) + " " + Math.round(this.y).toString(32);
    }
}