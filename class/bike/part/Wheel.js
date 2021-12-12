import Entity from "./Entity.js";

export default class extends Entity {
    motor = 0;
    gravity = true;
    pedalSpeed = 0;
    drive(a) {
        this.position.addToSelf(a.scale(this.motor * this.parent.dir));
        if (this.brake) {
            this.position.addToSelf(a.scale(-a.dot(this.velocity) * 0.3));
        }
        
        this.pedalSpeed = a.dot(this.velocity) / this.size;
        this.touching = true
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.position.x + 10 * this.parent.track.zoom, this.position.y);
        ctx.arc(this.position.x, this.position.y, this.parent.parent.track.zoom * 10, 0, 2 * Math.PI, true);
        ctx.stroke();
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