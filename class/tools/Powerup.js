import Tool from "./Tool.js";

import Target from "../item/Target.js";
import Checkpoint from "../item/Checkpoint.js";
import Bomb from "../item/Bomb.js";
import Slowmo from "../item/Slowmo.js";
import Antigravity from "../item/Antigravity.js";
import Teleporter from "../item/Teleporter.js";

export default class extends Tool {
    teleporter = null;
    addPowerup(powerup) {
        let x = Math.floor(powerup.position.x / this.scene.grid.scale);
        let y = Math.floor(powerup.position.y / this.scene.grid.scale);
        this.scene.grid.sector(x, y, true).powerups.push(powerup);
        if (new Set(["goal", "checkpoint", "teleporter"]).has(this.parent.selected)) {
            this.scene.collectables.push(powerup);
            if (this.parent.selected === "teleporter") {
                this.teleporter = powerup;
            }
        }
    }

    press() {
        switch (this.parent.selected) {
            case "goal":
                this.addPowerup(new Target(this.scene, this.mouse.old.x, this.mouse.old.y));
                break;

            case "checkpoint":
                this.addPowerup(new Checkpoint(this.scene, this.mouse.old.x, this.mouse.old.y));
                break;

            case "bomb":
                this.addPowerup(new Bomb(this.scene, this.mouse.old.x, this.mouse.old.y));
                break;

            case "slow-mo":
                this.addPowerup(new Slowmo(this.scene, this.mouse.old.x, this.mouse.old.y));
                break;
                
            case "antigravity":
                this.addPowerup(new Antigravity(this.scene, this.mouse.old.x, this.mouse.old.y));
                break;

            case "teleporter":
                this.addPowerup(new Teleporter(this.scene, this.mouse.old.x, this.mouse.old.y));
                break;
        }
    }

    clip() {
        if (this.parent.selected !== "teleporter") {
            return;
        }

        this.mouse.old.copy(this.mouse.position);
        if (this.teleporter !== null) {
            if (this.teleporter.position.distanceTo(this.mouse.old) > 40) {
                this.teleporter.createAlt(this.mouse.old.x, this.mouse.old.y);

                let x = Math.floor(this.teleporter.alt.x / this.scene.grid.scale);
                let y = Math.floor(this.teleporter.alt.y / this.scene.grid.scale);
                this.scene.grid.sector(x, y, true).powerups.push(this.teleporter);
            } else {
                this.teleporter.remove();
            }

            this.teleporter = null;
        }
    }

    draw(ctx) {
        let position = this.mouse.position.toPixel();
        if (this.scene.cameraLock && this.parent.selected === "teleporter") {
            let old = this.mouse.old.toPixel();
            let start = position.x < 50;
            let end = position.x > this.scene.parent.canvas.width - 50;
            if (start || end) {
                this.scene.camera.x += 4 / this.scene.zoom * (1 + (start && -2));
                this.mouse.position.x += 4 / this.scene.zoom * (1 + (start && -2));
            }

            start = position.y < 50;
            end = position.y > this.scene.parent.canvas.height - 50;
            if (start || end) {
                this.scene.camera.y += 4 / this.scene.zoom * (1 + (start && -2));
                this.mouse.position.y += 4 / this.scene.zoom * (1 + (start && -2));
            }

            position = this.mouse.position.toPixel();

            ctx.save(),
            ctx.beginPath(),
            ctx.lineWidth = Math.max(2 * this.parent.scene.zoom, 0.5),
            ctx.strokeStyle = "#f00",
            ctx.moveTo(old.x, old.y),
            ctx.lineTo(position.x, position.y),
            ctx.stroke(),
            ctx.restore();
        }
        
        ctx.beginPath(),
        ctx.lineWidth = 2 * this.parent.scene.zoom,
        ctx.fillStyle = this.parent.selected == "goal" ? "#ff0" : this.parent.selected == "checkpoint" ? "#00f" : this.parent.selected == "bomb" ? "#f00" : this.parent.selected == "slow-mo" ? "#eee" : this.parent.selected == "antigravity" ? "#0ff" : "#f0f",
        ctx.arc(position.x, position.y, 7 * this.parent.scene.zoom, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.stroke();
    }
}