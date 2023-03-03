import Line from "./Line.js";

export default class extends Line {
	length = 20;
	scroll(event) {
		if (this.length > 4 && (0 < event.detail || event.wheelDelta < 0)) {
			this.length -= 8;
		} else if (this.length < 200 && (0 > event.detail || event.wheelDelta > 0)) {
			this.length += 8;
		}
	}

	stroke() {
		if (!this.mouse.down) {
			return;
		}

		this.mouse.old.distanceTo(this.mouse.position) >= this.length && this.scene.addLine(this.mouse.old, this.mouse.position, this.scenery);
	}
}