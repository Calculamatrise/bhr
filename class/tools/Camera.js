import Tool from "./Tool.js";

export default class extends Tool {
    stroke() {
        if (!this.mouse.down) {
            return;
        }

        this.scene.camera.addToSelf(this.mouse.old.sub(this.mouse.position)),
        this.mouse.position.copy(this.mouse.old);
    }
}