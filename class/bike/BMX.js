import Bike from "./Bike.js";
import Vector from "../Vector.js";

export default class BMX extends Bike {
    constructor(parent) {
        super(parent);

        this.head.size = 14;
        this.frontWheel.size = 11.7;
        this.rearWheel.size = 11.7;

        this.head.position = new Vector(0, -1);
        this.head.old = this.head.position.clone();
        this.rearWheel.position = new Vector(-21, 38);
        this.rearWheel.old = this.rearWheel.position.clone();
        this.frontWheel.position = new Vector(21, 38);
        this.frontWheel.old = this.frontWheel.position.clone();

        this.rearSpring.lrest = 45;
        this.rearSpring.leff = 45;
        this.rearSpring.springConstant = .35;
        this.rearSpring.dampConstant = .3;

        this.chasse.lrest = 42;
        this.chasse.leff = 42;
        this.chasse.springConstant = .35;
        this.chasse.dampConstant = .3;

        this.frontSpring.lrest = 45;
        this.frontSpring.leff = 45;
        this.frontSpring.springConstant = .35;
        this.frontSpring.dampConstant = .3;

        this.rotationFactor = 6;
    }
    name = "BMX";
    draw(ctx) {
        const rearWheel = this.rearWheel.position.toPixel();
        const frontWheel = this.frontWheel.position.toPixel();
        
        ctx.globalAlpha = this.parent.ghost ? .5 : 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = this.parent.scene.parent.theme === "dark" ? "#fbfbfb" : "#000000";
        ctx.lineWidth = 3.5 * this.parent.scene.zoom;

        ctx.beginPath();
        ctx.arc(rearWheel.x, rearWheel.y, this.parent.scene.zoom * 10, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(frontWheel.x, frontWheel.y, this.parent.scene.zoom * 10, 0, 2 * Math.PI);
        ctx.stroke();
        
        let l = frontWheel.difference(rearWheel);
        let i = new Vector((frontWheel.y - rearWheel.y) * this.dir, (rearWheel.x - frontWheel.x) * this.dir);
        let a = rearWheel.sum(l.scale(0.3)).sum(i.scale(0.25));
        let n = rearWheel.sum(l.scale(0.84)).sum(i.scale(0.42));
        let c = rearWheel.sum(l.scale(0.84)).sum(i.scale(0.37));
        let w = rearWheel.sum(l.scale(0.4)).sum(i.scale(0.05));

        ctx.beginPath(),
        ctx.lineWidth = this.parent.scene.zoom * 3,
        ctx.moveTo(rearWheel.x, rearWheel.y),
        ctx.lineTo(a.x, a.y),
        ctx.lineTo(n.x, n.y),
        ctx.moveTo(c.x, c.y),
        ctx.lineTo(w.x, w.y),
        ctx.lineTo(rearWheel.x, rearWheel.y);

        c = new Vector(Math.cos(this.pedalSpeed) * this.parent.scene.zoom * 6, Math.sin(this.pedalSpeed) * this.parent.scene.zoom * 6);
        n = w.sum(c);
        c = w.difference(c);

        let C = rearWheel.sum(l.scale(0.17)).sum(i.scale(0.38));
        let X = rearWheel.sum(l.scale(0.3)).sum(i.scale(0.45));
        let T = rearWheel.sum(l.scale(0.25)).sum(i.scale(0.4));

        ctx.moveTo(n.x, n.y);
        ctx.lineTo(c.x, c.y);
        ctx.moveTo(C.x, C.y);
        ctx.lineTo(X.x, X.y);
        ctx.moveTo(w.x, w.y);
        ctx.lineTo(T.x, T.y);

        C = rearWheel.sum(l.scale(0.97));
        X = rearWheel.sum(l.scale(0.8)).sum(i.scale(0.48));
        T = rearWheel.sum(l.scale(0.86)).sum(i.scale(0.5));
        let Y = rearWheel.sum(l.scale(0.82)).sum(i.scale(0.65));
        w = rearWheel.sum(l.scale(0.78)).sum(i.scale(0.67));

        ctx.moveTo(rearWheel.x + l.x, rearWheel.y + l.y),
        ctx.lineTo(C.x, C.y),
        ctx.lineTo(X.x, X.y),
        ctx.lineTo(T.x, T.y),
        ctx.lineTo(Y.x, Y.y),
        ctx.lineTo(w.x, w.y),
        ctx.stroke();
        
        if (!this.parent.dead) {
            i = this.head.position.toPixel().difference(rearWheel).difference(l.scale(0.5));
            let h = a.difference(l.scale(0.1)).sum(i.scale(0.3));
            T = n.difference(h);
            let za = this.dir * this.parent.scene.zoom ** 2 / T.dot(T);
            let M = h.sum(T.scale(.5)).sum(new Vector(T.y, -T.x).scale(200 * za));

            ctx.lineWidth = this.parent.scene.zoom * 6,
            ctx.save(),
            ctx.beginPath(),
            ctx.globalAlpha = .5,
            ctx.moveTo(c.x, c.y),
            ctx.lineTo(M.x, M.y),
            ctx.lineTo(h.x, h.y),
            ctx.stroke(),
            ctx.restore();

            ctx.beginPath(),
            ctx.moveTo(n.x, n.y),
            ctx.lineTo(M.x, M.y),
            ctx.lineTo(h.x, h.y),
            ctx.stroke();

            n = a.sum(l.scale(0.05)).sum(i.scale(0.88));

            ctx.beginPath(),
            ctx.lineWidth = this.parent.scene.zoom * 8,
            ctx.moveTo(h.x, h.y),
            ctx.lineTo(n.x, n.y),
            ctx.stroke();

            c = a.sum(l.scale(0.15)).sum(i.scale(1.05));

            ctx.beginPath(),
            ctx.lineWidth = this.parent.scene.zoom * 2,
            ctx.moveTo(c.x + this.parent.scene.zoom * 5, c.y),
            ctx.arc(c.x, c.y, this.parent.scene.zoom * 5, 0, 2 * Math.PI, true),
            ctx.stroke(),
            ctx.beginPath();
            switch(this.parent.cosmetics.head) {
                case "cap":
                    ctx.moveTo(...Object.values(a.sum(l.scale(0.4)).sum(i.scale(1.1)))),
                    ctx.lineTo(...Object.values(a.sum(l.scale(0.05)).sum(i.scale(1.05)))),
                    ctx.stroke();
                    break;

                case "hat":
                    c = a.sum(l.scale(0.35)).sum(i.scale(1.15));
                    h = a.difference(l.scale(0.05)).sum(i.scale(1.1));

                    ctx.fillStyle = this.parent.scene.parent.theme === "dark" ? "#fbfbfb" : "#000000";
                    ctx.moveTo(c.x, c.y),
                    ctx.lineTo(...Object.values(a.sum(l.scale(0.25)).sum(i.scale(1.13)))),
                    ctx.lineTo(c.x - 0.1 * l.x + 0.2 * i.x, c.y - 0.1 * l.y + 0.2 * i.y),
                    ctx.lineTo(h.x + 0.02 * l.x + 0.2 * i.x, h.y + 0.02 * l.y + 0.2 * i.y),
                    ctx.lineTo(...Object.values(a.sum(l.scale(0.05)).sum(i.scale(1.11)))),
                    ctx.lineTo(h.x, h.y),
                    ctx.stroke(),
                    ctx.fill();
                    break;
            }
            
            ctx.lineWidth = this.parent.scene.zoom * 5;
            ctx.beginPath(),
            ctx.moveTo(n.x, n.y),
            ctx.lineTo(...Object.values(new Vector((n.y - w.y), -(n.x - w.x)).scale(130 * this.dir * this.parent.scene.zoom ** 2).oppositeScale(n.distanceToSquared(w)).sum(n.difference(w).scale(.4)).sum(w))),
            ctx.lineTo(w.x, w.y),
            ctx.stroke()
        }

        ctx.globalAlpha = 1;
    }
}