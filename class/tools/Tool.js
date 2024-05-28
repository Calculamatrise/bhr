export default class {
	constructor(toolHandler) {
		Object.defineProperty(this, 'parent', { value: toolHandler || null });
		Object.defineProperty(this, 'scene', { value: toolHandler.scene || null })
	}

	get mouse() {
		return this.scene.parent.mouse;
	}

	clip() {}
	draw() {}
	press() {}
	scroll() {}
	stroke() {}
	update() {}
}