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

    get pixel() {
        return new this.constructor((this.x - window.game.scene.camera.x) * window.game.scene.zoom + window.game.canvas.width / 2, (this.y - window.game.scene.camera.y) * window.game.scene.zoom + window.game.canvas.height / 2);
    }

    toPixel() {
        return new this.constructor((this.x - window.game.scene.camera.x) * window.game.scene.zoom + window.game.canvas.width / 2, (this.y - window.game.scene.camera.y) * window.game.scene.zoom + window.game.canvas.height / 2);
    }

    toCanvas() {
        return new this.constructor(Math.round((this.x * window.devicePixelRatio - window.game.canvas.width / 2) / window.game.scene.zoom + window.game.scene.camera.x), Math.round((this.y * window.devicePixelRatio - window.game.canvas.height / 2) / window.game.scene.zoom + window.game.scene.camera.y));
    }

    copy(vector) {
        this.x = vector.x;
        this.y = vector.y;

        return this;
    }

    addToSelf(vector) {
        this.x += vector.x;
        this.y += vector.y;

        return this;
    }

    subtractFromSelf(vector) {
        this.x -= vector.x;
        this.y -= vector.y;

        return this;
    }

    scaleSelf(factor) {
        this.x *= factor;
        this.y *= factor;

        return this;
    }

    add(vector) {
        return new this.constructor(this.x + vector.x, this.y + vector.y);
    }

    sub(vector) {
        return new this.constructor(this.x - vector.x, this.y - vector.y);
    }
    
    scale(factor) {
        return new this.constructor(this.x * factor, this.y * factor);
    }

    oppositeScale(factor) {
        return new this.constructor(this.x / factor, this.y / factor);
    }

    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }

    lengthSquared() {
        return this.x ** 2 + this.y ** 2;
    }

    distanceTo(vector) {
        return Math.sqrt((this.x - vector.x) ** 2 + (this.y - vector.y) ** 2);
    }

    distanceToSquared(vector) {
        return (this.x - vector.x) ** 2 + (this.y - vector.y) ** 2;
    }

    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);

        return this;
    }

    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);

        return this;
    }

    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);

        return this;
    }

    clone() {
        return new this.constructor(this.x, this.y);
    }

    toString() {
        return Math.round(this.x).toString(32) + " " + Math.round(this.y).toString(32);
    }
}