import Vector from "../Vector.js";
import Entity from "./part/Entity.js";
import Wheel from "./part/Wheel.js";
import Spring from "./physics/Spring.js";

export default class {
    constructor(parent) {
        this.parent = parent;

        this.head = new Entity(this);
        this.head.drive = this.destroy.bind(this);
        this.rearWheel = new Wheel(this);
        this.frontWheel = new Wheel(this);

        this.rearSpring = new Spring(this.head, this.rearWheel);
        this.chasse = new Spring(this.rearWheel, this.frontWheel);
        this.frontSpring = new Spring(this.frontWheel, this.head);

        this.masses.push(this.head, this.frontWheel, this.rearWheel);
        this.springs.push(this.rearSpring, this.chasse, this.frontSpring);
    }
    dir = 1;
    pedalSpeed = 0;
    rotationFactor = 0;
    masses = [];
    springs = [];
    get rider() {
        const rider = {};

        let t = this.frontWheel.position.sub(this.rearWheel.position);
        let e = new Vector(t.y, -t.x).scale(this.dir);
        let s = new Vector(Math.cos(this.pedalSpeed), Math.sin(this.pedalSpeed)).scale(6);

        rider.head = this.rearWheel.position.add(t.scale(0.35)).add(this.head.position.sub(this.frontWheel.position.add(this.rearWheel.position).scale(0.5)).scale(1.2));
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
    
    swap() {
        this.dir *= -1;
        this.chasse.swap();
        let rearSpring = this.rearSpring.leff;
        this.rearSpring.leff = this.frontSpring.leff;
        this.frontSpring.leff = rearSpring;
    }

    update(delta) {
        if (!this.parent.dead)
            this.updateControls();

        for (let a = this.springs.length - 1; a >= 0; a--) {
            this.springs[a].update();
        }

        for (let a = this.masses.length - 1; a >= 0; a--) {
            this.masses[a].update(delta);
        }

        if (this.rearWheel.touching && this.frontWheel.touching) {
            this.parent.slow = false;
        }

        // this.parent.scene.parent.ups = this.parent.slow || this.parent.dead ? 25 : 50;
        if (!this.parent.slow && !this.parent.dead) {
            this.updateControls();

            for (let a = this.springs.length - 1; a >= 0; a--) {
                this.springs[a].update();
            }

            for (let a = this.masses.length - 1; a >= 0; a--) {
                this.masses[a].update(delta);
            }
        }
    }

    updateControls() {
        this.rearWheel.motor += (this.parent.gamepad.downKeys.has("up") - this.rearWheel.motor) / 10;
        this.rearWheel.brake = this.frontWheel.brake = this.parent.gamepad.downKeys.has("down");
        
        let rotate = this.parent.gamepad.downKeys.has("left") - this.parent.gamepad.downKeys.has("right");
        this.rearSpring.lean(rotate * this.dir * 5);
        this.frontSpring.lean(-rotate * this.dir * 5);
        this.chasse.rotate(rotate / this.rotationFactor);
        if (this.parent.gamepad.downKeys.has("up")) {
            this.pedalSpeed += this.rearWheel.pedalSpeed / 5;
            if (!rotate) {
                this.rearSpring.lean(-7);
                this.frontSpring.lean(7);
            }
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
        this.rearWheel.motor = 0;
        this.rearWheel.brake = false;
        this.frontWheel.brake = false;
        
        this.parent.createRagdoll();
    }

    clone() {
        const clone = new this.constructor(this.parent);

        clone.dir = this.dir;

        clone.head.position.copy(this.head.position);
        clone.head.old.copy(this.head.old);
        clone.head.velocity.copy(this.head.velocity);

        clone.rearWheel.position.copy(this.rearWheel.position);
        clone.rearWheel.old.copy(this.rearWheel.old);
        clone.rearWheel.velocity.copy(this.rearWheel.velocity);
        clone.rearWheel.motor = this.rearWheel.motor;

        clone.frontWheel.position.copy(this.frontWheel.position);
        clone.frontWheel.old.copy(this.frontWheel.old);
        clone.frontWheel.velocity.copy(this.frontWheel.velocity);
        clone.frontWheel.motor = this.frontWheel.motor;

        clone.rearSpring.leff = this.rearSpring.leff;
        clone.chasse.leff = this.chasse.leff;
        clone.frontSpring.leff = this.frontSpring.leff;

        return clone;
    }
}