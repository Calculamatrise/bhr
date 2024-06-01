import BackgroundGrid from "./BackgroundGrid.js";

self.scene = {};
self.backgroundGrid = new BackgroundGrid(self);
// self.foregroundGrid = new 
addEventListener('message', async ({ data }) => {
	console.log(data)
	data.hasOwnProperty('scene') && Object.merge(self.scene, data.scene);
	switch(data.code) {
	case 1:
		const [physics, scenery, powerups] = String(data.data).split('#');
		physics && parseLines(physics.split(/,+/g));
		scenery && parseLines(scenery.split(/,+/g), 1);
		console.log(self.backgroundGrid)
		// if (!powerups) break;
		// for (let powerup of powerups) {
		// 	powerup = powerup.split(/\s+/g);
		// 	let x = parseInt(powerup[1], 32);
		// 	let y = parseInt(powerup[2], 32);
		// 	let a = parseInt(powerup[3], 32);
		// 	switch (powerup[0]) {
		// 	case 'T':
		// 		self.postMessage({ cmd: 'ADD_POWERUP', type: 'Target', args: [x, y] });
		// 		break;
		// 	case 'C':
		// 		self.postMessage({ cmd: 'ADD_POWERUP', type: 'Checkpoint', args: [x, y] });
		// 		break;
		// 	case 'B':
		// 		self.postMessage({ cmd: 'ADD_POWERUP', type: 'Boost', args: [x, y, a + 180] });
		// 		break;
		// 	case 'G':
		// 		self.postMessage({ cmd: 'ADD_POWERUP', type: 'Gravity', args: [x, y, a + 180] });
		// 		break;
		// 	case 'O':
		// 		self.postMessage({ cmd: 'ADD_POWERUP', type: 'Bomb', args: [x, y] });
		// 		break;
		// 	case 'S':
		// 		self.postMessage({ cmd: 'ADD_POWERUP', type: 'Slowmo', args: [x, y] });
		// 		break;
		// 	case 'A':
		// 		self.postMessage({ cmd: 'ADD_POWERUP', type: 'Antigravity', args: [x, y] });
		// 		break;
		// 	case 'W':
		// 		self.postMessage({ cmd: 'ADD_POWERUP', type: 'Teleporter', args: [x, y, a, parseInt(powerup[4], 32)] });
		// 		break;
		// 	}
		// }

		self.backgroundGrid.cache();
		self.postMessage({ board: await self.backgroundGrid.toBitmap(), code: 0 }); // emit ready
		// only send sectors that will be visible.
		break;
	case 2: // update?
		break;
	}
}, { passive: true });

function parseLines(lines, scenery) {
	let combined = [];
	for (let i in lines) {
		let line = lines[i];
		let coords = line.split(/\s+/g);
		if (coords.length < 4) continue;
		for (let o = 0; o < coords.length - 2; o += 2) {
			let x = parseInt(coords[o], 32),
				y = parseInt(coords[o + 1], 32),
				l = parseInt(coords[o + 2], 32),
				c = parseInt(coords[o + 3], 32);
			isNaN(x + y + l + c) || self.backgroundGrid.addItem({ a: { x, y }, b: { x: l, y: c }, type: scenery ? 'scenery' : 'physics' })
		}
		self.postMessage({
			code: 2,
			[(scenery ? 'scenery' : 'physics') + 'Progress']: Math.floor(i / (lines.length - 1) * 100)
		});
	}

	return combined;
}

Object.defineProperty(Object, 'merge', {
	value: function merge(target, ...sources) {
		if (typeof target == 'undefined') {
			throw new TypeError("Cannot convert undefined or null to object");
		} else if (Array.isArray(target)) {
			target.push(...sources.flat());
			return target;
		}
		for (const source of sources) {
			for (const key in source) {
				if (!source.hasOwnProperty(key)) continue;
				if (typeof target[key] == 'object' && target[key] !== null && typeof source[key] == 'object') {
					Object.merge(target[key], source[key]);
					continue;
				} else if (Array.isArray(target[key]) && Array.isArray(source[key])) {
					target[key] = target[key].concat(source[key]);
					continue;
				}

				target[key] = source[key];
			}
		}

		return target;
	},
	writable: true
});