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

	range(min, max) {
		let sectors = [];
		for (let x = min.x; x <= max.x; x++) {
			for (let y = min.y; y <= max.y; y++) {
				sectors.push(this.sector(x, y));
			}
		}

		return sectors;
	}
}