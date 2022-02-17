import Bike from "./Bike.js";
import Vector from "../Vector.js";

export default class extends Bike {
    constructor(parent) {
        super(parent);

        this.head.size = 14;
        this.frontWheel.size = 11.7;
        this.rearWheel.size = 11.7;

        this.head.position = new Vector(0, -1);
        this.head.old = this.head.position.clone();
        this.frontWheel.position = new Vector(21, 38);
        this.frontWheel.old = this.frontWheel.position.clone();
        this.rearWheel.position = new Vector(-21, 38);
        this.rearWheel.old = this.rearWheel.position.clone();

        this.rearSpring.lrest = 45;
        this.rearSpring.leff = 45;
        this.rearSpring.springConstant = 0.35;
        this.rearSpring.dampConstant = 0.3;

        this.chasse.lrest = 42;
        this.chasse.leff = 42;
        this.chasse.springConstant = 0.35;
        this.chasse.dampConstant = 0.3;

        this.frontSpring.lrest = 45;
        this.frontSpring.leff = 45;
        this.frontSpring.springConstant = 0.35;
        this.frontSpring.dampConstant = 0.3;
    }
    
    name = "BMX";
    get rider() {
        const rider = {};

        let t = this.frontWheel.position.sub(this.rearWheel.position);
        let e = new Vector(t.y, -t.x).scale(this.dir);
        let s = new Vector(Math.cos(this.pedalSpeed), Math.sin(this.pedalSpeed)).scale(6);

        rider.head = this.rearWheel.position.add(t.scale(0.35)).add(this.head.position.sub(this.frontWheel.position.add(this.rearWheel.position).scale(0.5)).scale(1.2)).add(new Vector(2, 1.5));
        rider.hand = this.rearWheel.position.add(t.scale(0.8)).add(e.scale(0.68));
        rider.shadowHand = rider.hand.clone();

        let i = rider.head.sub(rider.hand);
        i = new Vector(i.y, -i.x).scale(this.dir);

        rider.elbow = rider.head.add(rider.hand).scale(0.5).add(i.scale(130 / i.lengthSquared()));
        rider.shadowElbow = rider.elbow.clone();
        rider.hip = this.rearWheel.position.add(t.scale(0.2).add(e.scale(0.5)));
        rider.foot = this.rearWheel.position.add(t.scale(0.4)).add(e.scale(0.05)).add(s);

        i = rider.hip.sub(rider.foot);
        i = new Vector(-i.y, i.x).scale(this.dir);

        rider.knee = rider.hip.add(rider.foot).scale(0.5).add(i.scale(160 / i.lengthSquared()));
        rider.shadowFoot = this.rearWheel.position.add(t.scale(0.4)).add(e.scale(0.05)).sub(s);

        i = rider.hip.sub(rider.shadowFoot);
        i = new Vector(-i.y, i.x).scale(this.dir);

        rider.shadowKnee = rider.hip.add(rider.shadowFoot).scale(0.5).add(i.scale(160 / i.lengthSquared()));

        return rider;
    }
    
    updateControls() {
        this.rearWheel.motor += (this.parent.gamepad.downKeys.has("ArrowUp") - this.rearWheel.motor) / 10;
        this.rearWheel.brake = this.frontWheel.brake = this.parent.gamepad.downKeys.has("ArrowDown");
        
        let rotate = this.parent.gamepad.downKeys.has("ArrowLeft") - this.parent.gamepad.downKeys.has("ArrowRight");
        this.rearSpring.lean(rotate * this.dir * 5);
        this.frontSpring.lean(-rotate * this.dir * 5);
        this.chasse.rotate(rotate / 6);
        
        if (this.parent.gamepad.downKeys.has("ArrowUp")) {
            this.pedalSpeed += this.rearWheel.pedalSpeed / 5;
            if (!rotate) {
                this.rearSpring.lean(-7);
                this.frontSpring.lean(7);
            }
        }
    }

    draw(ctx) {
        const rearWheel = this.rearWheel.position.toPixel();
        const frontWheel = this.frontWheel.position.toPixel();
        
        ctx.globalAlpha = this.parent.ghost ? .5 : 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = this.parent.scene.parent.theme === "dark" ? "#fbfbfb" : "#000000";
        ctx.lineWidth = 3.5 * this.parent.scene.zoom;

        this.rearWheel.draw(ctx, 10),
        this.frontWheel.draw(ctx, 10);
        
        let l = frontWheel.sub(rearWheel);
        let i = new Vector((frontWheel.y - rearWheel.y) * this.dir, (rearWheel.x - frontWheel.x) * this.dir);
        let a = rearWheel.add(l.scale(0.3)).add(i.scale(0.25));
        let n = rearWheel.add(l.scale(0.84)).add(i.scale(0.42));
        let c = rearWheel.add(l.scale(0.84)).add(i.scale(0.37));
        let w = rearWheel.add(l.scale(0.4)).add(i.scale(0.05));

        ctx.beginPath(),
        ctx.lineWidth = this.parent.scene.zoom * 3,
        ctx.moveTo(rearWheel.x, rearWheel.y),
        ctx.lineTo(a.x, a.y),
        ctx.lineTo(n.x, n.y),
        ctx.moveTo(c.x, c.y),
        ctx.lineTo(w.x, w.y),
        ctx.lineTo(rearWheel.x, rearWheel.y);

        c = new Vector(Math.cos(this.pedalSpeed) * this.parent.scene.zoom * 6, Math.sin(this.pedalSpeed) * this.parent.scene.zoom * 6);
        n = w.add(c);
        c = w.sub(c);

        let C = rearWheel.add(l.scale(0.17)).add(i.scale(0.38));
        let X = rearWheel.add(l.scale(0.3)).add(i.scale(0.45));
        let T = rearWheel.add(l.scale(0.25)).add(i.scale(0.4));

        ctx.moveTo(n.x, n.y);
        ctx.lineTo(c.x, c.y);
        ctx.moveTo(C.x, C.y);
        ctx.lineTo(X.x, X.y);
        ctx.moveTo(w.x, w.y);
        ctx.lineTo(T.x, T.y);

        C = rearWheel.add(l.scale(0.97));
        X = rearWheel.add(l.scale(0.8)).add(i.scale(0.48));
        T = rearWheel.add(l.scale(0.86)).add(i.scale(0.5));
        let Y = rearWheel.add(l.scale(0.82)).add(i.scale(0.65));
        w = rearWheel.add(l.scale(0.78)).add(i.scale(0.67));

        ctx.moveTo(rearWheel.x + l.x, rearWheel.y + l.y),
        ctx.lineTo(C.x, C.y),
        ctx.lineTo(X.x, X.y),
        ctx.lineTo(T.x, T.y),
        ctx.lineTo(Y.x, Y.y),
        ctx.lineTo(w.x, w.y),
        ctx.stroke();
        
        if (!this.parent.dead) {
            i = this.head.position.toPixel().sub(rearWheel).sub(l.scale(0.5));
            let h = a.sub(l.scale(0.1)).add(i.scale(0.3));
            T = n.sub(h);
            let za = this.dir * this.parent.scene.zoom ** 2 / T.dot(T);
            let M = h.add(T.scale(.5)).add(new Vector(T.y, -T.x).scale(200 * za));

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

            n = a.add(l.scale(0.05)).add(i.scale(0.88));

            ctx.beginPath(),
            ctx.lineWidth = this.parent.scene.zoom * 8,
            ctx.moveTo(h.x, h.y),
            ctx.lineTo(n.x, n.y),
            ctx.stroke();

            c = a.add(l.scale(0.15)).add(i.scale(1.05));

            ctx.beginPath(),
            ctx.lineWidth = this.parent.scene.zoom * 2,
            ctx.moveTo(c.x + this.parent.scene.zoom * 5, c.y),
            ctx.arc(c.x, c.y, this.parent.scene.zoom * 5, 0, 2 * Math.PI, true),
            ctx.stroke(),
            ctx.beginPath();
            switch(this.parent.cosmetics.head) {
                case "cap":
                    ctx.moveTo(...Object.values(a.add(l.scale(0.4)).add(i.scale(1.1)))),
                    ctx.lineTo(...Object.values(a.add(l.scale(0.05)).add(i.scale(1.05)))),
                    ctx.stroke();
                    break;

                case "hat":
                    c = a.add(l.scale(0.35)).add(i.scale(1.15));
                    h = a.sub(l.scale(0.05)).add(i.scale(1.1));

                    ctx.fillStyle = this.parent.scene.parent.theme === "dark" ? "#fbfbfb" : "#000000";
                    ctx.moveTo(c.x, c.y),
                    ctx.lineTo(...Object.values(a.add(l.scale(0.25)).add(i.scale(1.13)))),
                    ctx.lineTo(c.x - 0.1 * l.x + 0.2 * i.x, c.y - 0.1 * l.y + 0.2 * i.y),
                    ctx.lineTo(h.x + 0.02 * l.x + 0.2 * i.x, h.y + 0.02 * l.y + 0.2 * i.y),
                    ctx.lineTo(...Object.values(a.add(l.scale(0.05)).add(i.scale(1.11)))),
                    ctx.lineTo(h.x, h.y),
                    ctx.stroke(),
                    ctx.fill();
                    break;
            }
            
            ctx.lineWidth = this.parent.scene.zoom * 5;
            ctx.beginPath(),
            ctx.moveTo(n.x, n.y),
            ctx.lineTo(...Object.values(new Vector((n.y - w.y), -(n.x - w.x)).scale(130 * this.dir * this.parent.scene.zoom ** 2).oppositeScale(n.distanceToSquared(w)).add(n.sub(w).scale(.4)).add(w))),
            ctx.lineTo(w.x, w.y),
            ctx.stroke()
        }

        ctx.globalAlpha = 1;
    }
}