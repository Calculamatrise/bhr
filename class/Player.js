import SnapshotHandler from "./handler/Snapshot.js";
import Gamepad from "./Gamepad.js";
import Vector from "./Vector.js";
import MTB from "./bike/MTB.js";
import BMX from "./bike/BMX.js";
import Ragdoll from "./bike/part/Ragdoll.js";
import Explosion from "./effect/Explosion.js";
import Shard from "./effect/Shard.js";

const bike = {
    MTB,
    BMX
}

export default class Player {
    constructor(parent, { vehicle, ghost }) {
        this.track = parent;
        this.ghostData = ghost;
        this.gravity = new Vector(0, 0.3);
        this.snapshots = new SnapshotHandler();
        this.gamepad = new Gamepad(this);
        if (!this.ghost) {
            this.gamepad.init();
            this.gamepad.on("keydown", this.updateControls.bind(this));
            this.gamepad.on("keyup", this.updateControls.bind(this));
        }
        
        this.createCosmetics();
        this.createVehicle(vehicle);
    }
    slow = false;
    dead = false;
    ragdoll = null;
    explosion = null;
    powerupsEnabled = true;
    targetsCollected = 0;
    powerupsConsumed = 0;
    get ghost() {
        return !!this.ghostData;
    }
    createCosmetics() {
        this.cosmetics = this._user != void 0 ? this._user.cosmetics : { head: "hat" }
    }
    createVehicle(vehicle = "BMX") {
        this.vehicle = new bike[vehicle](this);
    }
    createRagdoll() {
        this.ragdoll = new Ragdoll(this, this.vehicle.rider);
        this.ragdoll.setVelocity(this.vehicle.head.velocity, this.vehicle.rearWheel.velocity);
        this.ragdoll.dir = this.vehicle.dir;
        this.ragdoll.gravity = this.gravity;

        this.hat = new Shard(this, this.vehicle.head.position.clone());
        this.hat.velocity = this.vehicle.head.velocity.clone();
        this.hat.size = 10;
        this.hat.rotationFactor = .1;
    }
    createExplosion(part) {
        this.explosion = new Explosion(this, part);
    }
    draw(ctx) {
        if (this.explosion) {
            this.explosion.draw(ctx);
        } else {
            this.vehicle.draw(ctx);
            if (this.dead) {
                this.ragdoll.draw(ctx);
                this.hat.draw(ctx);
            }
        }
    }
    fixedUpdate() {
        if (this.pastCheckpoint)
            this.trackComplete();

        if (this.ghost) {
            if (this.ghostData[0][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("ArrowLeft")) {
                    this.gamepad.downKeys.delete("ArrowLeft");
                } else {
                    this.gamepad.downKeys.set("ArrowLeft", true);
                }
            }

            if (this.ghostData[1][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("ArrowRight")) {
                    this.gamepad.downKeys.delete("ArrowRight");
                } else {
                    this.gamepad.downKeys.set("ArrowRight", true);
                }
            }

            if (this.ghostData[2][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("ArrowUp")) {
                    this.gamepad.downKeys.delete("ArrowUp");
                } else {
                    this.gamepad.downKeys.set("ArrowUp", true);
                }
            }

            if (this.ghostData[3][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("ArrowDown")) {
                    this.gamepad.downKeys.delete("ArrowDown");
                } else {
                    this.gamepad.downKeys.set("ArrowDown", true);
                }
            }

            if (this.ghostData[4][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("z")) {
                    this.gamepad.downKeys.delete("z");
                } else {
                    this.gamepad.downKeys.set("z", true);
                    this.vehicle.swap();
                }
            }
        }

        if (this.explosion) {
            this.explosion.fixedUpdate();
        } else {
            this.vehicle.fixedUpdate();
            if (this.dead) {
                this.ragdoll.fixedUpdate();
                this.hat.fixedUpdate();
            }
        }
    }
    update(delta) {
        if (this.pastCheckpoint)
            this.trackComplete();

        if (this.ghost) {
            if (this.ghostData[0][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("ArrowLeft")) {
                    this.gamepad.downKeys.delete("ArrowLeft");
                } else {
                    this.gamepad.downKeys.set("ArrowLeft", true);
                }
            }

            if (this.ghostData[1][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("ArrowRight")) {
                    this.gamepad.downKeys.delete("ArrowRight");
                } else {
                    this.gamepad.downKeys.set("ArrowRight", true);
                }
            }

            if (this.ghostData[2][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("ArrowUp")) {
                    this.gamepad.downKeys.delete("ArrowUp");
                } else {
                    this.gamepad.downKeys.set("ArrowUp", true);
                }
            }

            if (this.ghostData[3][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("ArrowDown")) {
                    this.gamepad.downKeys.delete("ArrowDown");
                } else {
                    this.gamepad.downKeys.set("ArrowDown", true);
                }
            }

            if (this.ghostData[4][this.track.currentTime]) {
                if (this.gamepad.downKeys.has("z")) {
                    this.gamepad.downKeys.delete("z");
                } else {
                    this.gamepad.downKeys.set("z", true);
                    this.vehicle.swap();
                }
            }
        }

        if (this.explosion) {
            this.explosion.update();
        } else {
            this.vehicle.update(delta);
            if (this.dead) {
                this.ragdoll.update();
                this.hat.update();
            }
        }
    }
    updateControls(key) {
        if (this.dead)
            return;

        switch(key) {
            case "a":
            case "ArrowLeft":
                //break;

            case "d":
            case "ArrowRight":
                //break;

            case "w":
            case "ArrowUp":
                //break;

            case "s":
            case "ArrowDown":
                this.track.cameraFocus = this.vehicle.head;
                //this.vehicle.updateControls();
                break;

            case "z":
                this.track.cameraFocus = this.vehicle.head;
                if (this.gamepad.downKeys.has("z"))
                    this.vehicle.swap();
            break;
        }
    }
    collide(a) {
        if (this.snapshots && this.snapshots[a]) {
            for (const i in this.snapshots) {
                this.snapshots[i].apply(this, _slice.call(arguments, 1))
            }
        }
    }
    trackComplete() {
        let e = this.track;
        this.collide("hitTarget");
        if (this.pastCheckpoint & 2) {
            this.collide("hitGoal");
            if (this.track.targets && e.targetsCollected === e.targets && 0 < e.currentTime && (!e.time || this.time < e.time) && e.id !== void 0) {
                const records = `${game.track.firstPlayer.gamepad.records.map(function(record) {
                    if (typeof record === "object")
                        return Object.keys(record).join(" ");
                
                    return record;
                }).join(",")},${this.track.currentTime},${this.vehicle.name}`;
                const c = new XMLHttpRequest;
                c.open("POST", "/tracks/ghost_save", true);
                c.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                c.onload = function() {
                    if (c.readyState === c.DONE) {
                        if (c.status === 200) {
                            if (c.response.startsWith("Ghost")) {
                                alert(c.response)
                            }
                        }
                    }
                };
                c.send("id=" + window.location.pathname.split("/")[2] + "&vehicle=" + this.vehicle + "&time=" + e.currentTime + "&code=" + records);
                this.gamepad.left = this.gamepad.right = this.gamepad.up = this.gamepad.down = 0
            }
        } else if (this.pastCheckpoint & 1) {
            this.collide("hitCheckpoint");
            for (const player of this.track.players) {
                player.snapshots.push(player.snapshot())
            }
        }
        this.pastCheckpoint = 0;
    }
    snapshot() {
        return this.vehicle.snapshot();
    }
    restore(snapshot) {
        console.log(snapshot)
        this.vehicle.masses[0].position = snapshot.masses[0].position;
        this.vehicle.masses[0].old = snapshot.masses[0].old;
        this.vehicle.masses[0].velocity = snapshot.masses[0].velocity;
        this.vehicle.masses[1].position = snapshot.masses[1].position;
        this.vehicle.masses[1].old = snapshot.masses[1].old;
        this.vehicle.masses[1].velocity = snapshot.masses[1].velocity;
        this.vehicle.masses[2].position = snapshot.masses[2].position;
        this.vehicle.masses[2].old = snapshot.masses[2].old;
        this.vehicle.masses[2].velocity = snapshot.masses[2].velocity;
        this.vehicle.masses[1].motor = snapshot.masses[1].motor;
        this.vehicle.masses[2].motor = snapshot.masses[2].motor;
        this.vehicle.springs[0].leff = snapshot.springs[0].leff;
        this.vehicle.springs[1].leff = snapshot.springs[1].leff;
        this.vehicle.springs[2].leff = snapshot.springs[2].leff;
    }
    reset() {
        this.slow = false;
        this.dead = false;
        this.ragdoll = null;
        this.explosion = null;
        this.powerupsEnabled = true;
        this.targetsCollected = 0;
        this.powerupsConsumed = 0;

        this.snapshots = new SnapshotHandler();

        this.gamepad.reset();

        this.gravity = new Vector(0,.3);
        this.createVehicle(this.vehicle.name);
    }
}