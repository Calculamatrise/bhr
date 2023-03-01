import EventEmitter from "../EventEmitter.js";
import Vector from "../Vector.js";

export default class extends EventEmitter {
	#lock = false;
	down = false;
	old = new Vector();
	position = new Vector();
	constructor(canvas) {
		super();
		this.canvas = canvas;
		this.canvas.addEventListener('click', this.click.bind(this));
		this.canvas.addEventListener('pointerdown', this.mousedown.bind(this));
		window.addEventListener('pointermove', this.move.bind(this));
		window.addEventListener('pointerup', this.up.bind(this));
		this.canvas.addEventListener('wheel', this.wheel.bind(this));
		this.canvas.addEventListener('contextmenu', this.menu.bind(this));
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

	lock(options) {
		return this.canvas.requestPointerLock(options ?? {
			unadjustedMovement: true
		});
	}

	mousedown(event) {
		event.preventDefault();
		this.down = true;
		this.emit('down', event);
		this.old.set(this.position);
	}

	move(event) {
		event.preventDefault();
		if (this.locked) {
			this.position.add(new Vector(event.movementX, event.movementY));
		} else {
			this.position.set(new Vector(event.offsetX, event.offsetY).toCanvas(this.canvas));
		}

		this.emit('move', event);
	}

	up(event) {
		event.preventDefault();
		this.down = false;
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
		this.canvas.removeEventListener('mousedown', this.mousedown);
		this.canvas.removeEventListener('mousemove', this.move);
		this.canvas.removeEventListener('mouseup', this.up);
		this.canvas.removeEventListener('mousewheel', this.wheel);
		this.canvas.removeEventListener('contextmenu', this.menu);
	}
}