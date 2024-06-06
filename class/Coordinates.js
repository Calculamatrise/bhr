export default class {
	constructor(x = 0, y = 0) {
		if (typeof arguments[0] == 'object') {
			if (arguments[0] instanceof Array) {
				return new this.constructor(...arguments[0]);
			}

			arguments[0].hasOwnProperty('x') && (this.x = parseFloat(arguments[0].x));
			arguments[0].hasOwnProperty('y') && (this.y = parseFloat(arguments[0].y));
		}

		this.x = this.x ?? parseFloat(x);
		this.y = this.y ?? parseFloat(y);
	}

	get length() {
		return Math.sqrt(this.lengthSquared())
	}

	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
		return this
	}

	clone() {
		return new this.constructor(this.x, this.y)
	}

	difference(vector) { // delta
		return new this.constructor(this.x - vector.x, this.y - vector.y)
	}

	distanceTo(vector) {
		return Math.sqrt(this.distanceToSquared(vector))
	}

	distanceToSquared(vector) {
		return (this.x - vector.x) ** 2 + (this.y - vector.y) ** 2
	}

	dot(vector) {
		return this.x * vector.x + this.y * vector.y
	}

	equ(vector) {
		return this.x === vector.x && this.y === vector.y
	}

	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this
	}

	scale(factor) {
		return new this.constructor(this.x * factor, this.y * factor)
	}

	scaleSelf(factor) {
		this.x *= factor;
		this.y *= factor;
		return this
	}

	set(vector) {
		this.x = vector.x;
		this.y = vector.y;
		return this
	}

	subtract(vector) {
		this.x -= vector.x;
		this.y -= vector.y;
		return this
	}

	sum(vector) {
		return new this.constructor(this.x + vector.x, this.y + vector.y)
	}

	oppositeScale(factor) {
		return new this.constructor(this.x / factor, this.y / factor)
	}

	lengthSquared() {
		return this.x ** 2 + this.y ** 2
	}

	map(callback = value => value) {
		return this.constructor.from(callback(this.x), callback(this.y))
	}

	toCanvas(canvas) {
		return this.constructor.from(Math.round((this.x - canvas.width / 2) / window.game.scene.camera.zoom + window.game.scene.camera.x), Math.round((this.y - canvas.height / 2) / window.game.scene.camera.zoom + window.game.scene.camera.y))
	}

	toJSON() {
		return { x: this.x, y: this.y }
	}

	toPixel() {
		return this.constructor.from((this.x - window.game.scene.camera.x) * window.game.scene.camera.zoom + window.game.canvas.width / 2, (this.y - window.game.scene.camera.y) * window.game.scene.camera.zoom + window.game.canvas.height / 2)
	}

	toString() {
		return this.x.toString(32) + ' ' + this.y.toString(32)
	}

	static from() {
		return new this(...arguments)
	}
}