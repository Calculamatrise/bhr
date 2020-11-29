import Vector from "../Vector.js";
import Vehicle from "../Vehicle.js";
import Spring from "../Spring.js";
import BodyPart from "./part/BodyPart.js";
import Wheel from "./part/Wheel.js";
import DeadBike from "./dead/DeadBike.js";
import Shard from "../effect/Shard.js";
import { ctx } from "../../bootstrap.js";

export default class MountainBike extends Vehicle {
    constructor(a, b, c = [], d) {
        super(a);
        this.ghost = !!d;
        this.ghost_data = d;
        this.checkpoints = c;
        this.createMasses(),
        this.createSprings(),
        this.createCosmetics(),
        -1 === b && this.swap(),
        this.pastCheckpoint = !1;
        if (this.checkpoints.length > 0) {
            var cp = this.checkpoints[this.checkpoints.length - 1];
            this.dir = cp.dir;
            this.gravity = new Vector(cp.gravity.x, cp.gravity.y);
            this.slow = cp.slow;
            this.targetsCollected = cp.targetsCollected;
            this.time = cp.time;
            for (var i in c.oldGamepad) {
                this.oldGamepad[i] = c.oldGamepad[i];
            }
            for (var i in this.track.powerups) {
                this.track.powerups[i].used = cp.powerups[i];
            }
            for (var i in records) {
                for (var x in records[i]) {
                    if (x >= this.time) {
                        delete records[i][x];
                    }
                }
            }
        } else {
            this.slow = !1,
            this.time = 0,
            this.targetsCollected = 0;
            for (var i in this.track.powerups) {
                this.track.powerups[i].used = 0
            }
        }
    }
    vehicle = "MTB";
    vehicleName = "MTB";
    slow = !1;
    dead = !1;
    pedalSpeed = 0;
    targetsCollected = 0;
    powerupsConsumed = 0;
    swapped = !0;
    checkpointsCache = [];
    gamepad = { up: 0, down: 0, left: 0, right: 0, swap: 0 };
    oldGamepad = { up: 0, down: 0, left: 0, right: 0, swap: 0 };
    createMasses() {
        var a = 2, b = -3,
            c = 23, d = 35,
            e = -23, f = 35,
            g = new Vector(0,0),
            h = new Vector(0,0),
            i = new Vector(0,0),
            j = 0,
            k = 0;
        if (this.checkpoints.length > 0) {
            var cp = this.checkpoints[this.checkpoints.length - 1];
            a = cp.masses[0].pos.x, b = cp.masses[0].pos.y,
            c = cp.masses[1].pos.x, d = cp.masses[1].pos.y,
            e = cp.masses[2].pos.x, f = cp.masses[2].pos.y,
            g = new Vector(cp.masses[0].vel.x,cp.masses[0].vel.y),
            h = new Vector(cp.masses[1].vel.x,cp.masses[1].vel.y),
            i = new Vector(cp.masses[2].vel.x,cp.masses[2].vel.y),
            j = cp.masses[1].motor,
            k = cp.masses[2].motor;
        }
        this.masses = [this.head = new BodyPart(new Vector(a,b), this), this.frontWheel = new Wheel(new Vector(c,d),this), this.rearWheel = new Wheel(new Vector(e,f),this)];
        this.head.drive = () => this.die(),
        this.head.size = this.rearWheel.size = this.frontWheel.size = 14,
        this.head.vel = g,
        this.frontWheel.vel = h,
        this.rearWheel.vel = i,
        this.frontWheel.motor = j,
        this.rearWheel.motor = k;
        if (this.checkpoints.length > 0)
            this.head.old = new Vector(cp.masses[0].old.x,cp.masses[0].old.y),
            this.frontWheel.old = new Vector(cp.masses[1].old.x,cp.masses[1].old.y),
            this.rearWheel.old = new Vector(cp.masses[2].old.x,cp.masses[2].old.y)
    }
    createSprings() {
        var a = 47,
            b = 45,
            c = 45;
        if (this.checkpoints.length > 0) {
            var cp = this.checkpoints[this.checkpoints.length - 1];
            a = cp.springs[0].leff,
            b = cp.springs[1].leff,
            c = cp.springs[2].leff;
        }
        this.springs = [
            this.rearSpring = new Spring(this.head,this.rearWheel,this),
            this.chasse = new Spring(this.rearWheel,this.frontWheel,this),
            this.frontSpring = new Spring(this.frontWheel,this.head,this)
        ];
        this.rearSpring.lrest = 47,
        this.chasse.lrest = 45,
        this.frontSpring.lrest = 45,
        this.chasse.springConstant = this.rearSpring.springConstant = this.frontSpring.springConstant = .2,
        this.chasse.dampConstant = this.rearSpring.dampConstant = this.frontSpring.dampConstant = .3,
        this.rearSpring.leff = a
        this.chasse.leff = b,
        this.frontSpring.leff = c
    }
    die() {
        this.dead = !0;
        this.head.drive = () => {};
        this.rearWheel.motor = 0;
        this.rearWheel.brake = !1;
        this.frontWheel.brake = !1;
        this.head.collide = !1;
        for (var i in this.track.players) {
            if (this.track.players[i].dead) {
                this.track.players[i] = new DeadBike(this, this.getStickMan(), this.track, this.checkpoints);
                this.track.players[i].hat = new Shard(this.head.pos.clone(), this);
                this.track.players[i].hat.vel = this.head.vel.clone();
                this.track.players[i].hat.size = 10;
                this.track.players[i].hat.da = .1;
                if (i == 0) {
                    this.track.firstPlayer = this.track.players[i];
                }
            }
        }
    }
    swap() {
        this.gamepad.swap = !1;
        this.dir *= -1;
        this.chasse.swap();
        var a = this.rearSpring.leff;
        this.rearSpring.leff = this.frontSpring.leff;
        this.frontSpring.leff = a;
        this.swapped = !this.swapped;
        this.collide("turn")
    }
    updateControls() {
        this.gamepad.swap && this.swap();
        this.rearWheel.motor += (this.gamepad.up - this.rearWheel.motor) / 10;
        this.gamepad.up && (this.pedalSpeed += this.rearWheel.pedalSpeed / 5);
        this.rearWheel.brake = this.frontWheel.brake = this.gamepad.down;
        var a = this.gamepad.left - this.gamepad.right;
        this.rearSpring.lean(5 * a * this.dir);
        this.frontSpring.lean(5 * -a * this.dir);
        this.chasse.rotate(a / 8);
        !a && this.gamepad.up && (this.rearSpring.lean(-7),
        this.frontSpring.lean(7))
    }
    draw() {
        var a = this.track
        , b = this.rearWheel.pos.toPixel()
        , c = this.frontWheel.pos.toPixel()
        , d = this.head.pos.toPixel()
        , e = c.sub(b)
        , f = new Vector((c.y - b.y) * this.dir,(b.x - c.x) * this.dir)
        , h = d.sub(b.add(e.scale(0.5)));
        ctx.globalAlpha = this.ghost ? .5 : 1;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3.5 * a.zoom;
        ctx.beginPath(),ctx.arc(b.x, b.y, 12.5 * a.zoom, 0, 2 * Math.PI, !0),ctx.moveTo(c.x + 12.5 * a.zoom, c.y),ctx.arc(c.x, c.y, 12.5 * a.zoom, 0, 2 * Math.PI, !0),ctx.stroke(),ctx.beginPath(),ctx.fillStyle = "grey";
        ctx.moveTo(b.x + 5 * a.zoom, b.y),ctx.arc(b.x, b.y, 5 * a.zoom, 0, 2 * Math.PI, !0),ctx.moveTo(c.x + 4 * a.zoom, c.y),ctx.arc(c.x, c.y, 4 * a.zoom, 0, 2 * Math.PI, !0),ctx.fill(),ctx.beginPath(),ctx.lineWidth = 5 * a.zoom;
        ctx.moveTo(b.x, b.y),ctx.lineTo(b.x + 0.4 * e.x + 0.05 * f.x, b.y + 0.4 * e.y + 0.05 * f.y),ctx.moveTo(b.x + 0.72 * e.x + 0.64 * h.x, b.y + 0.72 * e.y + 0.64 * h.y),ctx.lineTo(b.x + 0.46 * e.x + 0.4 * h.x, b.y + 0.46 * e.y + 0.4 * h.y),ctx.lineTo(b.x + 0.4 * e.x + 0.05 * f.x, b.y + 0.4 * e.y + 0.05 * f.y),ctx.stroke(),ctx.beginPath(),ctx.lineWidth = 2 * a.zoom;
        var i = new Vector(6 * Math.cos(this.pedalSpeed) * a.zoom,6 * Math.sin(this.pedalSpeed) * a.zoom);
        ctx.moveTo(b.x + 0.72 * e.x + 0.64 * h.x, b.y + 0.72 * e.y + 0.64 * h.y),ctx.lineTo(b.x + 0.43 * e.x + 0.05 * f.x, b.y + 0.43 * e.y + 0.05 * f.y),ctx.moveTo(b.x + 0.45 * e.x + 0.3 * h.x, b.y + 0.45 * e.y + 0.3 * h.y),ctx.lineTo(b.x + 0.3 * e.x + 0.4 * h.x, b.y + 0.3 * e.y + 0.4 * h.y),ctx.lineTo(b.x + 0.25 * e.x + 0.6 * h.x, b.y + 0.25 * e.y + 0.6 * h.y),ctx.moveTo(b.x + 0.17 * e.x + 0.6 * h.x, b.y + 0.17 * e.y + 0.6 * h.y),ctx.lineTo(b.x + 0.3 * e.x + 0.6 * h.x, b.y + 0.3 * e.y + 0.6 * h.y),ctx.moveTo(b.x + 0.43 * e.x + 0.05 * f.x + i.x, b.y + 0.43 * e.y + 0.05 * f.y + i.y),ctx.lineTo(b.x + 0.43 * e.x + 0.05 * f.x - i.x, b.y + 0.43 * e.y + 0.05 * f.y - i.y),ctx.stroke(),ctx.beginPath(),ctx.lineWidth = a.zoom;
        ctx.moveTo(b.x + 0.46 * e.x + 0.4 * h.x, b.y + 0.46 * e.y + 0.4 * h.y),ctx.lineTo(b.x + 0.28 * e.x + 0.5 * h.x, b.y + 0.28 * e.y + 0.5 * h.y),ctx.stroke(),ctx.beginPath(),ctx.lineWidth = 3 * a.zoom;
        ctx.moveTo(c.x, c.y),ctx.lineTo(b.x + 0.71 * e.x + 0.73 * h.x, b.y + 0.71 * e.y + 0.73 * h.y),ctx.lineTo(b.x + 0.73 * e.x + 0.77 * h.x, b.y + 0.73 * e.y + 0.77 * h.y),ctx.lineTo(b.x + 0.7 * e.x + 0.8 * h.x, b.y + 0.7 * e.y + 0.8 * h.y),ctx.stroke();
        if (!this.dead) {
            ctx.lineCap = "round";
            var f = d.sub(b.add(e.scale(0.5)))
            , c = b.add(e.scale(0.3)).add(f.scale(0.25))
            , h = b.add(e.scale(0.4)).add(f.scale(0.05))
            , d = h.add(i)
            , l = h.sub(i)
            , b = b.add(e.scale(0.67)).add(f.scale(0.8))
            , i = c.add(e.scale(-0.05)).add(f.scale(0.42))
            , m = d.sub(i)
            , h = (new Vector(m.y * this.dir,-m.x * this.dir)).scaleSelf(a.zoom * a.zoom)
            , n = i.add(m.scale(0.5)).add(h.scale(200 / m.lengthSquared()))
            , m = l.sub(i)
            , h = (new Vector(m.y * this.dir,-m.x * this.dir)).scaleSelf(a.zoom * a.zoom)
            , h = i.add(m.scale(0.5)).add(h.scale(200 / m.lengthSquared()));
            ctx.beginPath(),ctx.lineWidth = 6 * a.zoom;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            ctx.moveTo(l.x, l.y),ctx.lineTo(h.x, h.y),ctx.lineTo(i.x, i.y),ctx.stroke(),ctx.beginPath(),ctx.strokeStyle = "#000";
            ctx.moveTo(d.x, d.y),ctx.lineTo(n.x, n.y),ctx.lineTo(i.x, i.y),ctx.stroke(),ctx.lineWidth = 8 * a.zoom;
            h = c.add(e.scale(0.1)).add(f.scale(0.93));
            d = c.add(e.scale(0.2)).add(f.scale(1.09));
            ctx.beginPath(),ctx.moveTo(i.x, i.y),ctx.lineTo(h.x, h.y),ctx.stroke(),ctx.beginPath(),ctx.lineWidth = 2 * a.zoom;
            ctx.moveTo(d.x + 5 * a.zoom, d.y),ctx.arc(d.x, d.y, 5 * a.zoom, 0, 2 * Math.PI, !0),ctx.stroke(),ctx.beginPath();
            switch (this.cosmetics.head) {
            case "cap":
                d = c.add(e.scale(0.4)).add(f.scale(1.15));
                e = c.add(e.scale(0.1)).add(f.scale(1.05));
                ctx.moveTo(d.x, d.y),ctx.lineTo(e.x, e.y),ctx.stroke();
                break;
            case "hat":
                d = c.add(e.scale(0.37)).add(f.scale(1.19)),
                i = c.sub(e.scale(0.02)).add(f.scale(1.14)),
                l = c.add(e.scale(0.28)).add(f.scale(1.17)),
                c = c.add(e.scale(0.09)).add(f.scale(1.15)),
                n = d.sub(e.scale(0.1)).addToSelf(f.scale(0.2)),
                e = i.add(e.scale(0.02)).addToSelf(f.scale(0.2)),
                ctx.fillStyle = "#000",
                ctx.moveTo(d.x, d.y),ctx.lineTo(l.x, l.y),ctx.lineTo(n.x, n.y),ctx.lineTo(e.x, e.y),ctx.lineTo(c.x, c.y),ctx.lineTo(i.x, i.y),ctx.stroke(),ctx.fill()
            }
            e = h.sub(b);
            f = new Vector(e.y * this.dir,-e.x * this.dir);
            f = f.scale(a.zoom * a.zoom);
            e = b.add(e.scale(0.3)).add(f.scale(80 / e.lengthSquared()));
            ctx.lineWidth = 5 * a.zoom;
            ctx.beginPath(),ctx.moveTo(h.x, h.y),ctx.lineTo(e.x, e.y),ctx.lineTo(b.x, b.y),ctx.stroke()
        }
    }
    snapshot() {
        var oldGamepad = {}, powerups = [];
        for (var i in this.oldGamepad)
            oldGamepad[i] = this.oldGamepad[i];
        for (var i in this.track.powerups)
            powerups.push(this.track.powerups[i].used);
        return {
            oldGamepad: oldGamepad,
            masses: [
                this.head.clone(),
                this.frontWheel.clone(),
                this.rearWheel.clone()
            ],
            springs: [
                this.rearSpring.clone(),
                this.chasse.clone(),
                this.frontSpring.clone()
            ],
            dir: this.dir,
            gravity: new Vector(this.gravity.x, this.gravity.y),
            slow: this.slow,
            targetsCollected: this.targetsCollected,
            powerups: powerups,
            time: this.track.currentTime
        }
    }
    clone() {
        const t = new BMXBike(this.track, this.dir, this.checkpoints, this.ghost_data);
        for (var e in t.masses) {
            t.masses[e] = this.masses[e].clone();
        }
        return t;
    }
}