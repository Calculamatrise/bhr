import Entity from "./Entity.js";

export default class extends Entity {
	motor = 0;
	tangible = true;
	touching = false;
	addFriction(vector) {
		this.position.add(vector.scale(-vector.dot(this.velocity) * this.motor));
	}

	drive(vector) {
		this.addFriction(vector);
		this.touching = true
	}

	fixedUpdate() {
		super.fixedUpdate();
		this.velocity.add(this.parent.parent.gravity).scaleSelf(.99);
		this.position.add(this.velocity);
		this.touching = false;
		this.tangible && this.parent.parent.scene.track.collide(this);
		this.velocity = this.position.difference(this.old);
		this.old.set(this.position)
	}
}