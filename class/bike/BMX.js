import Vector from "../Vector.js";
import Vehicle from "../Vehicle.js";
import Spring from "../Spring.js";
import BodyPart from "./part/BodyPart.js";
import Wheel from "./part/Wheel.js";
import DeadBike from "./dead/DeadBike.js";
import Shard from "../effect/Shard.js";
import { ctx } from "../../bootstrap.js";

export default class BMX extends Vehicle {
    constructor(a, b, c = [], d = !1) {
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
            c = this.checkpoints[this.checkpoints.length - 1];
            this.dir = c.dir;
            this.gravity = new Vector(c.gravity.x, c.gravity.y);
            this.slow = c.slow;
            this.targetsCollected = c.targetsCollected;
            this.time = c.time;
            for (var i in c.oldGamepad) {
                this.oldGamepad[i] = c.oldGamepad[i];
            }
            if (this.track) {
                for (var i in this.track.powerups) {
                    this.track.powerups[i].used = c.powerups[i];
                }
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
            if (this.track) {
                for (var i in this.track.powerups) {
                    this.track.powerups[i].used = 0
                }
            }
        }
    }
    vehicle = "BMX";
    vehicleName = "BMX";
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
        var a = 0, b = -1,
            c = 21, d = 38,
            e = -21, f = 38,
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
        this.masses = [this.head = new BodyPart(new Vector(a,b), this), this.frontWheel = new Wheel(new Vector(c,d), this), this.rearWheel = new Wheel(new Vector(e,f), this)];
        this.head.drive = () => this.die(),
        this.head.size = 14,
        this.frontWheel.size = this.rearWheel.size = 11.7,
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
        var a = 45,
            b = 42,
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
        this.rearSpring.lrest = 45,
        this.chasse.lrest = 42,
        this.frontSpring.lrest = 45,
        this.chasse.springConstant = this.rearSpring.springConstant = this.frontSpring.springConstant = .35,
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
        this.swapped = !this.swapped;
        this.gamepad.swap = !1;
        this.dir *= -1;
        this.chasse.swap();
        var rearSpring = this.rearSpring.leff;
        this.rearSpring.leff = this.frontSpring.leff;
        this.frontSpring.leff = rearSpring;
        this.collide("turn");
    }
    updateControls() {
        if (this.gamepad.swap) {
            this.swap();
        }
        if (this.gamepad.up) {
            this.pedalSpeed += this.rearWheel.pedalSpeed / 5;
        }
        this.rearWheel.motor += (this.gamepad.up - this.rearWheel.motor) / 10;
        this.rearWheel.brake = this.frontWheel.brake = this.gamepad.down;
        var rotate = this.gamepad.left - this.gamepad.right;
        this.rearSpring.lean(rotate * this.dir * 5);
        this.frontSpring.lean(-rotate * this.dir * 5);
        this.chasse.rotate(rotate / 6);
        if (!rotate && this.gamepad.up) {
            this.rearSpring.lean(-7);
            this.frontSpring.lean(7);
        }
    }
    draw() {
        var a, b, c, d,
            e = this.track.zoom,
            f = this.dir,
            h = this.rearWheel.pos.toPixel(),
            i = this.frontWheel.pos.toPixel();
        ctx.globalAlpha = this.ghost ? .5 : 1;
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3.5 * e;
        ctx.beginPath(),
        ctx.arc(h.x, h.y, 10 * e, 0, 2 * Math.PI, !0),
        ctx.moveTo(i.x + 10 * e, i.y),
        ctx.arc(i.x, i.y, 10 * e, 0, 2 * Math.PI, !0),
        ctx.stroke();
        var l = i.x - h.x
        , m = i.y - h.y
        , i = new Vector((i.y - h.y) * f,(h.x - i.x) * f);
        a = h.x + 0.3 * l + 0.25 * i.x;
        b = h.y + 0.3 * m + 0.25 * i.y;
        var n = h.x + 0.84 * l + 0.42 * i.x
        , x = h.y + 0.84 * m + 0.42 * i.y;
        c = h.x + 0.84 * l + 0.37 * i.x;
        d = h.y + 0.84 * m + 0.37 * i.y;
        var w = h.x + 0.4 * l + 0.05 * i.x
        , y = h.y + 0.4 * m + 0.05 * i.y;
        ctx.lineWidth = 3 * e;
        ctx.beginPath(),
        ctx.moveTo(h.x, h.y),
        ctx.lineTo(a, b),
        ctx.lineTo(n, x),
        ctx.moveTo(c, d),
        ctx.lineTo(w, y),
        ctx.lineTo(h.x, h.y);
        c = 6 * Math.cos(this.pedalSpeed) * e;
        d = 6 * Math.sin(this.pedalSpeed) * e;
        n = w + c;
        x = y + d;
        c = w - c;
        d = y - d;
        var C = h.x + 0.17 * l + 0.38 * i.x
        , M = h.y + 0.17 * m + 0.38 * i.y
        , X = h.x + 0.3 * l + 0.45 * i.x
        , ya = h.y + 0.3 * m + 0.45 * i.y
        , T = h.x + 0.25 * l + 0.4 * i.x
        , Y = h.y + 0.25 * m + 0.4 * i.y;
        ctx.moveTo(n, x),ctx.lineTo(c, d),ctx.moveTo(C, M),ctx.lineTo(X, ya),ctx.moveTo(w, y),ctx.lineTo(T, Y);
        var C = h.x + 0.97 * l
        , M = h.y + 0.97 * m
        , X = h.x + 0.8 * l + 0.48 * i.x
        , ya = h.y + 0.8 * m + 0.48 * i.y
        , T = h.x + 0.86 * l + 0.5 * i.x
        , Y = h.y + 0.86 * m + 0.5 * i.y
        , za = h.x + 0.82 * l + 0.65 * i.x
        , rc = h.y + 0.82 * m + 0.65 * i.y
        , w = h.x + 0.78 * l + 0.67 * i.x
        , y = h.y + 0.78 * m + 0.67 * i.y;
        ctx.moveTo(h.x + l, h.y + m),ctx.lineTo(C, M),ctx.lineTo(X, ya),ctx.lineTo(T, Y),ctx.lineTo(za, rc),ctx.lineTo(w, y),ctx.stroke();
        if (!this.dead) {
            ctx.lineCap = "round";
            i = this.head.pos.toPixel();
            i = {
                x: i.x - h.x - 0.5 * l,
                y: i.y - h.y - 0.5 * m
            };
            h = a - 0.1 * l + 0.3 * i.x;
            C = b - 0.1 * m + 0.3 * i.y;
            T = n - h;
            Y = x - C;
            za = T * T + Y * Y;
            M = h + 0.5 * T + 200 * Y * f * e * e / za;
            X = C + 0.5 * Y + 200 * -T * f * e * e / za;
            T = c - h;
            Y = d - C;
            za = T * T + Y * Y;
            ya = h + 0.5 * T + 200 * Y * f * e * e / za;
            T = C + 0.5 * Y + 200 * -T * f * e * e / za;
            ctx.lineWidth = 6 * e;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
            ctx.beginPath(),ctx.moveTo(c, d),ctx.lineTo(ya, T),ctx.lineTo(h, C),ctx.stroke();
            ctx.strokeStyle = "#000";
            ctx.beginPath(),ctx.moveTo(n, x),ctx.lineTo(M, X),ctx.lineTo(h, C),ctx.stroke();
            n = a + 0.05 * l + 0.88 * i.x;
            x = b + 0.05 * m + 0.88 * i.y;
            ctx.lineWidth = 8 * e;
            ctx.beginPath(),ctx.moveTo(h, C),ctx.lineTo(n, x),ctx.stroke();
            c = a + 0.15 * l + 1.05 * i.x;
            d = b + 0.15 * m + 1.05 * i.y;
            ctx.lineWidth = 2 * e;
            ctx.beginPath(),ctx.moveTo(c + 5 * e, d),ctx.arc(c, d, 5 * e, 0, 2 * Math.PI, !0),ctx.stroke(),ctx.beginPath();
            switch (this.cosmetics.head) {
            case "cap":
                c = a + 0.4 * l + 1.1 * i.x;
                d = b + 0.4 * m + 1.1 * i.y;
                a = a + 0.05 * l + 1.05 * i.x;
                b = b + 0.05 * m + 1.05 * i.y;
                ctx.moveTo(a, b),ctx.lineTo(c, d),ctx.stroke();
                break;
            case "hat":
                c = a + 0.35 * l + 1.15 * i.x;
                d = b + 0.35 * m + 1.15 * i.y;
                h = a - 0.05 * l + 1.1 * i.x;
                C = b - 0.05 * m + 1.1 * i.y;
                M = a + 0.25 * l + 1.13 * i.x;
                X = b + 0.25 * m + 1.13 * i.y;
                a = a + 0.05 * l + 1.11 * i.x;
                b = b + 0.05 * m + 1.11 * i.y;
                ya = c - 0.1 * l + 0.2 * i.x;
                T = d - 0.1 * m + 0.2 * i.y;
                l = h + 0.02 * l + 0.2 * i.x;
                m = C + 0.02 * m + 0.2 * i.y;
                ctx.fillStyle = "#000";
                ctx.moveTo(c, d),ctx.lineTo(M, X),ctx.lineTo(ya, T),ctx.lineTo(l, m),ctx.lineTo(a, b),ctx.lineTo(h, C),ctx.stroke(),ctx.fill();
                break;
            case "ninja":
                c = a + 0.26 * l + 1.1 * i.x,
                d = b + 0.26 * m + 1.1 * i.y,
                a = a + 0.05 * l + 1.05 * i.x,
                b = b + 0.05 * m + 1.05 * i.y,
                ctx.lineWidth = 5 * e,
                ctx.moveTo(c, d),ctx.lineTo(a, b),ctx.stroke(),ctx.lineWidth = 2 * e,
                ctx.lineTo(a - (8 + Math.random()) * e * f, b - (4 + Math.random()) * e * f),ctx.moveTo(a, b),ctx.lineTo(a - (8 + Math.random()) * e * f, b + (4 + Math.random()) * e * f),ctx.stroke()
            }
            l = n - w;
            m = x - y;
            i = {
                x: m * f * e * e,
                y: -l * f * e * e
            };
            f = l * l + m * m;
            l = w + 0.4 * l + 130 * i.x / f;
            m = y + 0.4 * m + 130 * i.y / f;
            ctx.lineWidth = 5 * e;
            ctx.beginPath(),ctx.moveTo(n, x),ctx.lineTo(l, m),ctx.lineTo(w, y),ctx.stroke()
        }
        ctx.globalAlpha = 1;
    }
    snapshot() {
        var oldGamepad = {}, powerups = [];
        for (var i in this.oldGamepad) {
            oldGamepad[i] = this.oldGamepad[i];
        }
        for (var i in this.track.powerups) {
            powerups.push(this.track.powerups[i].used);
        }
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