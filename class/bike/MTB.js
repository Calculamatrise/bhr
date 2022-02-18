import Bike from "./Bike.js";
import Vector from "../Vector.js";

export default class extends Bike {
    constructor(parent) {
        super(parent);

        this.head.size = 14;
        this.frontWheel.size = 14;
        this.rearWheel.size = 14;

        this.head.position = new Vector(2, -3);
        this.head.old = this.head.position.clone();
        this.frontWheel.position = new Vector(23, 35);
        this.frontWheel.old = this.frontWheel.position.clone();
        this.rearWheel.position = new Vector(-23, 35);
        this.rearWheel.old = this.rearWheel.position.clone();

        this.rearSpring.lrest = 47;
        this.rearSpring.leff = 47;
        this.rearSpring.springConstant = 0.2;
        this.rearSpring.dampConstant = 0.3;

        this.chasse.lrest = 45;
        this.chasse.leff = 45;
        this.chasse.springConstant = 0.2;
        this.chasse.dampConstant = 0.3;

        this.frontSpring.lrest = 45;
        this.frontSpring.leff = 45;
        this.frontSpring.springConstant = 0.2;
        this.frontSpring.dampConstant = 0.3;

        this.rotationFactor = 8;
    }

    name = "MTB";
    draw(ctx) {
        var b = this.rearWheel.position.toPixel()
        , c = this.frontWheel.position.toPixel()
        , d = this.head.position.toPixel()
        , e = c.sub(b)
        , f = new Vector((c.y - b.y) * this.dir, (b.x - c.x) * this.dir)
        , h = d.sub(b.add(e.scale(0.5)));
        ctx.globalAlpha = this.parent.ghost ? .5 : 1;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = this.parent.scene.parent.theme === "dark" ? "#fbfbfb" : "#000000";
        ctx.lineWidth = 3.5 * this.parent.scene.zoom;
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, this.parent.scene.zoom * 12.5, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c.x, c.y, this.parent.scene.zoom * 12.5, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath(),
        ctx.fillStyle = "grey",
        ctx.moveTo(b.x + 5 * this.parent.scene.zoom, b.y),
        ctx.arc(b.x, b.y, 5 * this.parent.scene.zoom, 0, 2 * Math.PI),
        ctx.moveTo(c.x + 4 * this.parent.scene.zoom, c.y),
        ctx.arc(c.x, c.y, 4 * this.parent.scene.zoom, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.beginPath(),
        ctx.lineWidth = 5 * this.parent.scene.zoom;
        ctx.moveTo(b.x, b.y),
        ctx.lineTo(b.x + 0.4 * e.x + 0.05 * f.x, b.y + 0.4 * e.y + 0.05 * f.y),
        ctx.moveTo(b.x + 0.72 * e.x + 0.64 * h.x, b.y + 0.72 * e.y + 0.64 * h.y),
        ctx.lineTo(b.x + 0.46 * e.x + 0.4 * h.x, b.y + 0.46 * e.y + 0.4 * h.y),
        ctx.lineTo(b.x + 0.4 * e.x + 0.05 * f.x, b.y + 0.4 * e.y + 0.05 * f.y),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.lineWidth = 2 * this.parent.scene.zoom;
        var i = new Vector(6 * Math.cos(this.pedalSpeed) * this.parent.scene.zoom,6 * Math.sin(this.pedalSpeed) * this.parent.scene.zoom);
        ctx.moveTo(b.x + 0.72 * e.x + 0.64 * h.x, b.y + 0.72 * e.y + 0.64 * h.y),
        ctx.lineTo(b.x + 0.43 * e.x + 0.05 * f.x, b.y + 0.43 * e.y + 0.05 * f.y),
        ctx.moveTo(b.x + 0.45 * e.x + 0.3 * h.x, b.y + 0.45 * e.y + 0.3 * h.y),
        ctx.lineTo(b.x + 0.3 * e.x + 0.4 * h.x, b.y + 0.3 * e.y + 0.4 * h.y),
        ctx.lineTo(b.x + 0.25 * e.x + 0.6 * h.x, b.y + 0.25 * e.y + 0.6 * h.y),
        ctx.moveTo(b.x + 0.17 * e.x + 0.6 * h.x, b.y + 0.17 * e.y + 0.6 * h.y),
        ctx.lineTo(b.x + 0.3 * e.x + 0.6 * h.x, b.y + 0.3 * e.y + 0.6 * h.y),
        ctx.moveTo(b.x + 0.43 * e.x + 0.05 * f.x + i.x, b.y + 0.43 * e.y + 0.05 * f.y + i.y),
        ctx.lineTo(b.x + 0.43 * e.x + 0.05 * f.x - i.x, b.y + 0.43 * e.y + 0.05 * f.y - i.y),
        ctx.stroke(),
        ctx.beginPath(),
        ctx.lineWidth = this.parent.scene.zoom;
        ctx.moveTo(b.x + 0.46 * e.x + 0.4 * h.x, b.y + 0.46 * e.y + 0.4 * h.y),
        ctx.lineTo(b.x + 0.28 * e.x + 0.5 * h.x, b.y + 0.28 * e.y + 0.5 * h.y),
        ctx.stroke(),
        ctx.beginPath(),ctx.lineWidth = 3 * this.parent.scene.zoom;
        ctx.moveTo(c.x, c.y),
        ctx.lineTo(b.x + 0.71 * e.x + 0.73 * h.x, b.y + 0.71 * e.y + 0.73 * h.y),
        ctx.lineTo(b.x + 0.73 * e.x + 0.77 * h.x, b.y + 0.73 * e.y + 0.77 * h.y),
        ctx.lineTo(b.x + 0.7 * e.x + 0.8 * h.x, b.y + 0.7 * e.y + 0.8 * h.y),
        ctx.stroke();
        if (!this.parent.dead) {
            var f = d.sub(b.add(e.scale(0.5)))
            , c = b.add(e.scale(0.3)).add(f.scale(0.25))
            , h = b.add(e.scale(0.4)).add(f.scale(0.05))
            , d = h.add(i)
            , l = h.sub(i)
            , b = b.add(e.scale(0.67)).add(f.scale(0.8))
            , i = c.add(e.scale(-0.05)).add(f.scale(0.42))
            , m = d.sub(i)
            , h = new Vector(m.y * this.dir,-m.x * this.dir).scaleSelf(this.parent.scene.zoom * this.parent.scene.zoom)
            , n = i.add(m.scale(0.5)).add(h.scale(200 / m.lengthSquared()))
            , m = l.sub(i)
            , h = i.add(m.scale(0.5)).add(new Vector(m.y * this.dir, -m.x * this.dir).scaleSelf(this.parent.scene.zoom * this.parent.scene.zoom).scale(200 / m.lengthSquared()));
            ctx.beginPath(),ctx.lineWidth = 6 * this.parent.scene.zoom;
            ctx.strokeStyle = this.parent.scene.parent.theme === "dark" ? "#FBFBFB80" : "rgba(0, 0, 0, 0.5)";
            ctx.moveTo(l.x, l.y),
            ctx.lineTo(h.x, h.y),
            ctx.lineTo(i.x, i.y),
            ctx.stroke(),
            ctx.beginPath(),
            ctx.strokeStyle = this.parent.scene.parent.theme === "dark" ? "#fbfbfb" : "#000000";
            ctx.moveTo(d.x, d.y),
            ctx.lineTo(n.x, n.y),
            ctx.lineTo(i.x, i.y),
            ctx.stroke(),
            ctx.lineWidth = 8 * this.parent.scene.zoom;
            h = c.add(e.scale(0.1)).add(f.scale(0.93));
            d = c.add(e.scale(0.2)).add(f.scale(1.09));
            ctx.beginPath(),
            ctx.moveTo(i.x, i.y),
            ctx.lineTo(h.x, h.y),
            ctx.stroke(),
            ctx.beginPath(),
            ctx.lineWidth = 2 * this.parent.scene.zoom;
            ctx.moveTo(d.x + 5 * this.parent.scene.zoom, d.y),
            ctx.arc(d.x, d.y, 5 * this.parent.scene.zoom, 0, 2 * Math.PI, true),
            ctx.stroke();
            ctx.beginPath();
            switch(this.parent.cosmetics.head) {
                case "cap":
                    ctx.moveTo(...Object.values(c.add(e.scale(0.4)).add(f.scale(1.15))));
                    ctx.lineTo(...Object.values(c.add(e.scale(0.1)).add(f.scale(1.05))));
                    ctx.stroke();
                    break;

                case "hat":
                    d = c.add(e.scale(0.37)).add(f.scale(1.19)),
                    i = c.sub(e.scale(0.02)).add(f.scale(1.14)),
                    l = c.add(e.scale(0.28)).add(f.scale(1.17)),
                    c = c.add(e.scale(0.09)).add(f.scale(1.15)),
                    n = d.sub(e.scale(0.1)).addToSelf(f.scale(0.2)),
                    e = i.add(e.scale(0.02)).addToSelf(f.scale(0.2)),
                    ctx.fillStyle = this.parent.scene.parent.theme === "dark" ? "#fbfbfb" : "#000000",
                    ctx.lineJoin = "round",
                    ctx.moveTo(d.x, d.y),
                    ctx.lineTo(l.x, l.y),
                    ctx.lineTo(n.x, n.y),
                    ctx.lineTo(e.x, e.y),
                    ctx.lineTo(c.x, c.y),
                    ctx.lineTo(i.x, i.y),
                    ctx.stroke(),
                    ctx.fill()
            }
            e = h.sub(b);
            f = new Vector(e.y * this.dir,-e.x * this.dir);
            f = f.scale(this.parent.scene.zoom * this.parent.scene.zoom);
            e = b.add(e.scale(0.3)).add(f.scale(80 / e.lengthSquared()));
            ctx.lineWidth = 5 * this.parent.scene.zoom;
            ctx.beginPath(),
            ctx.moveTo(h.x, h.y)
            ,ctx.lineTo(e.x, e.y),
            ctx.lineTo(b.x, b.y),
            ctx.stroke()
        }
    }
}