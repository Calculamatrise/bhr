import Tool from "./Tool.js";

export default class extends Tool {
	stroke() {
		if (!this.mouse.down) {
			return;
		}

		this.scene.camera.add(this.mouse.old.difference(this.mouse.position)),
		this.mouse.position.set(this.mouse.old);
	}
}