export default class {
    constructor(parent) {
        this.parent = parent;

        
    }
    length = 20;
    get description() {
        return "Brush ( A - Hold to snap, hold & scroll to adjust size )";
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