import Vector from "../Vector.js";
import Sector from "./sector/Sector.js";

export default class {
    constructor(parent) {
        this.scene = parent;
    }

    scale = 100;

    rows = new Map();

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
                return new Sector(null, null, null);
            }

            this.rows.set(x, new Map());
        }

        const row = this.rows.get(x);
        if (!row.has(y)) {
            if (!add) {
                return new Sector(null, null, null);
            }

            row.set(y, new Sector(this, x, y));
        }

        return row.get(y);
    }

    range(start, end) {
        let sectors = [];
        for (let x = start.x; x <= end.x; x++) {
            for (let y = start.y; y <= end.y; y++) {
                sectors.push(this.sector(x, y));
            }
        }

        return sectors;
    }

    sectorsInView() {
        const topLeft = new Vector().toCanvas(this.scene.parent.canvas).oppositeScale(this.scale).floor();
        const bottomRight = new Vector(this.scene.parent.canvas.width, this.scene.parent.canvas.height).toCanvas(this.scene.parent.canvas).oppositeScale(this.scale).floor();
        return this.sectors.filter((sector) => sector.row > topLeft.x && sector.row < bottomRight.x && sector.column > topLeft.y && sector.column < bottomRight.y);
    }
}