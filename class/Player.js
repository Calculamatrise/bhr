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
        this.gamepad = new Gamepad(this);
        if (!this.ghost) {
            this.gamepad.init();
        }

        this.gamepad.on("keydown", this.updateControls.bind(this));
        this.gamepad.on("keyup", this.updateControls.bind(this));
        
        this.createCosmetics();
        this.createVehicle(vehicle);
        this.createRagdoll();
    }

    slow = false;
    dead = false;
    ragdoll = null;
    explosion = null;
    powerupsEnabled = true;
    targetsCollected = 0;
    powerupsConsumed = [];
    gravity = new Vector(0, .3);
    snapshots = new SnapshotHandler();
    get ghost() {
        return !!this.ghostData;
    }
    
    createCosmetics() {
        this.cosmetics = this._user != void 0 ? this._user.cosmetics : { head: "hat" }
    }

    createVehicle(vehicle = "BMX") {
        this.vehicle = new Bike[vehicle](this);
    }

    createRagdoll() {
        if (this.dead) {
            this.ragdoll.setVelocity(this.vehicle.head.velocity, this.vehicle.rearWheel.velocity);
            this.hat = new Shard(this, this.vehicle.head.position.clone());
            this.hat.velocity = this.vehicle.head.velocity.clone();
            this.hat.size = 10;
            this.hat.rotationFactor = .1;

            return;
        }
        
        this.ragdoll = new Ragdoll(this, this.vehicle.rider);
    }

    createExplosion(part) {
        this.dead = true;
        this.explosion = new Explosion(this, part);
    }

    update(delta) {
        if (this.explosion) {
            this.explosion.update();

            return;
        }

        // don't want to record keys that press when paused, but we want them to remain after the user unpauses

        if (this.ghost) {
            for (let key in this.ghostData) {
                if (this.ghostData[key][this.scene.currentTime]) {
                    switch(+key) {
                        case 0:
                            this.gamepad.toggle("ArrowLeft");
                            break;

                        case 1:
                            this.gamepad.toggle("ArrowRight");
                            break;

                        case 2:
                            this.gamepad.toggle("ArrowUp");
                            break;

                        case 3:
                            this.gamepad.toggle("ArrowDown");
                            break;

                        case 4:
                            this.vehicle.swap();
                            continue;

                        default:
                            continue;
                    }
                }
            }
        }

        this.vehicle.update(delta);
        if (this.dead) {
            this.ragdoll.update();
            this.hat.update();
        } else {
            this.ragdoll.updatePosition(this.vehicle.rider);
        }
    }

    updateControls(key) {
        if (this.dead) {
            return;
        }

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
                this.scene.cameraFocus = this.vehicle.head;
                if (this.scene.paused) {
                    return;
                }

                //this.vehicle.updateControls();
                break;

            case "z":
                this.scene.cameraFocus = this.vehicle.head;
                if (this.scene.paused) {
                    return;
                }
                
                if (this.gamepad.downKeys.has("z")) {
                    this.vehicle.swap();
                }

                break;
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

    collide(powerup) {
        switch(powerup) {
            case "checkpoint":
                for (const player of this.scene.players) {
                    player.snapshots.push(player.snapshot());
                }

                break;

            case "target":
                if (!this.ghost) {
                    if (++this.targetsCollected === this.scene.targets) {
                        this.trackComplete();
                    }
                }

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
            targetsCollected: this.targetsCollected,
            powerupsConsumed: [...this.powerupsConsumed],
            currentTime: this.scene.currentTime,
            gamepad: this.gamepad.snapshot(),
            gravity: this.gravity.clone(),
            vehicle: this.vehicle.clone()
        }
    }

    restore(snapshot) {
        this.slow = snapshot.slow;
        this.dead = snapshot.dead;
        this.targetsCollected = snapshot.targetsCollected;
        this.powerupsConsumed = [...snapshot.powerupsConsumed];
        this.gravity = snapshot.gravity.clone();

        this.gamepad.restore(snapshot.gamepad);
        this.vehicle.restore(snapshot.vehicle);
    }

    reset() {
        this.slow = false;
        this.dead = false;
        this.hat = null;
        this.explosion = null;
        this.powerupsEnabled = true;
        this.targetsCollected = 0;
        this.powerupsConsumed = [];

        this.snapshots.reset();
        this.gamepad.reset();

        this.gravity = new Vector(0, .3);
        this.createVehicle(this.vehicle.name);
        this.ragdoll.updatePosition(this.vehicle.rider);
    }
}