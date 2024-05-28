import Coordinates from "../Coordinates.js";
import Gamepad from "../Gamepad.js";
import MTB from "../bike/MTB.js";
import BMX from "../bike/BMX.js";
import Ragdoll from "../bike/part/Ragdoll.js";
import Explosion from "../effect/Explosion.js";
import Shard from "../effect/Shard.js";
import SnapshotManager from "../managers/Snapshot.js";

const Bike = {
	MTB,
	BMX
}

export default class {
	dead = false;
	explosion = null;
	gamepad = new Gamepad();
	gravity = new Coordinates(0, .3);
	itemsCollected = new Set();
	ragdoll = null;
	records = Array.from({ length: 5 }, () => new Set());
	slow = false;
	slowParity = 0;
	snapshots = new SnapshotManager();
	constructor(parent, { vehicle }) {
		Object.defineProperty(this, 'scene', { value: parent || null });
		Object.defineProperty(this, 'snapshots', { enumerable: false });
		this.createCosmetics();
		this.createVehicle(vehicle);
		this.createRagdoll();
	}

	get targetsCollected() {
		return this.scene.track.consumables.filter(item => item.type == 'T' && this.itemsCollected.has(item.id)).length;
	}

	get trackComplete() {
		return this.targetsCollected === this.scene.targets;
	}

	createCosmetics() {
		this.cosmetics = this._user != void 0 ? this._user.cosmetics : { head: 'hat' }
	}

	createVehicle(vehicle = 'BMX') {
		this.vehicle = new Bike[vehicle](this);
	}

	createRagdoll() {
		if (this.dead) {
			this.ragdoll.setVelocity(this.vehicle.hitbox.velocity, this.vehicle.rearWheel.velocity);
			this.hat = new Shard(this.vehicle, this.vehicle.hitbox.position);
			this.hat.velocity.set(this.vehicle.hitbox.velocity);
			this.hat.size = 10;
			this.hat.rotationSpeed = .1;
			return;
		}

		this.ragdoll = new Ragdoll(this, this.vehicle.rider);
	}

	createExplosion(part) {
		this.explosion = new Explosion(this, part);
		this.dead = true;
	}

	setVehicle(vehicle) {
		this.scene.reset(vehicle || this.vehicle.name);
		this.scene.camera.focusPoint = this.vehicle.hitbox;
	}

	draw(ctx) {
		ctx.save();
		if (this.explosion) {
			this.explosion.draw(ctx);
		} else {
			this.vehicle.draw(ctx);
			this.ragdoll.draw(ctx);
			if (this.dead && this.hat) {
				this.hat.draw(ctx);
			}
		}

		ctx.restore();
	}

	gotoCheckpoint() {
		let snapshotExists = this.snapshots.length > 0;
		snapshotExists && this.restore(this.snapshots.at(-1));
		return snapshotExists;
	}

	removeCheckpoint() {
		this.snapshots.length > 0 && this.snapshots.cache.push(this.snapshots.pop());
		// this.gotoCheckpoint();
	}

	restoreCheckpoint() {
		this.snapshots.cache.length > 0 && this.snapshots.push(this.snapshots.cache.pop());
		// this.gotoCheckpoint();
	}

	save() {
		return {
			currentTime: this.scene.currentTime,
			dead: this.dead,
			downKeys: new Set(this.gamepad.downKeys),
			gravity: this.gravity.clone(),
			itemsCollected: new Set(this.itemsCollected),
			playbackTicks: this.playbackTicks ?? this.scene.currentTime,
			records: this.records.map(record => new Set(record)),
			slow: this.slow,
			vehicle: this.vehicle.clone()
		}
	}

	fixedUpdate() {
		if (this.scene.targets > 0 && this.targetsCollected === this.scene.targets) {
			return;
		} else if (this.explosion) {
			this.explosion.fixedUpdate();
			return;
		}

		this.vehicle.fixedUpdate();
		if (this.dead) {
			this.ragdoll.fixedUpdate();
			this.hat && this.hat.fixedUpdate();
		} else {
			this.ragdoll.setPosition(this.vehicle.rider);
		}
	}

	update(progress, delta) {
		if (this.explosion) {
			this.explosion.update(progress, delta);
			return;
		}

		this.vehicle.update(progress);
		if (this.dead) {
			this.ragdoll.update(progress);
			this.hat && this.hat.update(progress, delta);
		} else {
			this.ragdoll.setPosition(this.vehicle.rider);
		}
	}

	nativeUpdate() {
		if (this.scene.targets > 0 && this.targetsCollected === this.scene.targets) {
			return;
		} else if (this.explosion) {
			this.explosion.fixedUpdate();
			return;
		}

		this.vehicle.nativeUpdate();
		if (this.dead) {
			this.ragdoll.nativeUpdate();
			this.hat && this.hat.fixedUpdate();
		} else {
			this.ragdoll.setPosition(this.vehicle.rider);
		}
	}

	restore(snapshot) {
		this.explosion = null;
		this.slow = snapshot.slow;
		this.dead = snapshot.dead;
		this.itemsCollected = new Set(snapshot.itemsCollected);
		this.records = snapshot.records.map(record => new Set(record));
		this.gravity = snapshot.gravity.clone();
		this.vehicle = snapshot.vehicle.clone();
		this.createRagdoll()
	}

	reset(vehicle) {
		this.dead = false;
		this.explosion = null;
		this.gravity = new Coordinates(0, .3);
		this.hat = null;
		this.itemsCollected.clear();
		this.slow = false;
		this.snapshots.clear();
		this.createVehicle(vehicle || this.vehicle.name);
		this.ragdoll.setPosition(this.vehicle.rider);
	}
}