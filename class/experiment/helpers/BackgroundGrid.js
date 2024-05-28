import Coordinates from "../../Coordinates.js";
import Sector from "./RenderSector.js";

export default class {
	board = new OffscreenCanvas(0, 0);
	cached = true;
	ctx = this.board.getContext('2d');
	rows = new Map();
	scale = 100;
	size = 1;
	constructor(parent) {
		Object.defineProperty(this, 'parent', { value: parent || null });
		Object.defineProperty(this, 'scene', { value: parent.scene || null });
	}

	get sectors() {
		// return Array.from(this.rows.values.flatMap(row => row.values()));
		let sectors = [];
		for (const row of this.rows.values()) {
			for (const sector of row.values()) {
				sectors.push(sector);
			}
		}

		return sectors
	}

	addItem(item) {
		let from = item.a || item.start || item.position || item;
		let to = item.b || item.end || item.position || item;
		for (const sector of this.findTouchingSectors(from, to)) {
			sector.add(item);
			sector.rendered = false;
			
			// experiment
			this.cached = false;
			// sector.cache();
		}

		// this.parent.postMessage({
		// 	code: 2,
		// 	grid: this.toTransferable(),
		// 	progress: 0
		// });
		// this.cache();
		return item
	}

	async cache() {
		let columns = new Set(this.rows.values().flatMap(t => t.keys()));
		let width = this.rows.size * this.scale * 1.5;
		let height = Math.max(...Array.from(this.rows.values()).map(row => row.size)) * this.scale;
		if (this.board.width === width && this.board.height === height) return;
		this.board.width = width; // * zoom?
		this.board.height = height;
		for (const row of this.rows.values()) {
			for (const sector of row.values()) {
				sector.render(this.ctx);
			}
		}

		this.cached = true;
		this.parent.postMessage({
			board: await this.toBitmap()
		});
	}

	coords(vector) {
		return new Coordinates(Math.floor(vector.x / this.scale), Math.floor(vector.y / this.scale))
	}

	delete(x, y) {
		return this.rows.has(x) && this.rows.get(x).delete(y)
	}

	findTouchingSectors(from, to = from) {
		let sectors = [from];
		let initial = Coordinates.from(from);
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
			let first = new Coordinates(firstX, firstY);

			let secondY = negativeY ? Math.round(Math.floor(initial.y / this.scale + 1) * this.scale) : Math.round(Math.ceil((initial.y + 1) / this.scale - 1) * this.scale) - 1;
			let secondX = Math.round(from.x + (secondY - from.y) / factor);
			let second = new Coordinates(secondX, secondY);

			let diff1 = first.clone().subtract(from);
			let diff2 = second.clone().subtract(from);
			if (diff1.lengthSquared() < diff2.lengthSquared()) {
				initial = first;
			} else {
				initial = second;
			}

			sectors.push(initial);
		}

		return sectors.map(vector => this.coords(vector)).map(vector => this.sector(vector.x, vector.y, true))
	}

	range(min, max) {
		let sectors = [];
		for (let x = Math.floor(min.x); x <= max.x; x++) {
			for (let y = Math.floor(min.y); y <= max.y; y++) {
				sectors.push(this.sector(x, y));
			}
		}

		return sectors
	}

	removeItem(item) {
		let from = item.a || item.start || item.position;
		let to = item.b || item.end || item.alt || item.position;
		for (const sector of this.findTouchingSectors(from, to)) {
			sector.remove(item);
		}

		return item
	}

	resize() {
		for (const row of this.rows.values()) {
			for (const sector of row.values()) {
				sector.resize()
			}
		}
	}

	sector(x, y, createIfNotExists) {
		if (!this.rows.has(x)) {
			if (!createIfNotExists) {
				return new Sector(this, null, null);
			}

			this.rows.set(x, new Map());
		}

		const row = this.rows.get(x);
		if (!row.has(y)) {
			if (!createIfNotExists) {
				return new Sector(this, null, null);
			}

			row.set(y, new Sector(this, x, y));
		}

		return row.get(y)
	}

	async toBitmap() {
		return createImageBitmap(await this.board.convertToBlob())
	}
}