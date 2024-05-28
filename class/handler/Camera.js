import Coordinates from "../Coordinates.js";

export default class extends Coordinates {
	// focusIndex = null; // 0;
	focusPoint = null;
	lock = false;
	zoomFactor = 1 * window.devicePixelRatio;
	constructor(parent) {
		super();
		Object.defineProperty(this, 'scene', { value: parent || null })
	}

	get zoom() { return this.zoomFactor }
	set zoom(value) {
		this.zoomFactor = Math.min(window.devicePixelRatio * 4, Math.max(window.devicePixelRatio / 5, Math.round(value * 10) / 10));
		this.scene.parent.ctx.lineWidth = Math.max(2 * this.zoom, 0.5);
		// this.scene.parent.ctx.setTransform(this.zoom, 0, 0, this.zoom, 0, 0);
		// this.scene.grid.resize();
	}

	focus() {
		this.focusPoint !== null && (this.set(this.focusPoint.position),
		this.focusPoint.parent && this.focusPoint.parent.parent && this.scene.parent.emit('cameraFocus', this.focusPoint.parent.parent))
	}

	zoomIn() { this.zoom += .2 }
	zoomOut() { this.zoom -= .2 }
}