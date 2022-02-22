import Spring from "../physics/Spring.js";
import Entity from "./Entity.js";

export default class {
    constructor(parent, stickman) {
        this.parent = parent;

        this.head.size = 8;
        this.hip.size = 8;

        for (const point of this.points) {
            point.size = 3,
            point.friction = 0.05;
        }

        for (const joint of this.joints) {
            joint.springConstant = 0.4,
            joint.dampConstant= 0.7;
        }
        
        this.updatePosition(stickman);
    }

    points = [
        this.head = new Entity(this),
        this.hip = new Entity(this),
        this.elbow = new Entity(this),
        this.shadowElbow = new Entity(this),
        this.hand = new Entity(this),
        this.shadowHand = new Entity(this),
        this.knee = new Entity(this),
        this.shadowKnee = new Entity(this),
        this.foot = new Entity(this),
        this.shadowFoot = new Entity(this)
    ]

    joints = [
        new Spring(this.head, this.hip, this),
        new Spring(this.head, this.elbow, this),
        new Spring(this.elbow, this.hand, this),
        new Spring(this.head, this.shadowElbow, this),
        new Spring(this.shadowElbow, this.shadowHand, this),
        new Spring(this.hip, this.knee, this),
        new Spring(this.knee, this.foot, this),
        new Spring(this.hip, this.shadowKnee, this),
        new Spring(this.shadowKnee, this.shadowFoot, this)
    ]

    updatePosition(stickman) {
        for (const part in stickman) {
            this[part].position.copy(stickman[part]);
        }
    }

    update() {
        for (const joint of this.joints) {
            joint.update();
        }

        for (const point of this.points) {
            point.update();
        }
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
        
        ctx.globalAlpha = this.parent.ghost ? .5 : 1;
        ctx.lineWidth = 5 * this.parent.scene.zoom;
        ctx.lineJoin = "round";
        ctx.beginPath(),
        ctx.strokeStyle = this.parent.scene.parent.theme === "dark" ? "#fbfbfb80" : "rgba(0,0,0,0.5)";
        ctx.moveTo(head.x, head.y),
        ctx.lineTo(shadowElbow.x, shadowElbow.y),
        ctx.lineTo(shadowHand.x, shadowHand.y),
        ctx.moveTo(hip.x, hip.y),
        ctx.lineTo(shadowKnee.x, shadowKnee.y),
        ctx.lineTo(shadowFoot.x, shadowFoot.y),
        ctx.stroke();
        ctx.beginPath(),
        ctx.strokeStyle = this.parent.scene.parent.theme === "dark" ? "#fbfbfb" : "#000000";
        ctx.moveTo(head.x, head.y),
        ctx.lineTo(elbow.x, elbow.y),
        ctx.lineTo(hand.x, hand.y),
        ctx.moveTo(hip.x, hip.y),
        ctx.lineTo(knee.x, knee.y),
        ctx.lineTo(foot.x, foot.y),
        ctx.stroke();
        ctx.lineWidth = 8 * this.parent.scene.zoom;
        ctx.beginPath(),
        ctx.moveTo(hip.x, hip.y),
        ctx.lineTo(head.x, head.y),
        ctx.stroke();
        head.addToSelf(head.sub(hip).scale(0.25));
        ctx.lineWidth = 2 * this.parent.scene.zoom;
        ctx.beginPath(),
        ctx.moveTo(head.x + 5 * this.parent.scene.zoom, head.y),
        ctx.arc(head.x, head.y, 5 * this.parent.scene.zoom, 0, 2 * Math.PI),
        ctx.stroke()
    }
    
    setVelocity(a, b) {
        a.scaleSelf(0.7);
        b.scaleSelf(0.7);
        for (const joint of this.joints) {
            let len = joint.getLength();
            len > 20 && (len = 20),
            joint.lrest = joint.leff = len;
        }

        for (let c = 1; 5 > c; c++) {
            this.joints[c].lrest = 13,
            this.joints[c].leff = 13;
        }
        
        let e = [this.head, this.elbow, this.shadowElbow, this.hand, this.shadowHand];
        let f = [this.hip, this.knee, this.shadowKnee, this.foot, this.shadowFoot];
        for (const point of e) {
            point.old = point.position.sub(a);
        }

        for (const point of f) {
            point.old = point.position.sub(b);
        }

        for (const point of this.points) {
            point.velocity.copy(point.position.sub(point.old)),
            point.velocity.x += Math.random() - Math.random(),
            point.velocity.y += Math.random() - Math.random()
        }
    }
    
    clone() {
        const stickman = {};
        for (const part in this) {
            if (part instanceof Entity) {
                stickman[part] = this[part].position.clone();
            }
        }

        return new this.constructor(this.parent, stickman);
    }
}