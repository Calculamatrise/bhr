import { ctx } from "../../bootstrap.js";

import Vector from "../Vector.js";
import Spring from "../Spring.js";
import BodyPart from "./part/BodyPart.js";
import Wheel from "./part/Wheel.js";

export default class BMX {
    constructor(parent) {
        this.parent = parent;

        this.dir = 1;

        this.createMasses(),
        this.createSprings();
    }
    name = "BMX";
    pedalSpeed = 0;
    createMasses() {
        var a = 0, b = -1,
            c = 21, d = 38,
            e = -21, f = 38;

        this.masses = [
            this.head = new BodyPart(new Vector(a, b), this, 14),
            this.frontWheel = new Wheel(new Vector(c,d), this, 11.7),
            this.rearWheel = new Wheel(new Vector(e,f), this, 11.7)
        ]
        
        this.head.drive = this.destroy.bind(this);
    }
    createSprings() {
        var a = 45,
            b = 42,
            c = 45;
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
    swap() {
        this.dir *= -1;
        this.chasse.swap();
        var rearSpring = this.rearSpring.leff;
        this.rearSpring.leff = this.frontSpring.leff;
        this.frontSpring.leff = rearSpring;
        this.parent.collide("turn");
    }
    draw() {
        var a, b, c, d,
            e = this.parent.track.zoom,
            f = this.dir,
            h = this.rearWheel.pos.toPixel(),
            i = this.frontWheel.pos.toPixel();
        ctx.globalAlpha = this.parent.ghost ? .5 : 1;
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
        ctx.moveTo(n, x),
        ctx.lineTo(c, d),
        ctx.moveTo(C, M),
        ctx.lineTo(X, ya),
        ctx.moveTo(w, y),
        ctx.lineTo(T, Y);
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
        ctx.moveTo(h.x + l, h.y + m),
        ctx.lineTo(C, M),
        ctx.lineTo(X, ya),
        ctx.lineTo(T, Y),
        ctx.lineTo(za, rc),
        ctx.lineTo(w, y),
        ctx.stroke();
        if (!this.parent.dead) {
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
            ctx.beginPath(),
            ctx.moveTo(c, d),
            ctx.lineTo(ya, T),
            ctx.lineTo(h, C),
            ctx.stroke();
            ctx.strokeStyle = "#000";
            ctx.beginPath(),
            ctx.moveTo(n, x),
            ctx.lineTo(M, X),
            ctx.lineTo(h, C),
            ctx.stroke();
            n = a + 0.05 * l + 0.88 * i.x;
            x = b + 0.05 * m + 0.88 * i.y;
            ctx.lineWidth = 8 * e;
            ctx.beginPath(),
            ctx.moveTo(h, C),
            ctx.lineTo(n, x),
            ctx.stroke();
            c = a + 0.15 * l + 1.05 * i.x;
            d = b + 0.15 * m + 1.05 * i.y;
            ctx.lineWidth = 2 * e;
            ctx.beginPath(),
            ctx.moveTo(c + 5 * e, d),
            ctx.arc(c, d, 5 * e, 0, 2 * Math.PI, !0),
            ctx.stroke(),
            ctx.beginPath();
            switch (this.parent.cosmetics.head) {
                case "cap":
                    c = a + 0.4 * l + 1.1 * i.x;
                    d = b + 0.4 * m + 1.1 * i.y;
                    a = a + 0.05 * l + 1.05 * i.x;
                    b = b + 0.05 * m + 1.05 * i.y;
                    ctx.moveTo(a, b),
                    ctx.lineTo(c, d),
                    ctx.stroke();
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
                    ctx.moveTo(c, d),
                    ctx.lineTo(M, X),
                    ctx.lineTo(ya, T),
                    ctx.lineTo(l, m),
                    ctx.lineTo(a, b),
                    ctx.lineTo(h, C),
                    ctx.stroke(),
                    ctx.fill();
                    break;
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
    update(delta) {
        if (!this.parent.dead)
            this.updateControls()

        for (const spring of this.springs)
            spring.update();

        for (const mass of this.masses)
            mass.update(delta);

        if (this.rearWheel.touching && this.frontWheel.touching)
            this.parent.slow = false;

        if (!this.parent.slow && !this.parent.dead) {
            this.updateControls();
            for (const spring of this.springs)
                spring.update();

            for (const mass of this.masses)
                mass.update(delta);
        }
    }
    updateControls() {
        if (this.parent.gamepad.downKeys.has("ArrowUp"))
            this.pedalSpeed += this.rearWheel.pedalSpeed / 5;
        
        this.rearWheel.motor += (this.parent.gamepad.downKeys.has("ArrowUp") - this.rearWheel.motor) / 10;
        this.rearWheel.brake = this.frontWheel.brake = this.parent.gamepad.downKeys.has("ArrowDown");
        
        let rotate = this.parent.gamepad.downKeys.has("ArrowLeft") - this.parent.gamepad.downKeys.has("ArrowRight");
        this.rearSpring.lean(rotate * this.dir * 5);
        this.frontSpring.lean(-rotate * this.dir * 5);
        this.chasse.rotate(rotate / 6);
        if (!rotate && this.parent.gamepad.downKeys.has("ArrowUp")) {
            this.rearSpring.lean(-7);
            this.frontSpring.lean(7);
        }
    }
    move(x, y) {
        for (const mass of this.masses) {
            mass.pos.x += x;
            mass.pos.y += y;
            mass.old.x += x;
            mass.old.y += y;
        }
    }
    destroy() {
        this.parent.dead = true;
        this.head.collide = false;
        this.head.drive = () => {};
        this.rearWheel.motor = 0;
        this.rearWheel.brake = false;
        this.frontWheel.brake = false;
        
        this.parent.createRagdoll();
    }
    clone() {
        return {
            masses: [
                {
                    pos: this.masses[0].pos.clone(),
                    old: this.masses[0].pos.clone(),
                    vel: this.masses[0].pos.clone()
                },
                {
                    pos: this.masses[1].pos.clone(),
                    old: this.masses[1].pos.clone(),
                    vel: this.masses[1].pos.clone(),
                    motor: this.masses[1].motor
                },
                {
                    pos: this.masses[2].pos.clone(),
                    old: this.masses[2].pos.clone(),
                    vel: this.masses[2].pos.clone(),
                    motor: this.masses[2].motor
                }
            ],
            springs: [
                {
                    leff: this.springs[0].leff
                },
                {
                    leff: this.springs[1].leff
                },
                {
                    leff: this.springs[2].leff
                }
            ]
        }
    }
}