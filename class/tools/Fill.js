import Tool from "./Tool.js";

import Vector from "../Vector.js";

export default class extends Tool {
    selected = [];
    press() {
        let vector = new Vector(this.points[0], this.points[1]).toCanvas(this.scene.parent.canvas);
        this.scene.grid.sector(Math.floor(vector.x / this.scene.grid.scale), Math.floor(vector.y / this.scene.grid.scale)).fill(vector);
    }

    draw(ctx) {
        let position = this.mouse.position.toPixel();

        ctx.beginPath(),
        ctx.lineWidth = 2 * window.devicePixelRatio,
        ctx.moveTo(position.x - 10 * window.devicePixelRatio, position.y),
        ctx.lineTo(position.x + 10 * window.devicePixelRatio, position.y),
        ctx.moveTo(position.x, position.y + 10 * window.devicePixelRatio),
        ctx.lineTo(position.x, position.y - 10 * window.devicePixelRatio),
        ctx.stroke(),
        ctx.restore();
    }
}