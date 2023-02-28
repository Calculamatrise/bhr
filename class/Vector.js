export default class {
    constructor(x = 0, y = 0) {
        if (typeof arguments[0] == "object") {
            if (Array.isArray(arguments[0])) {
                if (arguments[0].length > 0) {
                    this.x = arguments[0][0];
                    if (arguments[0].length > 1) {
                        this.y = arguments[0][1];
                    }
                }
            } else {
                if (arguments[0].hasOwnProperty("x")) {
                    this.x = parseFloat(arguments[0].x);
                }

                if (arguments[0].hasOwnProperty("y")) {
                    this.y = parseFloat(arguments[0].y);
                }
            }
        }

        this.x = this.x || parseFloat(x);
        this.y = this.y || parseFloat(y);
    }

    static from() {
        return new this(...arguments);
    }

    toCanvas(canvas) {
        return this.constructor.from(Math.round((this.x * window.devicePixelRatio - canvas.width / 2) / window.game.scene.zoom + window.game.scene.camera.x), Math.round((this.y * window.devicePixelRatio - canvas.height / 2) / window.game.scene.zoom + window.game.scene.camera.y));
    }

    toPixel() {
        return this.constructor.from((this.x - window.game.scene.camera.x) * window.game.scene.zoom + window.game.canvas.width / 2, (this.y - window.game.scene.camera.y) * window.game.scene.zoom + window.game.canvas.height / 2);
    }

    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    set(vector) {
        this.x = vector.x;
        this.y = vector.y;

        return this;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;

        return this;
    }

    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;

        return this;
    }

    scaleSelf(factor) {
        this.x *= factor;
        this.y *= factor;

        return this;
    }

    sum(vector) {
        return new this.constructor(this.x + vector.x, this.y + vector.y);
    }

    difference(vector) {
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

    map(callback = (value) => value) {
        return this.constructor.from(callback(this.x), callback(this.y));
    }

    clone() {
        return new this.constructor(this.x, this.y);
    }

    toString() {
        return Math.round(this.x).toString(32) + " " + Math.round(this.y).toString(32);
    }
}