import Vector from "../../Vector.js";
import Spring from "../../Spring.js";
import BodyPart from "../part/BodyPart.js";
import { ctx } from "../../../bootstrap.js";

export default class DeadRider {
    constructor(a, b, c) {
        this.dead = !0;
        var vector = new Vector(0,0);
        this.dir = 1;
        this.ghost = c;
        this.masses = b;
        this.track = b;
        this.points = [
            this.head = new BodyPart(vector, this),
            this.hip = new BodyPart(vector, this),
            this.elbow = new BodyPart(vector, this),
            this.shadowElbow = new BodyPart(vector, this),
            this.hand = new BodyPart(vector, this),
            this.shadowHand = new BodyPart(vector, this),
            this.knee = new BodyPart(vector, this),
            this.shadowKnee = new BodyPart(vector, this),
            this.foot = new BodyPart(vector, this),
            this.shadowFoot = new BodyPart(vector, this)
        ];
        this.joints = [
            new Spring(this.head,this.hip,this),
            new Spring(this.head,this.elbow,this),
            new Spring(this.elbow,this.hand,this),
            new Spring(this.head,this.shadowElbow,this),
            new Spring(this.shadowElbow,this.shadowHand,this),
            new Spring(this.hip,this.knee,this),
            new Spring(this.knee,this.foot,this),
            new Spring(this.hip,this.shadowKnee,this),
            new Spring(this.shadowKnee,this.shadowFoot,this)
        ];
        for (var point in this.points) {
            this.points[point].size = 3,
            this.points[point].friction = 0.05;
        }
        this.head.size = this.hip.size = 8;
        for (var joint in this.joints) {
            this.joints[joint].springConstant = 0.4,
            this.joints[joint].dampConstant= 0.7;
        }
        for (var part in a) {
            if (a.hasOwnProperty(part)) {
                this[part].pos.copy(a[part])
            }
        }
    }
    draw() {
        var a = this.track,
            head = this.head.pos.toPixel(),
            elbow = this.elbow.pos.toPixel(), 
            hand = this.hand.pos.toPixel(), 
            shadowElbow = this.shadowElbow.pos.toPixel(),
            shadowHand = this.shadowHand.pos.toPixel(),
            knee = this.knee.pos.toPixel(),
            foot = this.foot.pos.toPixel(),
            shadowKnee = this.shadowKnee.pos.toPixel(),
            shadowFoot = this.shadowFoot.pos.toPixel(),
            hip = this.hip.pos.toPixel();
        ctx.globalAlpha = this.ghost ? .5 : 1;
        ctx.lineWidth = 5 * a.zoom;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.beginPath(),ctx.moveTo(head.x, head.y),ctx.lineTo(shadowElbow.x, shadowElbow.y),ctx.lineTo(shadowHand.x, shadowHand.y),ctx.moveTo(hip.x, hip.y),ctx.lineTo(shadowKnee.x, shadowKnee.y),ctx.lineTo(shadowFoot.x, shadowFoot.y),ctx.stroke();
        ctx.strokeStyle = "#000";
        ctx.beginPath(),ctx.moveTo(head.x, head.y),ctx.lineTo(elbow.x, elbow.y),ctx.lineTo(hand.x, hand.y),ctx.moveTo(hip.x, hip.y),ctx.lineTo(knee.x, knee.y),ctx.lineTo(foot.x, foot.y),ctx.stroke();
        ctx.lineWidth = 8 * a.zoom;
        ctx.beginPath(),ctx.moveTo(hip.x, hip.y),ctx.lineTo(head.x, head.y),ctx.stroke();
        head.addToSelf(head.sub(hip).scale(0.25));
        ctx.lineWidth = 2 * a.zoom;
        ctx.beginPath(),ctx.moveTo(head.x + 5 * a.zoom, head.y),ctx.arc(head.x, head.y, 5 * a.zoom, 0, 2 * Math.PI, !0),ctx.stroke()
    }
    update() {
        for (var a = this.joints.length - 1; a >= 0; a--)
            this.joints[a].update();
        for (a = this.points.length - 1; a >= 0; a--)
            this.points[a].update()
    }
    setVelocity(a, b) {
        a.scaleSelf(0.7);
        b.scaleSelf(0.7);
        var c, d, e, f;
        c = 0;
        for (d = this.joints.length; c < d; c++)
            e = this.joints[c].getLength(),
            20 < e && (e = 20),
            this.joints[c].lrest = this.joints[c].leff = e;
        for (c = 1; 5 > c; c++)
            this.joints[c].lrest = 13,
            this.joints[c].leff = 13;
        e = [this.head, this.elbow, this.shadowElbow, this.hand, this.shadowHand];
        f = [this.hip, this.knee, this.shadowKnee, this.foot, this.shadowFoot];
        c = 0;
        for (d = e.length; c < d; c++)
            e[c].old = e[c].pos.sub(a);
        c = 0;
        for (d = f.length; c < d; c++)
            f[c].old = f[c].pos.sub(b);
        for (c = this.points.length - 1; 0 <= c; c--)
            this.points[c].vel.copy(this.points[c].pos.sub(this.points[c].old)),
            this.points[c].vel.x += Math.random() - Math.random(),
            this.points[c].vel.y += Math.random() - Math.random()
    }
}