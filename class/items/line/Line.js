import Coordinates from "../../Coordinates.js";

export default class {
	sectors = new Set();
	constructor(t, e, i, s, n) {
		Object.defineProperty(this, 'scene', { value: n || null });
		Object.defineProperty(this, 'id', { value: crypto.randomUUID() }); // create an ID to reference when deleting line?
		this.a = t instanceof Coordinates ? t : new Coordinates(t, e);
		this.b = e instanceof Coordinates ? e : new Coordinates(i, s);
	}

	get vector() {
		return this.b.difference(this.a)
	}

	get length() {
		return this.vector.length
	}

	draw(ctx, e, i) {
		ctx.moveTo((this.a.x - e) * this.scene.camera.zoom, (this.a.y - i) * this.scene.camera.zoom);
		ctx.lineTo((this.b.x - e) * this.scene.camera.zoom, (this.b.y - i) * this.scene.camera.zoom)
	}

	erase(vector) {
		let b = vector.difference(this.a).dot(this.vector.oppositeScale(this.length));
		let c = new Coordinates();
		if (b >= this.length) {
			c.set(this.b)
		} else {
			c.set(this.a);
			b > 0 && c.add(this.vector.oppositeScale(this.length).scale(b));
		}

		return vector.difference(c).length <= this.scene.toolHandler.currentTool.size
	}

	move(vector) {
		this.scene.grid.removeItem(this);
		this.a.add(vector);
		this.b.add(vector);
		this.scene.grid.addItem(this);
		if (arguments[1] !== false) {
			this.scene.history.push({
				undo: () => this.move(Coordinates.from(vector).scale(-1), false),
				redo: () => this.move(vector, false)
			});
		}
	}

	remove() {
		this.scene.grid.removeItem(this);
		this.removed = true;
		return this
	}

	toJSON() {
		return { a: this.a, b: this.b, id: this.id, type: this.type }
	}

	toString() {
		return this.a.toString() + ' ' + this.b.toString()
	}
}