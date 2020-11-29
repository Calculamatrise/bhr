import Vehicle from "../../Vehicle.js";
import DeadRider from "./DeadRider.js";

export default class DeadBike extends Vehicle {
    constructor(a, b, c, d = []) {
        super(c);
        this.checkpoints = d;
        this.dead = !0;
        this.rider = new DeadRider(b, c, a.ghost);
        this.rider.setVelocity(a.head.vel, a.rearWheel.vel);
        this.rider.dir = a.dir;
        this.rider.gravity = this.gravity = a.gravity;
        this.time = a.time;
        this.head = this.rider.head;
        this.masses = a;
    }
    draw() {
        this.masses.draw();
        this.rider.draw();
        if (this.hat) {
            this.hat.draw()
        }
    }
    update() {
        this.masses.update();
        this.rider.update();
        if (this.hat) {
            this.hat.update()
        }
    }
}