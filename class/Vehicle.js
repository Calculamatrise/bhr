import Vector from "./Vector.js";
import { records } from "../variable/var.js";

export default class Vehicle {
    constructor(t) {
        this.track = t,
        this.gravity = new Vector(0,.3),
        this.complete = !1,
        this.crashed = !1,
        this.dir = 1,
        this.ghost = !1,
        this.explosion = !1,
        this.motor = 0,
        this.powerupsEnabled = !0
    }
    createCosmetics() {
        var t = null || this.firstPlayer && this.firstPlayer._user
            , e = {head: "hat"} || t.cosmetics;
        this.cosmetics = e
    }
    trackComplete() {
        var a = this.track;
        this.collide("hitTarget");
        if (this.pastCheckpoint & 2) {
            if (this.collide("hitGoal"),
            a.targets && a.firstPlayer.targetsCollected === a.targets && 0 < a.currentTime && (!a.time || this.time < a.time) && a.id !== void 0) {
                for (var b = "", c, d = 0, e = records.length; d < e; d++) {
                    for (c in records[d]) {
                        isNaN(c) || (b += c + " ");
                    }
                    b += ","
                }
                c = new XMLHttpRequest;
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
                c.send("id=" + window.location.pathname.split("/")[2] + "&vehicle=" + this.vehicle + "&time=" + a.currentTime + "&code=" + b + a.currentTime + "," + this.vehicle);
                a.firstPlayer.gamepad.left = a.firstPlayer.gamepad.right = a.firstPlayer.gamepad.up = a.firstPlayer.gamepad.down = 0
            }
        } else if (this.pastCheckpoint & 1) {
            this.collide("hitCheckpoint");
            for (var i in a.players) {
                a.players[i].checkpoints.push(a.players[i].snapshot())
            }
        }
        this.pastCheckpoint = 0
    }
    getStickMan() {
        var a = {}
        , b = this.frontWheel.pos.sub(this.rearWheel.pos)
        , c = new Vector(b.y * this.dir,-b.x * this.dir);
        a.head = this.rearWheel.pos.add(b.scale(0.35)).add(this.head.pos.sub(this.frontWheel.pos.add(this.rearWheel.pos).scale(0.5)).scale(1.2));
        a.hand = a.shadowHand = this.rearWheel.pos.add(b.scale(0.8)).add(c.scale(0.68));
        var d = a.head.sub(a.hand)
        , d = new Vector(d.y * this.dir,-d.x * this.dir);
        a.elbow = a.shadowElbow = a.head.add(a.hand).scale(0.5).add(d.scale(130 / d.lengthSquared()));
        a.hip = this.rearWheel.pos.add(b.scale(0.2)).add(c.scale(0.5));
        var e = new Vector(6 * Math.cos(this.pedalSpeed),6 * Math.sin(this.pedalSpeed));
        a.foot = this.rearWheel.pos.add(b.scale(0.4)).add(c.scale(0.05)).add(e);
        d = a.hip.sub(a.foot);
        d = new Vector(-d.y * this.dir,d.x * this.dir);
        a.knee = a.hip.add(a.foot).scale(0.5).add(d.scale(160 / d.lengthSquared()));
        a.shadowFoot = this.rearWheel.pos.add(b.scale(0.4)).add(c.scale(0.05)).sub(e);
        d = a.hip.sub(a.shadowFoot);
        d = new Vector(-d.y * this.dir,d.x * this.dir);
        a.shadowKnee = a.hip.add(a.shadowFoot).scale(0.5).add(d.scale(160 / d.lengthSquared()));
        return a
    }
    setButtonDown(a) {
        this.gamepad[a] = 1
    }
    setButtonUp(a) {
        this.gamepad[a] = 0
    }
    isButtonDown(a) {
        return this.gamepad[a] == 1
    }
    update(t) {
        var a = this.track.currentTime;
        if (this.pastCheckpoint) {
            this.trackComplete()
        }
        if (!!this.ghost_data) {
            if (this.ghost_data[0][a]) {
                this.gamepad.left = this.gamepad.left ? 0 : 1;
            }
            if (this.ghost_data[1][a]) {
                this.gamepad.right = this.gamepad.right ? 0 : 1;
            }
            if (this.ghost_data[2][a]) {
                this.gamepad.up = this.gamepad.up ? 0 : 1;
            }
            if (this.ghost_data[3][a]) {
                this.gamepad.down = this.gamepad.down ? 0 : 1;
            }
            if (this.ghost_data[4][a]) {
                this.swap();
            }
        } else {
            if (this.gamepad.left !== this.oldGamepad.left)
                records[0][a] = 1,
                this.oldGamepad.left = this.gamepad.left;
            if (this.gamepad.right !== this.oldGamepad.right)
                records[1][a] = 1,
                this.oldGamepad.right = this.gamepad.right;
            if (this.gamepad.up !== this.oldGamepad.up)
                records[2][a] = 1,
                this.oldGamepad.up = this.gamepad.up;
            if (this.gamepad.down !== this.oldGamepad.down)
                records[3][a] = 1,
                this.oldGamepad.down = this.gamepad.down;
            if (this.isButtonDown("swap")) {
                this.swap();
                records[4][a] = 1
            }
        }
        if (!this.dead) {
            this.updateControls()
        }
        for (a = this.springs.length - 1; a >= 0; a--)
            this.springs[a].update();
        for (a = this.masses.length - 1; a >= 0; a--)
            this.masses[a].update(t);
        if (this.rearWheel.touching && this.frontWheel.touching) {
            this.slow = !1
        }
        if (!this.slow && !this.dead) {
            this.updateControls();
            for (a = this.springs.length - 1; a >= 0; a--)
                this.springs[a].update();
            for (a = this.masses.length - 1; a >= 0; a--)
                this.masses[a].update()
        }
    }
    collide(a) {
        if (this.checkpoints) {
            if (this.checkpoints[a]) {
                for (var i in b) {
                    this.checkpoints[i].apply(this, _slice.call(arguments, 1))
                }
            }
        }
    }
    moveVehicle(a, b) {
        for (var i = this.masses, s = i.length, n = s - 1; n >= 0; n--)
            i[n].pos.x = i[n].pos.x + a,
            i[n].pos.y = i[n].pos.y + b,
            i[n].old.x = i[n].old.x + a,
            i[n].old.y = i[n].old.y + b
    }
    moveVehicleAbsolute(a, b, c) {
        this.masses[0].pos.copy(a.pos),
        this.masses[0].old.copy(a.old),
        this.masses[0].vel.copy(a.vel),
        this.masses[1].pos.copy(b.pos),
        this.masses[1].old.copy(b.old),
        this.masses[1].vel.copy(b.vel),
        this.masses[2].pos.copy(c.pos),
        this.masses[2].old.copy(c.old),
        this.masses[2].vel.copy(c.vel)
    }
    toJSON() {
        return {
            type: this.toString(),
            keys: records.map(Object.keys),
            rearWheel: this.rearWheel,
            frontWheel: this.frontWheel,
            head: this.head,
            chasse: this.chasse,
            rearSpring: this.rearSpring,
            frontSpring: this.frontSpring,
            direction: this.dir,
            gravity: this.gravity,
            slow: this.slow,
            time: this.time
        }
    }
    toString() {
        return "BikeGeneric"
    }
}