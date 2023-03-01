import Mass from "./Mass.js";

export default class extends Mass {
	drive(velocity) {
		this.position.add(velocity.scale(-velocity.dot(this.velocity) * this.friction));
		this.touching = true;
	}

	update() {
		this.velocity.add(this.parent.parent.gravity).scaleSelf(.99);
		this.position.add(this.velocity);
		this.touching = false;
		if (this.collide) {
			this.parent.parent.scene.collide(this);
		}

		this.velocity = this.position.difference(this.old);
		this.old.set(this.position);
		// super.update();
	}
}