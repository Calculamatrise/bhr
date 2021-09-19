import Antigravity from "../item/Antigravity.js";

export default class {
    constructor(parent) {
        this.selected = "camera";
        this.setTool("Antigravity", new Antigravity());
    }
    #tools = {}
    setTool(name, value) {
        this.#tools[name] = value;
    }
}