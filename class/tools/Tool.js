export default class {
    constructor(toolHandler) {
        this.parent = toolHandler;
    }

    get track() {
        return this.parent.scene;
    }

    mouseDown() {}
    mouseMove() {}
    mouseUp() {}
    draw() {}
}