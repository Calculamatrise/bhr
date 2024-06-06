import BasePlayer from "./BasePlayer.js";

export default class extends BasePlayer {
	playbackIterator = null;
	playbackTicks = 0;
	runTime = 0;
	constructor(parent, config = {}) {
		super(parent, config);
		for (let key in config) {
			switch(key) {
			case 'records':
				if (typeof config[key] != 'object' || config[key] === null)
					break;
				for (let index in config[key]) {
					if (typeof config[key][index] != 'object' || config[key][index] === null)
						break;
					for (let entry of config[key][index]) {
						this.records.length > index && this.records[index].add(isNaN(entry) ? entry : parseInt(entry));
					}
				}
				break;
			case 'time':
				this.runTime = parseInt(config[key]);
			}
		}

		this.playbackIterator = this.createIterator();
		this.playbackTicks = this.scene.currentTime;
		Object.defineProperty(this, 'ghost', { value: true })
	}

	drawName(ctx, offset) {
		let i = (playerGhost.name || 'Ghost') + (playerGhost.targetsCollected === this.track.targets ? " finished!" : ": " + playerGhost.targetsCollected + " / " + this.track.targets);
		text = ctx.measureText(i)
		let textHeight = text.actualBoundingBoxAscent + text.actualBoundingBoxDescent;
		let rectPadding = 5;
		ctx.beginPath()
		ctx.roundRect(ctx.canvas.width - 12 - text.width - rectPadding, 12 + textHeight * offset + offset * 12 - textHeight / 2 - rectPadding, text.width + rectPadding * 2, (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 2 + rectPadding * 2, 40);
		ctx.save()
		ctx.fillStyle = 'hsl(0deg 0% 50% / 50%)' // if ghost is in focus, make it apparent
		ctx.fill()
		ctx.restore()
		ctx.fillText(i, ctx.canvas.width - 12, 12 + textHeight * offset + offset * 12)
	}

	fixedUpdate() {
		// console.log(this.playbackTicks, this.playbackTicks * this.scene.parent.max)
		this.records[0].has(this.playbackTicks * this.scene.parent.max) && this.gamepad.toggle('left');
		this.records[1].has(this.playbackTicks * this.scene.parent.max) && this.gamepad.toggle('right');
		this.records[2].has(this.playbackTicks * this.scene.parent.max) && this.gamepad.toggle('up');
		this.records[3].has(this.playbackTicks * this.scene.parent.max) && this.gamepad.toggle('down');
		this.records[4].has(this.playbackTicks * this.scene.parent.max) && this.vehicle.swap();
		super.fixedUpdate()
	}

	nativeUpdate() {
		this.records[0].has(this.playbackTicks * this.scene.parent.max) && this.gamepad.toggle('left');
		this.records[1].has(this.playbackTicks * this.scene.parent.max) && this.gamepad.toggle('right');
		this.records[2].has(this.playbackTicks * this.scene.parent.max) && this.gamepad.toggle('up');
		this.records[3].has(this.playbackTicks * this.scene.parent.max) && this.gamepad.toggle('down');
		this.records[4].has(this.playbackTicks * this.scene.parent.max) && this.vehicle.swap();
		super.nativeUpdate()
	}

	// #ticks = 0;
	// set currentTime(value) {
	// 	if (this.ghost) {
	// 		this.records[0].has(this.#ticks * this.scene.parent.max) && this.gamepad.toggle('left');
	// 		this.records[1].has(this.#ticks * this.scene.parent.max) && this.gamepad.toggle('right');
	// 		this.records[2].has(this.#ticks * this.scene.parent.max) && this.gamepad.toggle('up');
	// 		this.records[3].has(this.#ticks * this.scene.parent.max) && this.gamepad.toggle('down');
	// 		this.records[4].has(this.#ticks * this.scene.parent.max) && this.vehicle.swap();
	// 	}

	// 	this.nativeUpdate();
	// 	this.#ticks = value;
	// }

	*createIterator(nextTick = 0) {
		const snapshots = new Map();
		this.playbackTicks = 0;
		while (this.targetsCollected !== this.scene.targets) {
			snapshots.has(this.playbackTicks) || snapshots.set(this.playbackTicks, this.save());
			if (this.playbackTicks >= nextTick) {
				const value = parseInt(yield this.playbackTicks);
				if (isFinite(value)) {
					// create new ghost player and skip to previous tick to rewind
					if (snapshots.has(value)) {
						this.restore(snapshots.get(value));
						this.playbackTicks = value;
					}

					this.scene.cameraFocus = this.hitbox;
					this.scene.camera.set(this.scene.cameraFocus.position);
					nextTick = value;
					continue;
				} else {
					nextTick = this.playbackTicks + 1;
				}
			}

			this.scene.parent.ups !== 50 ? this.nativeUpdate() : this.fixedUpdate();
			this.playbackTicks++;
			this.scene.camera.focusPoint === this.hitbox && this.scene.parent.emit('replayProgress', this.playbackTicks);
		}

		return snapshots;
	}

	reset() {
		super.reset(...arguments);
		this.gamepad.downKeys.clear();
		this.playbackTicks = this.scene.currentTime;
		this.playbackIterator = this.createIterator();
	}

	restore(snapshot) {
		super.restore(snapshot);
		this.gamepad.downKeys = new Set(snapshot.downKeys);
		this.playbackTicks = snapshot.playbackTicks;
	}
}