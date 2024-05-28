export default class extends OffscreenCanvas {
	physics = [];
	scenery = [];
	powerups = [];
	rendered = false;
	ctx = this.getContext('2d');
	constructor(parent, row, column) {
		super(0, 0);
		Object.defineProperty(this, 'parent', { value: parent || null });
		this.row = row;
		this.column = column;
		this.resize()
	}

	get resized() {
		return (this.width + this.height) / 2 !== this.parent.scale * this.parent.scene.camera.zoom
	}

	add(item) {
		if (arguments.length > 1) {
			for (const item of arguments)
				this.add(item);
			return this;
		} else if (item instanceof Array) {
			return this.add(...item);
		} else if (this.physics.includes(item) || this.scenery.includes(item) || this.powerups.includes(item)) {
			return this;
		}

		if (item.type == 'physics') {
			this.physics.push(item);
		} else if (item.type == 'scenery') {
			this.scenery.push(item);
		} else {
			this.powerups.push(item);
		}

		return this
	}

	cache(offsetX = this.row * this.parent.scale, offsetY = this.column * this.parent.scale) {
		this.ctx.clearRect(0, 0, this.width, this.height);
		if (this.scenery.length > 0) {
			let strokeStyle = this.ctx.strokeStyle;
			this.ctx.strokeStyle = '#'.padEnd(7, /^(dark|midnight)$/i.test(this.parent.scene.parent.settings.theme) ? '6' : 'a');
			this.ctx.beginPath();
			for (const line of this.scenery) {
				this.ctx.moveTo((line.a.x - offsetX) * this.parent.scene.camera.zoom, (line.a.y - offsetY) * this.parent.scene.camera.zoom);
				this.ctx.lineTo((line.b.x - offsetX) * this.parent.scene.camera.zoom, (line.b.y - offsetY) * this.parent.scene.camera.zoom);
			}

			this.ctx.stroke();
			this.ctx.strokeStyle = strokeStyle;
		}

		this.ctx.beginPath();
		for (const line of this.physics) {
			this.ctx.moveTo((line.a.x - offsetX) * this.parent.scene.camera.zoom, (line.a.y - offsetY) * this.parent.scene.camera.zoom);
			this.ctx.lineTo((line.b.x - offsetX) * this.parent.scene.camera.zoom, (line.b.y - offsetY) * this.parent.scene.camera.zoom);
		}

		this.ctx.stroke();
		this.rendered = true
	}

	resize() {
		this.width = this.parent.scale * this.parent.scene.camera.zoom;
		this.height = this.parent.scale * this.parent.scene.camera.zoom;
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';
		this.ctx.lineWidth = Math.max(2 * this.parent.scene.camera.zoom, 0.5);
		this.ctx.strokeStyle = '#'.padEnd(7, /^dark$/i.test(this.parent.scene.parent.settings.theme) ? 'fb' : /^midnight$/i.test(this.parent.scene.parent.settings.theme) ? 'c' : '0');
		// this.ctx.transform(this.parent.scene.camera.zoom, 0, 0, this.parent.scene.camera.zoom, 0, 0);
		this.rendered = false
	}

	render(ctx, left, top) {
		let offsetX = this.row * this.parent.scale;
		let offsetY = this.column * this.parent.scale;
		// this.resized && this.resize();
		this.rendered || this.cache(offsetX, offsetY);
		let x = Math.floor(ctx.canvas.width / 2 + left);
		let y = Math.floor(ctx.canvas.height / 2 + top);
		let width = this.parent.scale * this.parent.scene.camera.zoom;
		let height = this.parent.scale * this.parent.scene.camera.zoom;
		ctx.clearRect(x, y, width, height);
		ctx.drawImage(/*this.image || */this, x, y, width, height);
	}

	search(min, max) {
		const filter = ({ a, b }) => (min.x < a.x && a.x < max.x && min.y < a.y && a.y < max.y) || (min.x < b.x && b.x < max.x && min.y < b.y && b.y < max.y);
		return {
			physics: this.physics.filter(filter),
			scenery: this.scenery.filter(filter),
			powerups: this.powerups.filter(({ position }) => min.x < position.x && position.x < max.x && min.y < position.y && position.y < max.y)
		}
	}

	erase(vector) {
		let cache = [];
		if (!this.parent.scene.toolHandler.currentTool.ignoring.has('physics')) {
			for (const line of this.physics.filter(line => line.removed || line.erase(vector))) {
				// cache.push(this.remove(line));
				cache.push(line.remove());
			}
		}

		if (!this.parent.scene.toolHandler.currentTool.ignoring.has('scenery')) {
			for (const line of this.scenery.filter(line => line.removed || line.erase(vector))) {
				// cache.push(this.remove(line));
				cache.push(line.remove());
			}
		}

		if (!this.parent.scene.toolHandler.currentTool.ignoring.has('powerups')) {
			for (const item of this.powerups.filter(item => item.removed || item.erase(vector))) {
				// cache.push(this.remove(item));
				cache.push(item.remove());
			}
		}

		return cache
	}

	remove(item) {
		if (item.type == 'physics') {
			this.physics.splice(this.physics.indexOf(item), 1);
		} else if (item.type == 'scenery') {
			this.scenery.splice(this.scenery.indexOf(item), 1);
		} else {
			this.powerups.splice(this.powerups.indexOf(item), 1);
			const collectable = this.parent.scene.track.consumables.indexOf(item);
			if (collectable !== -1) {
				this.parent.scene.track.consumables.splice(collectable, 1);
			}
		}

		item.removed = true;
		this.rendered = false;
		return item
	}

	delete() {
		return this.parent.delete(this.row, this.column)
	}
}