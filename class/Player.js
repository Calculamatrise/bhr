import SnapshotHandler from "./handler/Snapshot.js";
import Gamepad from "./Gamepad.js";
import Vector from "./Vector.js";
import MTB from "./bike/MTB.js";
import BMX from "./bike/BMX.js";
import Ragdoll from "./bike/part/Ragdoll.js";
import Explosion from "./effect/Explosion.js";
import Shard from "./effect/Shard.js";

const Bike = {
    MTB,
    BMX
}

export default class Player {
    constructor(parent, { vehicle, ghost }) {
        this.scene = parent;
        this.ghostData = ghost;
        this.ghost = !!this.ghostData;
        if (!this.ghost) {
            this.gamepad.init();
        }

        this.createCosmetics();
        this.createVehicle(vehicle);
        this.createRagdoll();
    }
    hat = null;
    slow = false;
    dead = false;
    ragdoll = null;
    explosion = null;
    itemsCollected = new Set();
    gravity = new Vector(0, .3);
    gamepad = new Gamepad(this);
    snapshots = new SnapshotHandler();
    records = Array.from({ length: 5 }, () => new Set());
    get targetsCollected() {
        return this.scene.collectables.filter(item => item.type === "T" && this.itemsCollected.has(item.id)).length;
    }
    
    createCosmetics() {
        this.cosmetics = this._user != void 0 ? this._user.cosmetics : { head: "hat" }
    }

    createVehicle(vehicle = "BMX") {
        this.vehicle = new Bike[vehicle](this);
    }

    createRagdoll() {
        if (this.dead) {
            this.ragdoll = new Ragdoll(this, this.vehicle.rider);
            this.ragdoll.setVelocity(this.vehicle.head.velocity, this.vehicle.rearWheel.velocity);
            this.hat = new Shard(this, this.vehicle.head.position.clone());
            this.hat.velocity = this.vehicle.head.velocity.clone();
            this.hat.size = 10;
            this.hat.rotationFactor = .1;

            return;
        }
        
        // this.ragdoll = new Ragdoll(this, this.vehicle.rider);
    }

    createExplosion(part) {
        this.dead = true;
        this.explosion = new Explosion(this, part);
    }

    update(delta) {
        if (this.targetsCollected === this.scene.targets) {
            return;
        }

        if (this.explosion) {
            this.explosion.update();

            return;
        }

        if (this.ghost) {
            if (this.ghostData[0] && this.ghostData[0][this.scene.currentTime]) {
                this.gamepad.toggle("left");
            }

            if (this.ghostData[1] && this.ghostData[1][this.scene.currentTime]) {
                this.gamepad.toggle("right");
            }

            if (this.ghostData[2] && this.ghostData[2][this.scene.currentTime]) {
                this.gamepad.toggle("up");
            }

            if (this.ghostData[3] && this.ghostData[3][this.scene.currentTime]) {
                this.gamepad.toggle("down");
            }

            if (this.ghostData[4] && this.ghostData[4][this.scene.currentTime]) {
                this.vehicle.swap();
            }
        } else if (this.scene.currentTime === 0) {
            this.updateRecords(this.gamepad.downKeys);
        }

        this.vehicle.update(delta);
        if (this.dead) {
            this.ragdoll.update();
            this.hat.update();
        } else {
            //this.ragdoll.updatePosition(this.vehicle.rider);
        }
    }

    updateRecords(keys) {
        if (!keys) {
            return;
        }

        this.scene.cameraFocus = this.vehicle.head;
        if (typeof keys === "string") {
            keys = new Set([
                keys
            ]);
        }

        if (keys.has("left") && !this.records[0].delete(this.scene.currentTime)) {
            this.records[0].add(this.scene.currentTime);
        }

        if (keys.has("right") && !this.records[1].delete(this.scene.currentTime)) {
            this.records[1].add(this.scene.currentTime);
        }

        if (keys.has("up") && !this.records[2].delete(this.scene.currentTime)) {
            this.records[2].add(this.scene.currentTime);
        }

        if (keys.has("down") && !this.records[3].delete(this.scene.currentTime)) {
            this.records[3].add(this.scene.currentTime);
        }

        if (keys.has("z") && !this.records[4].delete(this.scene.currentTime) && this.gamepad.downKeys.has("z") && !this.scene.paused) {
            this.records[4].add(this.scene.currentTime);
            this.vehicle.swap();
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.explosion) {
            this.explosion.draw(ctx);
        } else {
            this.vehicle.draw(ctx);
            // this.ragdoll.draw(ctx);
            if (this.dead) {
                this.ragdoll.draw(ctx);
                this.hat.draw(ctx);
            }
        }

        ctx.restore();
    }

    collect(powerup) {
        switch(powerup) {
            case "checkpoint":
                if (this.ghost) {
                    break;
                }

                for (const player of this.scene.players) {
                    player.snapshots.push(player.snapshot());
                }

                // this.scene.gotoCheckpoint();
                break;

            case "target":
                if (this.ghost) {
                    break;
                }

                if (this.targetsCollected !== this.scene.targets) {
                    break;
                }

                this.trackComplete();
                break;
        }
    }

    trackComplete() {
        if (this.targetsCollected === this.scene.targets && this.scene.currentTime > 0 && !this.scene.editor) {
            fetch("/tracks/ghost_save", {
                method: "post",
                body: new URLSearchParams({
                    id: window.location.pathname.split("/")[2],
                    vehicle: this.vehicle.name,
                    time: this.scene.currentTime,
                    code: `${game.scene.firstPlayer.gamepad.records.map(record => Object.keys(record).join(" ")).join(",")},${this.scene.currentTime},${this.vehicle.name}`
                })
            });
        }
    }

    snapshot() {
        return {
            slow: this.slow,
            dead: this.dead,
            gravity: this.gravity.clone(),
            currentTime: this.scene.currentTime,
            itemsCollected: new Set([...this.itemsCollected]),
            records: [...this.records.map(record => new Set([...record]))],
            vehicle: this.vehicle.clone()
        }
    }

    restore(snapshot) {
        this.dead = false;
        this.ragdoll = null;
        this.explosion = null;
        this.slow = snapshot.slow;
        this.dead = snapshot.dead;
        this.records = [...snapshot.records.map(record => new Set([...record]))];
        this.itemsCollected = new Set([...snapshot.itemsCollected]);
        this.gravity = snapshot.gravity.clone();
        this.vehicle = snapshot.vehicle.clone();
    }

    reset() {
        this.hat = null;
        this.slow = false;
        this.dead = false;
        this.ragdoll = null;
        this.explosion = null;
        this.itemsCollected = new Set();
        this.records = Array.from({ length: 5 }, () => new Set());
        this.snapshots.reset();
        if (this.ghost) {
            this.gamepad.downKeys.clear();
        }

        this.gravity = new Vector(0, .3);
        this.createVehicle(this.vehicle.name);
        // this.ragdoll.updatePosition(this.vehicle.rider);
    }
}