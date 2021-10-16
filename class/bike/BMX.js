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
        this.head.displayPos = this.head.position.clone();
        this.frontWheel.position = new Vector(21, 38);
        this.frontWheel.old = this.frontWheel.position.clone();
        this.frontWheel.displayPos = this.frontWheel.position.clone();
        this.rearWheel.position = new Vector(-21, 38);
        this.rearWheel.old = this.rearWheel.position.clone();
        this.rearWheel.displayPos = this.rearWheel.position.clone();

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
    draw(ctx) {
        const rearWheel = this.rearWheel.displayPos.toPixel();
        const frontWheel = this.frontWheel.displayPos.toPixel();
        
        ctx.globalAlpha = this.parent.ghost ? .5 : 1;
        ctx.strokeStyle = this.parent.track.parent.theme.dark ? "#FBFBFB" : "#000000";
        ctx.lineWidth = 3.5 * this.parent.track.zoom;

        ctx.beginPath(),
        ctx.arc(rearWheel.x, rearWheel.y, this.parent.track.zoom * 10, 0, 2 * Math.PI, true),
        ctx.moveTo(frontWheel.x + 10 * this.parent.track.zoom, frontWheel.y),
        ctx.arc(frontWheel.x, frontWheel.y, this.parent.track.zoom * 10, 0, 2 * Math.PI, true),
        ctx.stroke();
        
        let l = frontWheel.sub(rearWheel);
        let i = new Vector((frontWheel.y - rearWheel.y) * this.dir, (rearWheel.x - frontWheel.x) * this.dir);
        let a = rearWheel.add(l.scale(0.3)).add(i.scale(0.25));
        let n = rearWheel.add(l.scale(0.84)).add(i.scale(0.42));
        let c = rearWheel.add(l.scale(0.84)).add(i.scale(0.37));
        let w = rearWheel.add(l.scale(0.4)).add(i.scale(0.05));

        ctx.lineWidth = this.parent.track.zoom * 3;

        ctx.beginPath(),
        ctx.moveTo(rearWheel.x, rearWheel.y),
        ctx.lineTo(a.x, a.y),
        ctx.lineTo(n.x, n.y),
        ctx.moveTo(c.x, c.y),
        ctx.lineTo(w.x, w.y),
        ctx.lineTo(rearWheel.x, rearWheel.y);

        c = new Vector(Math.cos(this.pedalSpeed) * this.parent.track.zoom * 6, Math.sin(this.pedalSpeed) * this.parent.track.zoom * 6);
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
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            i = this.head.displayPos.toPixel().sub(rearWheel).sub(l.scale(0.5));
            let h = a.sub(l.scale(0.1)).add(i.scale(0.3));
            T = n.sub(h);
            let za = this.dir * this.parent.track.zoom ** 2 / T.dot(T);
            let M = new Vector(h.x + 0.5 * T.x + 200 * T.y * za, h.y + 0.5 * T.y + 200 * -T.x * za);
            let N = new Vector(h.x + 0.5 * T.x + 200 * T.y * za, h.y + 0.5 * T.y + 200 * -T.x * za);
            
            ctx.lineWidth = this.parent.track.zoom * 6;
            ctx.strokeStyle = this.parent.track.parent.theme.dark ? "#FBFBFB80" : "rgba(0, 0, 0, 0.5)";
            ctx.beginPath(),
            ctx.moveTo(c.x, c.y),
            ctx.lineTo(N.x, N.y),
            ctx.lineTo(h.x, h.y),
            ctx.stroke();

            ctx.strokeStyle = this.parent.track.parent.theme.dark ? "#FBFBFB" : "#000000";
            ctx.beginPath(),
            ctx.moveTo(n.x, n.y),
            ctx.lineTo(M.x, M.y),
            ctx.lineTo(h.x, h.y),
            ctx.stroke();

            n = a.add(l.scale(0.05)).add(i.scale(0.88));

            ctx.lineWidth = this.parent.track.zoom * 8;
            ctx.beginPath(),
            ctx.moveTo(h.x, h.y),
            ctx.lineTo(n.x, n.y),
            ctx.stroke();

            c = a.add(l.scale(0.15)).add(i.scale(1.05));

            ctx.lineWidth = this.parent.track.zoom * 2;
            ctx.beginPath(),
            ctx.moveTo(c.x + (this.parent.track.zoom * 5), c.y),
            ctx.arc(c.x, c.y, this.parent.track.zoom * 5, 0, 2 * Math.PI, true),
            ctx.stroke(),
            ctx.beginPath();
            switch (this.parent.cosmetics.head) {
                case "cap":
                    c = a.add(l.scale(0.4)).add(i.scale(1.1));
                    a = a.add(l.scale(0.05)).add(i.scale(1.05));

                    ctx.moveTo(a.x, a.y),
                    ctx.lineTo(c.x, c.y),
                    ctx.stroke();

                    break;

                case "hat":
                    c = a.add(l.scale(0.35)).add(i.scale(1.15));
                    h = a.sub(l.scale(0.05)).add(i.scale(1.1));
                    M = a.add(l.scale(0.25)).add(i.scale(1.13));
                    a = a.add(l.scale(0.05)).add(i.scale(1.11));
                    let ya = c.x - 0.1 * l.x + 0.2 * i.x;
                    T = c.y - 0.1 * l.y + 0.2 * i.y;
                    let lm = h.x + 0.02 * l.x + 0.2 * i.x;
                    let m = h.y + 0.02 * l.y + 0.2 * i.y;

                    ctx.fillStyle = this.parent.track.parent.theme.dark ? "#FBFBFB" : "#000000";
                    ctx.moveTo(c.x, c.y),
                    ctx.lineTo(M.x, M.y),
                    ctx.lineTo(ya, T),
                    ctx.lineTo(lm, m),
                    ctx.lineTo(a.x, a.y),
                    ctx.lineTo(h.x, h.y),
                    ctx.stroke(),
                    ctx.fill();
                    
                    break;
            }
            i = new Vector((n.y - w.y) * this.dir * this.parent.track.zoom ** 2, -(n.x - w.x) * this.dir * this.parent.track.zoom ** 2);

            let f = (n.x - w.x) ** 2 + (n.y - w.y) ** 2;
            l = w.x + 0.4 * (n.x - w.x) + 130 * i.x / f;
            let m = w.y + 0.4 * (n.y - w.y) + 130 * i.y / f;
            
            ctx.lineWidth = this.parent.track.zoom * 5;
            ctx.beginPath(),
            ctx.moveTo(n.x, n.y),
            ctx.lineTo(l, m),
            ctx.lineTo(w.x, w.y),
            ctx.stroke()
        }

        ctx.globalAlpha = 1;
    }
}