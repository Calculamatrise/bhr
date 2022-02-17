import Tool from "./Tool.js";

export default class extends Tool {
    scenery = false;
    mouseDown() {
        console.log("down")
        this.scene.camera.addToSelf(this.mouse.old.sub(this.mouse.position)),
        this.mouse.position.copy(this.mouse.old);
    }

    mouseUp() {
        console.log("up")
    }

    draw(ctx) {
        const position = this.parent.scene.parent.mouse.position.toPixel();

        ctx.beginPath(),
        ctx.lineWidth = 1 * window.devicePixelRatio,
        ctx.moveTo(position.x - 10 * window.devicePixelRatio, position.y),
        ctx.lineTo(position.x + 10 * window.devicePixelRatio, position.y),
        ctx.moveTo(position.x, position.y + 10 * window.devicePixelRatio),
        ctx.lineTo(position.x, position.y - 10 * window.devicePixelRatio),
        ctx.stroke();
    }
}