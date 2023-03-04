import Vector from "../Vector.js";
import Sector from "./sector/Sector.js";

export default class {
	rows = new Map();
	scale = 100;
	scene = null;
	size = 1;
	constructor(parent) {
		this.scene = parent;
	}

	get sectors() {
		let sectors = [];
		for (const row of this.rows.values()) {
			for (const column of row.values()) {
				sectors.push(column);
			}
		}

		return sectors;
	}

	coords(vector) {
		return new Vector(Math.floor(vector.x / this.scale), Math.floor(vector.y / this.scale));
	}

	findTouchingSectors(from, to) {
		let sectors = [from];
		let initial = from.clone();
		let factor = (to.y - from.y) / (to.x - from.x);
		let negativeX = from.x < to.x;
		let negativeY = from.y < to.y;
		let b = this.coords(to);
		for (let i = 0; i < 5e3; i++) {
			let a = this.coords(initial);
			if (a.x === b.x && a.y === b.y) {
				break;
			}

			let firstX = negativeX ? Math.round(Math.floor(initial.x / this.scale + 1) * this.scale) : Math.round(Math.ceil((initial.x + 1) / this.scale - 1) * this.scale) - 1;
			let firstY = Math.round(from.y + (firstX - from.x) * factor);
			let first = new Vector(firstX, firstY);

			let secondY = negativeY ? Math.round(Math.floor(initial.y / this.scale + 1) * this.scale) : Math.round(Math.ceil((initial.y + 1) / this.scale - 1) * this.scale) - 1;
			let secondX = Math.round(from.x + (secondY - from.y) / factor);
			let second = new Vector(secondX, secondY);

			let diff1 = first.clone().subtract(from);
			let diff2 = second.clone().subtract(from);
			if (diff1.lengthSquared() < diff2.lengthSquared()) {
				initial = first;
			} else {
				initial = second;
			}

			sectors.push(initial);
		}

		return sectors.map(vector => this.coords(vector)).map(vector => this.sector(vector.x, vector.y, true));
	}

	range(min, max) {
		let sectors = [];
		for (let x = min.x; x <= max.x; x++) {
			for (let y = min.y; y <= max.y; y++) {
				sectors.push(this.sector(x, y));
			}
		}

		return sectors;
	}

	sector(x, y, add) {
		if (!this.rows.has(x)) {
			if (!add) {
				return new Sector(this, null, null);
			}

			this.rows.set(x, new Map());
		}

		const row = this.rows.get(x);
		if (!row.has(y)) {
			if (!add) {
				return new Sector(this, null, null);
			}

			row.set(y, new Sector(this, x, y));
		}

		return row.get(y);
	}
}