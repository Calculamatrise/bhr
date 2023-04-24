import Tool from "./Tool.js";
import Antigravity from "../item/Antigravity.js";
import Bomb from "../item/Bomb.js";
import Boost from "../item/Boost.js";
import Checkpoint from "../item/Checkpoint.js";
import Gravity from "../item/Gravity.js";
import Slowmo from "../item/Slowmo.js";
import Target from "../item/Target.js";
import Teleporter from "../item/Teleporter.js";

const P = {
	antigravity: Antigravity,
	bomb: Bomb,
	boost: Boost,
	checkpoint: Checkpoint,
	gravity: Gravity,
	'slow-mo': Slowmo,
	goal: Target,
	teleporter: Teleporter
}

export default class extends Tool {
	addPowerup(powerup) {
		let x = Math.floor(powerup.position.x / this.scene.grid.scale);
		let y = Math.floor(powerup.position.y / this.scene.grid.scale);
		this.scene.grid.sector(x, y, true).powerups.push(powerup);
		if (['goal', 'checkpoint', 'teleporter'].includes(this.parent.selected)) {
			this.scene.collectables.push(powerup);
		}
	}

	clip() {
		this.addPowerup(this.powerup);
		this.update();
	}

	draw(ctx) {
		this.powerup.draw(ctx);
	}

	press() {
		this.powerup.position.set(this.mouse.old);
	}

	stroke() {
		this.mouse.down || this.powerup.position.set(this.mouse.position);
	}

	update() {
		this.powerup = new P[this.parent.selected](this.scene, this.mouse.position.x, this.mouse.position.y);
	}
}