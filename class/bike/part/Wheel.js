import Entity from "./Entity.js";

export default class extends Entity {
    motor = 0;
    pedalSpeed = 0;
    drive(velocity) {
        this.position.addToSelf(velocity.scale(this.motor * this.parent.dir));
        if (this.brake) {
            this.position.addToSelf(velocity.scale(.3 * -velocity.dot(this.velocity)));
        }
        
        this.pedalSpeed = velocity.dot(this.velocity) / this.size;
        this.touching = true;
    }
}