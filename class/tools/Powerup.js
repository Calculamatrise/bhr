import Tool from "./Tool.js";

import Target from "../item/Target.js";
import Checkpoint from "../item/Checkpoint.js";
import Bomb from "../item/Bomb.js";
import Slowmo from "../item/Slowmo.js";
import Antigravity from "../item/Antigravity.js";
import Teleporter from "../item/Teleporter.js";

export default class extends Tool {
	get Powerup() {
		switch (this.parent.selected) {
			case 'goal': return Target;
			case 'checkpoint': return Checkpoint;
			case 'bomb': return Bomb;
			case 'slow-mo': return Slowmo;
			case 'antigravity': return Antigravity;
			case 'teleporter': return Teleporter;
		}
	}

	teleporter = null;
	addPowerup(powerup) {
		let x = Math.floor(powerup.position.x / this.scene.grid.scale);
		let y = Math.floor(powerup.position.y / this.scene.grid.scale);
		this.scene.grid.sector(x, y, true).powerups.push(powerup);
		if (['goal', 'checkpoint', 'teleporter'].includes(this.parent.selected)) {
			this.scene.collectables.push(powerup);
			if (this.parent.selected == 'teleporter') {
				this.teleporter = powerup;
			}
		}
	}

	clip() {
		if (this.parent.selected != 'teleporter') {
			return;
		}

		Teleporter.clip.apply(this, arguments);
	}

	draw(ctx) {
		let position = this.mouse.position.toPixel();
		if (this.scene.cameraLock && this.parent.selected === 'teleporter') {
			let position = this.mouse.position.toPixel();
			let old = this.mouse.old.toPixel();
			let start = position.x < 50;
			let end = position.x > this.scene.parent.canvas.width - 50;
			if (start || end) {
				this.scene.camera.x += 4 / this.scene.zoom * (1 + (start && -2));
				this.mouse.position.x += 4 / this.scene.zoom * (1 + (start && -2));
			}

			start = position.y < 50;
			end = position.y > this.scene.parent.canvas.height - 50;
			if (start || end) {
				this.scene.camera.y += 4 / this.scene.zoom * (1 + (start && -2));
				this.mouse.position.y += 4 / this.scene.zoom * (1 + (start && -2));
			}

			position = this.mouse.position.toPixel();
			ctx.save(),
			ctx.beginPath(),
			ctx.lineWidth = Math.max(2 * this.parent.scene.zoom, 0.5),
			ctx.strokeStyle = '#f00',
			ctx.moveTo(old.x, old.y),
			ctx.lineTo(position.x, position.y),
			ctx.stroke(),
			ctx.restore();
		}

		ctx.beginPath(),
		ctx.lineWidth = 2 * this.parent.scene.zoom,
		ctx.fillStyle = this.Powerup.color,
		ctx.arc(position.x, position.y, 7 * this.parent.scene.zoom, 0, 2 * Math.PI),
		ctx.fill(),
		ctx.stroke();
	}

	press() {
		this.addPowerup(new this.Powerup(this.scene, this.mouse.old.x, this.mouse.old.y));
	}
}