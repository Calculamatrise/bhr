import Grid from "./grid/Grid.js";

export default class {
	grid = new Grid(this);
	physics = []
	scenery = []
	powerups = []
	addLineInternal(line) {
		for (const sector of this.grid.findTouchingSectors(line.a, line.b)) {
			sector[line.type].push(line);
			sector.rendered = false;
		}
	}

	read(a = "-18 1i 18 1i###BMX") {
		// this.helper.postMessage({
		// 	cmd: 'PARSE_TRACK',
		// 	code: arguments[0]
		// });
		const [physics, scenery, powerups] = a.split('#');
		physics && this.processChunk(physics.split(/,+/g));
		scenery && this.processChunk(scenery.split(/,+/g), 1);
		if (!powerups) return;
		for (let powerup of powerups.split(/,+/g)) {
			powerup = powerup.split(/\s+/g);
			let x = parseInt(powerup[1], 32);
			let y = parseInt(powerup[2], 32);
			let a = parseInt(powerup[3], 32);
			switch (powerup[0]) {
				case "T":
					powerup = new Target(this, x, y);
					this.collectables.push(powerup);
					break;
				case "C":
					powerup = new Checkpoint(this, x, y);
					this.collectables.push(powerup);
					break;
				case "B":
					powerup = new Boost(this, x, y, a + 180);
					break;
				case "G":
					powerup = new Gravity(this, x, y, a + 180);
					break;
				case "O":
					powerup = new Bomb(this, x, y);
					break;
				case "S":
					powerup = new Slowmo(this, x, y);
					break;
				case "A":
					powerup = new Antigravity(this, x, y);
					break;
				case "W":
					powerup = new Teleporter(this, x, y);
					powerup.createAlt(a, parseInt(powerup[4], 32));
					this.collectables.push(powerup);
					break;
			}

			if (powerup) {
				x = Math.floor(x / this.grid.scale);
				y = Math.floor(y / this.grid.scale);
				this.grid.sector(x, y, true).powerups.push(powerup);
			}
		}
	}

	toString() {
		return Array(this.physics, this.scenery, this.powerups).map(arr => arr.map(part => part.join(' ')).join(',')).join('#');
	}
}