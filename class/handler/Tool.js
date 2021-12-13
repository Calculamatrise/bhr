import Line from "../tools/Line.js";
import Brush from "../tools/Brush.js";
import Camera from "../tools/Camera.js";
import Eraser from "../tools/Eraser.js";
import Powerup from "../tools/Powerup.js";
import TrianglePowerup from "../tools/TrianglePowerup.js";

export default class {
    constructor(parent) {
        this.track = parent;
    }
    old = "camera";
    selected = "camera";
    tools = {
        brush: new Brush(this),
        camera: new Camera(this),
        eraser: new Eraser(this),
        powerup: new Powerup(this),
        trianglePowerup: new TrianglePowerup(this),
        line: new Line(this)
    }
    get currentTool() {
        if (["goal", "checkpoint", "bomb", "slow-mo", "antigravity", "teleporter"].includes(this.selected)) {
            return this.tools["powerup"];
        } else if (["boost", "gravity"].includes(this.selected)) {
            return this.tools["trianglePowerup"]
        }

        return this.tools[this.selected];
    }

    get ctx() {
        return this.track.parent.ctx;
    }

    setTool(name) {
        let settings = this.track.parent.container.querySelector("toolbar").querySelector("div.left settings");
        let eraserSettings = settings.querySelector("div[data-id=eraser]");

        this.selected = name;

        settings.style.setProperty("display", ["brush", "scenery brush", "eraser"].includes(this.selected) ? "block" : "none");
        eraserSettings.style.setProperty("display", this.selected === "eraser" ? "block" : "none");
    }
}