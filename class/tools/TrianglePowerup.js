import Tool from "./Tool.js";

export default class extends Tool {
    draw(ctx) {
        const position = this.parent.track.parent.mouse.position.toPixel();
        const old = this.parent.track.parent.mouse.old.toPixel();
        
        ctx.beginPath(),
        ctx.lineWidth = 2 * this.parent.track.zoom,
        ctx.fillStyle = this.parent.selected == "boost" ? "#ff0" : "#0f0";
        if (this.parent.track.cameraLock) {
            ctx.translate(old.x, old.y),
            ctx.rotate(Math.atan2(-(this.parent.track.parent.mouse.position.x - this.parent.track.parent.mouse.old.x), this.parent.track.parent.mouse.position.y - this.parent.track.parent.mouse.old.y));
        } else {
            ctx.translate(position.x, position.y);
        }

        ctx.moveTo(-7 * this.parent.track.zoom, -10 * this.parent.track.zoom),
        ctx.lineTo(0, 10 * this.parent.track.zoom),
        ctx.lineTo(7 * this.parent.track.zoom, -10 * this.parent.track.zoom),
        ctx.lineTo(-7 * this.parent.track.zoom, -10 * this.parent.track.zoom),
        ctx.fill(),
        ctx.stroke();
    }
}