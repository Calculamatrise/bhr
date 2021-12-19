import Tool from "./Tool.js";

export default class extends Tool {
    size = 15;
    settings = {
        physics: !0,
        scenery: !0,
        powerups: !0
    }
    draw(ctx) {
        const position = this.parent.track.parent.mouse.position.toPixel();

        ctx.beginPath();
        ctx.fillStyle = "#ffb6c199";
        ctx.arc(position.x, position.y, (this.size - 1) * this.parent.track.zoom, 0, 2 * Math.PI);
        ctx.fill();
    }
}