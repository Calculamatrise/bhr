import Tool from "./Tool.js";

export default class extends Tool {
    length = 20;
    scenery = false;
    mouseDown() {
        console.log("down")
        this.track.camera.addToSelf(this.mouse.old.sub(this.mouse.position)),
        this.mouse.position.copy(this.mouse.old);
    }
    
    mouseUp() {
        console.log("up")
    }

    draw(ctx) {
        const position = this.parent.track.parent.mouse.position.toPixel();

        ctx.beginPath(),
        ctx.lineWidth = 1,
        ctx.strokeStyle = this.parent.track.parent.theme === "dark" ? "#ebebeb" : "#000",
        ctx.moveTo(position.x - 10, position.y),
        ctx.lineTo(position.x + 10, position.y),
        ctx.moveTo(position.x, position.y + 10),
        ctx.lineTo(position.x, position.y - 10),
        ctx.stroke();
    }
}