import Powerup from "./Powerup.js";

import Boost from "../item/Boost.js";
import Gravity from "../item/Gravity.js";

export default class extends Powerup {
    clip() {
        let angle = Math.round(180 * Math.atan2(-(this.mouse.position.x - this.mouse.old.x), this.mouse.position.y - this.mouse.old.y) / Math.PI);
        this.addPowerup(new (this.parent.selected === "boost" ? Boost : Gravity)(this.scene, this.mouse.old.x, this.mouse.old.y, angle));
    }

    draw(ctx) {
        let position = this.mouse.position.toPixel();
        let old = this.mouse.old.toPixel();

        ctx.save(),
        ctx.beginPath(),
        ctx.lineWidth = 2 * this.scene.zoom,
        ctx.fillStyle = this.parent.selected === "boost" ? "#ff0" : "#0f0";
        if (this.scene.cameraLock) {
            ctx.beginPath(),
            ctx.arc(position.x, position.y, Math.round(Math.max(2 * this.parent.scene.zoom, 0.5)), 0, 2 * Math.PI),
            ctx.fill(),
            ctx.translate(old.x, old.y),
            ctx.rotate(Math.atan2(-(this.mouse.position.x - this.mouse.old.x), this.mouse.position.y - this.mouse.old.y));
        } else {
            ctx.translate(position.x, position.y);
        }

        ctx.moveTo(-7 * this.scene.zoom, -10 * this.scene.zoom),
        ctx.lineTo(0, 10 * this.scene.zoom),
        ctx.lineTo(7 * this.scene.zoom, -10 * this.scene.zoom),
        ctx.closePath(),
        ctx.fill(),
        ctx.stroke(),
        ctx.restore();
    }
}