import EventEmitter from "../EventEmitter.js";
import Vector from "../Vector.js";

export default class extends EventEmitter {
	#lock = false;
	down = false;
	old = new Vector();
	position = new Vector();
	rawPosition = new Vector();
	stroke = new Vector();
	constructor(canvas) {
		super();
		this.canvas = canvas;
		this.canvas.addEventListener('click', this.click = this.click.bind(this));
		this.canvas.addEventListener('pointerdown', this.pointerdown = this.pointerdown.bind(this));
		this.canvas.addEventListener('pointermove', this.move = this.move.bind(this));
		this.canvas.addEventListener('pointerup', this.up = this.up.bind(this));
		this.canvas.addEventListener('contextmenu', this.menu = this.menu.bind(this));
		this.canvas.addEventListener('wheel', this.wheel = this.wheel.bind(this));
		// document.addEventListener('pointerlockchange', this.lockChangeAlert.bind(this), false);
	}

	get locked() {
		return document.pointerLockElement === this.canvas;
	}

	async click(event) {
		event.preventDefault();
		if (event.ctrlKey && event.shiftKey) {
			await this.lock();
		}

		this.emit('click', event);
	}

	lock(options = {}) {
		return this.canvas.requestPointerLock(Object.assign({ unadjustedMovement: true }, arguments[0]));
	}

	pointerdown(event) {
		event.preventDefault();
		this.down = true;
		this.old.set(this.position);
		if (!this.locked) {
			this.rawPosition.set(new Vector(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio));
			this.position.set(this.rawPosition.toCanvas(this.canvas));
			this.canvas.setPointerCapture(event.pointerId);
		}

		this.emit('down', event);
	}

	move(event) {
		event.preventDefault();
		if (this.locked) {
			this.position.add(new Vector(event.movementX * window.devicePixelRatio, event.movementY * window.devicePixelRatio));
			this.rawPosition.add(new Vector(event.movementX * window.devicePixelRatio, event.movementY * window.devicePixelRatio));
		} else {
			this.rawPosition.set(new Vector(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio));
			this.position.set(this.rawPosition.toCanvas(this.canvas));
		}

		this.emit('move', event);
	}

	up(event) {
		event.preventDefault();
		this.down = false;
		if (!this.locked) {
			this.rawPosition.set(new Vector(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio));
			this.position.set(this.rawPosition.toCanvas(this.canvas));
			this.canvas.releasePointerCapture(event.pointerId);
		}

		this.emit('up', event);
	}

	wheel(event) {
		event.preventDefault();
		this.emit('wheel', event);
	}

	menu(event) {
		event.preventDefault();
		this.emit('menu', event);
	}

	close() {
		this.canvas.removeEventListener('click', this.click);
		this.canvas.removeEventListener('pointerdown', this.pointerdown);
		this.canvas.removeEventListener('pointermove', this.move);
		this.canvas.removeEventListener('pointerup', this.up);
		this.canvas.removeEventListener('contextmenu', this.menu);
		this.canvas.removeEventListener('mousewheel', this.wheel);
	}
}