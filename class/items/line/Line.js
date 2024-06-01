import Coordinates from "../../Coordinates.js";

export default class {
	sectors = new Set();
	constructor(t, e, i, s, n) {
		Object.defineProperty(this, 'scene', { value: n || null });
		// use id as reference for lines in worker and in sectors -- move Track class to worker
		Object.defineProperty(this, 'id', { value: crypto.randomUUID() });
		Object.defineProperty(this, 'sectors', { enumerable: false });
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

	findConnectedLine() {
		let connectedLine = this.scene.track[this.type + 'Lines'].filter(line => line !== this).find(line => line.a.equ(this.b) || line.b.equ(this.b));
		if (!connectedLine) return '';
		let nextPoint = connectedLine.a.equ(this.b) ? connectedLine.b : connectedLine.a;
		connectedLine.recorded = true;
		return ' ' + nextPoint.toString()
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
		return { a: this.a.toJSON(), b: this.b.toJSON(), id: this.id, type: this.type }
	}

	toString() {
		return this.a.toString() + ' ' + this.b.toString() + this.findConnectedLine()
	}
}