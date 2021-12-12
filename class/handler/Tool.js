import Camera from "../tools/Camera.js";

export default class {
    constructor(parent) {
        this.track = parent;
    }
    old = "camera";
    selected = "camera";
    #tools = {
        camera: new Camera()
    }
    get currentTool() {
        return this.#tools[this.selected];
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
    draw() {}
}