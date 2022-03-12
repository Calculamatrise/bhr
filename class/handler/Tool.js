import Line from "../tools/Line.js";
import Brush from "../tools/Brush.js";
import Camera from "../tools/Camera.js";
import Eraser from "../tools/Eraser.js";
import Powerup from "../tools/Powerup.js";
import TrianglePowerup from "../tools/TrianglePowerup.js";

export default class {
    constructor(parent) {
        this.scene = parent;
        this.cache.set("brush", new Brush(this));
        this.cache.set("camera", new Camera(this));
        this.cache.set("eraser", new Eraser(this));
        this.cache.set("line", new Line(this));
        this.cache.set("powerup", new Powerup(this));
        this.cache.set("trianglepowerup", new TrianglePowerup(this));
    }
    old = "camera";
    selected = "camera";
    cache = new Map();
    get currentTool() {
        if (new Set(["antigravity", "bomb", "boost", "checkpoint", "goal", "gravity", "slow-mo", "teleporter"]).has(this.selected)) {
            if (new Set(["boost", "gravity"]).has(this.selected)) {
                return this.cache.get("trianglepowerup");
            }

            return this.cache.get("powerup");
        }

        return this.cache.get(this.selected);
    }

    get ctx() {
        return this.scene.parent.ctx;
    }

    setTool(name, style = null) {
        this.old = this.selected;
        this.selected = name;
        if (style !== null) {
            this.currentTool.scenery = style;
        }

        let settings = this.scene.parent.container.querySelector("toolbar")?.querySelector("div.left settings");
        settings !== null && settings.style.setProperty("display", ["brush", "eraser"].includes(this.selected) ? "block" : "none");

        settings = settings.querySelector("div[data-id=eraser]");
        settings !== null && settings.style.setProperty("display", this.selected === "eraser" ? "block" : "none");

        this.scene.parent.canvas.style.setProperty("cursor", name === "camera" ? "move" : "none");
    }

    scroll(event) {
        this.currentTool.scroll(event);
    }

    press(event) {
        this.currentTool.press(event);
    }

    stroke(event) {
        this.currentTool.stroke(event);
    }

    clip(event) {
        this.currentTool.clip(event);
    }

    update() {
        this.currentTool.update();
    }

    draw(ctx) {
        this.currentTool.draw(ctx);
    }
}