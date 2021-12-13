import Entity from "./Entity.js";

export default class extends Entity {
    motor = 0;
    pedalSpeed = 0;
    drive(velocity) {
        this.position.addToSelf(velocity.scale(this.motor * this.parent.dir));
        if (this.brake) {
            this.position.addToSelf(velocity.scale(-velocity.dot(this.velocity) * 0.3));
        }
        
        this.pedalSpeed = velocity.dot(this.velocity) / this.size;
        this.touching = true;
    }

    clone() {
        const clone = new this.constructor(this.parent);
        
        clone.size = this.size;
        clone.position = this.position.clone();
        clone.old = this.old.clone();
        clone.velocity = this.velocity.clone();
        clone.motor = this.motor;
        
        return clone
    }
}