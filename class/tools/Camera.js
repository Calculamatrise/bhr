import Tool from "./Tool.js";

export default class extends Tool {
    mouseDown() {
        console.log("down")
        this.track.camera.addToSelf(this.mouse.old.sub(this.mouse.position)),
        this.mouse.position.copy(this.mouse.old);
    }
    
    mouseUp() {
        console.log("up")
    }
}