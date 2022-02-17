import Tool from "./Tool.js";

export default class extends Tool {
    draw(ctx) {
        const position = this.parent.scene.parent.mouse.position.toPixel();
        const old = this.parent.scene.parent.mouse.old.toPixel();
        
        ctx.beginPath(),
        ctx.lineWidth = 2 * this.parent.scene.zoom,
        ctx.fillStyle = this.parent.selected == "boost" ? "#ff0" : "#0f0";
        if (this.parent.scene.cameraLock) {
            ctx.translate(old.x, old.y),
            ctx.rotate(Math.atan2(-(this.parent.scene.parent.mouse.position.x - this.parent.scene.parent.mouse.old.x), this.parent.scene.parent.mouse.position.y - this.parent.scene.parent.mouse.old.y));
        } else {
            ctx.translate(position.x, position.y);
        }

        ctx.moveTo(-7 * this.parent.scene.zoom, -10 * this.parent.scene.zoom),
        ctx.lineTo(0, 10 * this.parent.scene.zoom),
        ctx.lineTo(7 * this.parent.scene.zoom, -10 * this.parent.scene.zoom),
        ctx.closePath(),
        ctx.fill(),
        ctx.stroke();
    }
}