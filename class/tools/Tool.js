export default class {
    constructor(toolHandler) {
        this.parent = toolHandler;
    }

    get scene() {
        return this.parent.scene;
    }

    get mouse() {
        return this.scene.parent.mouse;
    }

    scroll() {}
    press() {}
    stroke() {}
    clip() {}
    draw() {}
}