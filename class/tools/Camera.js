import Tool from "./Tool.js";
import Coordinates from "../Coordinates.js";

export default class extends Tool {
	trackOffset = new Coordinates();
	press(event) {
		this.trackOffset.set(new Coordinates());
	}

	scroll(event) {
		this.scene.camera['zoom' + (event.wheelDelta > 0 ? 'In' : 'Out')]();
	}

	stroke(event) {
		let offset = new Coordinates(event.movementX * window.devicePixelRatio / this.scene.camera.zoom, event.movementY * window.devicePixelRatio / this.scene.camera.zoom);
		if (this.scene.transformMode) {
			this.trackOffset.add(offset);
		}

		this.mouse.down && (this.scene.camera.subtract(offset),
		this.mouse.position.subtract(offset));
	}
}