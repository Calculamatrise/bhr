import BasePlayer from "./BasePlayer.js";

export default class extends BasePlayer {
	pendingConsumables = 0;
	constructor(parent, config = {}) {
		super(parent, config);
		this.gamepad._listen();
		this.gamepad.on('down', this.updateRecords.bind(this));
		this.gamepad.on('up', this.updateRecords.bind(this));
		Object.defineProperty(parent, 'firstPlayer', { value: this });
	}

	checkComplete() {
		if (this.targetsCollected === this.scene.targets && this.scene.currentTime > 0 && !this.scene.track.writable) {
			if (!navigator.onLine) {
				this.scene.parent.once('trackComplete', function(record) {
					const TEMP_KEY = 'bhr-temp';
					let data = localStorage.getItem(TEMP_KEY) || {};
					data.savedGhosts ||= [];
					data.savedGhosts.push(record);
					localStorage.setItem(TEMP_KEY, JSON.stringify(data));
				})
			}

			this.scene.parent.emit('trackComplete', {
				code: `${this.scene.firstPlayer.records.map(record => Array.from(record).join(' ')).join(',')},${this.scene.currentTime},${this.vehicle.name}`,
				id: this.scene.id ?? location.pathname.split('/')[2],
				time: this.scene.currentTime,
				vehicle: this.vehicle.name
			})
		}
	}

	fixedUpdate() {
		if (this.pendingConsumables) {
			if (this.pendingConsumables & 2) this.checkComplete();
			if (this.pendingConsumables & 1) {
				this.snapshots.push(this.save());
				for (const playerGhost of this.scene.ghosts) {
					playerGhost.snapshots.push(playerGhost.save());
				}
			}

			this.pendingConsumables = 0;
		}

		return super.fixedUpdate()
	}

	nativeUpdate() {
		if (this.pendingConsumables) {
			if (this.pendingConsumables & 2) this.checkComplete();
			if (this.pendingConsumables & 1) {
				this.snapshots.push(this.save());
				for (const playerGhost of this.scene.ghosts) {
					playerGhost.snapshots.push(playerGhost.save());
				}
			}

			this.pendingConsumables = 0;
		}

		return super.nativeUpdate()
	}

	switchBike() {
		this.setVehicle(this.vehicle.name != 'BMX' ? 'BMX' : 'MTB')
	}

	updateRecords(keys) {
		if (!keys || keys.size === 0 || this.dead || this.scene.processing || this.scene.ghostInFocus) return;
		this.scene.cameraFocus = this.vehicle.hitbox;
		this.scene.parent.settings.autoPause && (this.scene.frozen = false);
		typeof keys == 'string' && (keys = new Set([keys]));
		let t = this.scene.currentTime;
		keys.has('left') && !this.records[0].delete(t) && this.records[0].add(t);
		keys.has('right') && !this.records[1].delete(t) && this.records[1].add(t);
		keys.has('up') && !this.records[2].delete(t) && this.records[2].add(t);
		keys.has('down') && !this.records[3].delete(t) && this.records[3].add(t);
		if (keys.has('z') && this.gamepad.downKeys.has('z')) {
			this.records[4].delete(t) || this.records[4].add(t);
			this.vehicle.swap();
		}
	}

	restore(snapshot) {
		this.scene.currentTime = snapshot.currentTime;
		super.restore(snapshot);
		let changed = new Set();
		for (const key of snapshot.downKeys) {
			if (!this.gamepad.downKeys.has(key)) {
				changed.add(key);
			}
		}

		for (const key of this.gamepad.downKeys) {
			if (!snapshot.downKeys.has(key)) {
				changed.add(key);
			}
		}

		this.updateRecords(changed);
	}

	reset() {
		this.pendingConsumables = 0;
		this.records.forEach(set => set.clear());
		this.updateRecords(this.gamepad.downKeys);
		return super.reset(...arguments)
	}
}