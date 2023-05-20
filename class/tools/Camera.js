import Vector from "../Vector.js";
import Tool from "./Tool.js";

export default class extends Tool {
	scroll(event) {
		this.scene['zoom' + (event.wheelDelta > 0 ? 'In' : 'Out')]();
	}

	stroke(event) {
		let offset = new Vector(event.movementX * window.devicePixelRatio / this.scene.zoom, event.movementY * window.devicePixelRatio / this.scene.zoom);
		this.mouse.down && (this.scene.camera.subtract(offset),
		this.mouse.position.subtract(offset));
	}
}