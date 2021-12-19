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

    draw(ctx, size) {
        const position = this.position.toPixel();

        ctx.beginPath();
        ctx.arc(position.x, position.y, this.parent.parent.track.zoom * size, 0, 2 * Math.PI);
        ctx.stroke();
    }

    clone() {
        const clone = super.clone();
        
        clone.motor = this.motor;
        
        return clone;
    }
}