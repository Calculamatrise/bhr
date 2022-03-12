import Mass from "./Mass.js";

export default class extends Mass {
    drive(velocity) {
        this.position.addToSelf(velocity.scale(-velocity.dot(this.velocity) * this.friction));
        this.touching = true;
    }

    update(delta) {
        this.velocity.addToSelf(this.parent.parent.gravity).scaleSelf(.99);
        this.position.addToSelf(this.velocity);
        this.touching = false;
        if (this.collide) {
            this.parent.parent.scene.collide(this);
        }
        
        this.velocity = this.position.sub(this.old);
        this.old.copy(this.position);
    }
}