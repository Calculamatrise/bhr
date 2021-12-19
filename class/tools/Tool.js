export default class {
    constructor(toolHandler) {
        this.parent = toolHandler;
    }

    get track() {
        return this.parent.track;
    }

    mouseDown() {}
    mouseMove() {}
    mouseUp() {}
    draw() {}
}