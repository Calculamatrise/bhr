import Mass from "./Mass.js";

export default class extends Mass {
	collide(vector) {
		super.collide(vector);
		this.player.destroy()
	}
}