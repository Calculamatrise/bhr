import Vector from "../Vector.js";
import BodyPart from "./part/Entity.js";
import Wheel from "./part/Wheel.js";
import Spring from "../Spring.js";

export default class {
    constructor(parent) {
        this.parent = parent;

        this.head = new BodyPart(this);
        this.head.drive = this.destroy.bind(this);
        this.frontWheel = new Wheel(this);
        this.rearWheel = new Wheel(this);

        this.rearSpring = new Spring(this.head, this.rearWheel, this);
        this.chasse = new Spring(this.rearWheel,this.frontWheel,this);
        this.frontSpring = new Spring(this.frontWheel,this.head,this);

        this.masses = [this.head, this.frontWheel, this.rearWheel];
        this.springs = [this.rearSpring, this.chasse, this.frontSpring];
    }
    name = null;
    dir = 1;
    pedalSpeed = 0;
    get rider() {
        const rider = {};

        let t = this.frontWheel.position.sub(this.rearWheel.position);
        let e = new Vector(t.y * this.dir, -t.x * this.dir);
        let s = new Vector(Math.cos(this.pedalSpeed) * 6, Math.sin(this.pedalSpeed) * 6);

        rider.head = this.rearWheel.position.add(t.scale(0.35)).add(this.head.position.sub(this.frontWheel.position.add(this.rearWheel.position).scale(0.5)).scale(1.2));
        rider.hand = this.rearWheel.position.add(t.scale(0.8)).add(e.scale(0.68));
        rider.shadowHand = rider.hand.clone();

        let i = rider.head.sub(rider.hand);
        i = new Vector(i.y * this.dir, -i.x * this.dir);

        rider.elbow = rider.head.add(rider.hand).scale(0.5).add(i.scale(130 / i.lengthSquared()));
        rider.shadowElbow = rider.elbow.clone();
        rider.hip = this.rearWheel.position.add(t.scale(0.2).add(e.scale(0.5)));
        rider.foot = this.rearWheel.position.add(t.scale(0.4)).add(e.scale(0.05)).add(s);

        i = rider.hip.sub(rider.foot);
        i = new Vector(-i.y * this.dir, i.x * this.dir);

        rider.knee = rider.hip.add(rider.foot).scale(0.5).add(i.scale(160 / i.lengthSquared()));
        rider.shadowFoot = this.rearWheel.position.add(t.scale(0.4)).add(e.scale(0.05)).sub(s);

        i = rider.hip.sub(rider.shadowFoot);
        i = new Vector(-i.y * this.dir, i.x * this.dir);

        rider.shadowKnee = rider.hip.add(rider.shadowFoot).scale(0.5).add(i.scale(160 / i.lengthSquared()));

        return rider;
    }
    
    swap() {
        this.dir *= -1;
        this.chasse.swap();
        let rearSpring = this.rearSpring.leff;
        this.rearSpring.leff = this.frontSpring.leff;
        this.frontSpring.leff = rearSpring;
        this.parent.collide("turn");
    }

    update(delta) {
        if (!this.parent.dead)
            this.updateControls()

        if (this.rearWheel.touching && this.frontWheel.touching) {
            this.parent.slow = false;
        }

        for (const spring of this.springs)
            spring.update();

        for (const mass of this.masses)
            mass.update();

        if (!this.parent.slow && !this.parent.dead) {
            this.updateControls();
            for (const spring of this.springs)
                spring.update();

            for (const mass of this.masses)
                mass.update();
        }
    }

    move(x, y) {
        for (const mass of this.masses) {
            mass.position.x += x;
            mass.position.y += y;
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
}