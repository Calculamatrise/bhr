import Tool from "./Tool.js";

export default class extends Tool {
    draw(ctx) {
        let position = this.parent.track.parent.mouse.position.toPixel();
        
        ctx.beginPath(),
        ctx.lineWidth = 2 * this.parent.track.zoom;
        ctx.fillStyle = this.parent.selected == "goal" ? "#ff0" : this.parent.selected == "checkpoint" ? "#00f" : this.parent.selected == "bomb" ? "#f00" : this.parent.selected == "slow-mo" ? "#eee" : this.parent.selected == "antigravity" ? "#0ff" : "#f0f",
        ctx.arc(position.x, position.y, 7 * this.parent.track.zoom, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.stroke();
    }
}