export default class {
    constructor(parent) {
        this.parent = parent;

        
    }
    get description() {
        return "Line ( Q - Hold to snap )";
    }
    mouseDown() {
        console.log("down")
        this.track.camera.addToSelf(this.mouse.old.sub(this.mouse.position)),
        this.mouse.position.copy(this.mouse.old);
    }
    mouseUp() {
        console.log("up")
    }
}