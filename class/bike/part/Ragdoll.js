import Spring from "../../Spring.js";
import BodyPart from "./Entity.js";

export default class {
    constructor(parent, stickman) {
        this.parent = parent;

        this.dead = true;
        this.points = [
            this.head = new BodyPart(this),
            this.hip = new BodyPart(this),
            this.elbow = new BodyPart(this),
            this.shadowElbow = new BodyPart(this),
            this.hand = new BodyPart(this),
            this.shadowHand = new BodyPart(this),
            this.knee = new BodyPart(this),
            this.shadowKnee = new BodyPart(this),
            this.foot = new BodyPart(this),
            this.shadowFoot = new BodyPart(this)
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
        
        for (const part in stickman) {
            this[part].position.copy(stickman[part]);
        }
    }
    update() {
        for (var a = this.joints.length - 1; a >= 0; a--)
            this.joints[a].update();
            
        for (a = this.points.length - 1; a >= 0; a--)
            this.points[a].update()
    }
    draw(ctx) {
        const head = this.head.position.toPixel();
        const elbow = this.elbow.position.toPixel(); 
        const hand = this.hand.position.toPixel();
        const shadowElbow = this.shadowElbow.position.toPixel();
        const shadowHand = this.shadowHand.position.toPixel();
        const knee = this.knee.position.toPixel();
        const foot = this.foot.position.toPixel();
        const shadowKnee = this.shadowKnee.position.toPixel();
        const shadowFoot = this.shadowFoot.position.toPixel();
        const hip = this.hip.position.toPixel();
        
        ctx.globalAlpha = this.ghost ? .5 : 1;
        ctx.lineWidth = 5 * this.parent.track.zoom;
        ctx.lineJoin = "round";
        ctx.strokeStyle = this.parent.track.parent.theme.dark ? "#FBFBFB80" : "rgba(0,0,0,0.5)";
        ctx.beginPath(),
        ctx.moveTo(head.x, head.y),
        ctx.lineTo(shadowElbow.x, shadowElbow.y),
        ctx.lineTo(shadowHand.x, shadowHand.y),
        ctx.moveTo(hip.x, hip.y),
        ctx.lineTo(shadowKnee.x, shadowKnee.y),
        ctx.lineTo(shadowFoot.x, shadowFoot.y),
        ctx.stroke();
        ctx.strokeStyle = this.parent.track.parent.theme.dark ? "#FBFBFB" : "#000000";
        ctx.beginPath(),
        ctx.moveTo(head.x, head.y),
        ctx.lineTo(elbow.x, elbow.y),
        ctx.lineTo(hand.x, hand.y),
        ctx.moveTo(hip.x, hip.y),
        ctx.lineTo(knee.x, knee.y),
        ctx.lineTo(foot.x, foot.y),
        ctx.stroke();
        ctx.lineWidth = 8 * this.parent.track.zoom;
        ctx.beginPath(),
        ctx.moveTo(hip.x, hip.y),
        ctx.lineTo(head.x, head.y),
        ctx.stroke();
        head.addToSelf(head.sub(hip).scale(0.25));
        ctx.lineWidth = 2 * this.parent.track.zoom;
        ctx.beginPath(),
        ctx.moveTo(head.x + 5 * this.parent.track.zoom, head.y),
        ctx.arc(head.x, head.y, 5 * this.parent.track.zoom, 0, 2 * Math.PI, !0),
        ctx.stroke()
    }
    setVelocity(a, b) {
        a.scaleSelf(0.7);
        b.scaleSelf(0.7);
        var c, d, e, f;
        c = 0;
        for (d = this.joints.length; c < d; c++)
            e = this.joints[c].length,
            20 < e && (e = 20),
            this.joints[c].lrest = this.joints[c].leff = e;
        for (c = 1; 5 > c; c++)
            this.joints[c].lrest = 13,
            this.joints[c].leff = 13;
        e = [this.head, this.elbow, this.shadowElbow, this.hand, this.shadowHand];
        f = [this.hip, this.knee, this.shadowKnee, this.foot, this.shadowFoot];
        c = 0;
        for (d = e.length; c < d; c++)
            e[c].old = e[c].position.sub(a);
        c = 0;
        for (d = f.length; c < d; c++)
            f[c].old = f[c].position.sub(b);
        for (c = this.points.length - 1; 0 <= c; c--)
            this.points[c].velocity.copy(this.points[c].position.sub(this.points[c].old)),
            this.points[c].velocity.x += Math.random() - Math.random(),
            this.points[c].velocity.y += Math.random() - Math.random()
    }
}