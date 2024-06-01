import EventEmitter from "../EventEmitter.js";
import Coordinates from "../Coordinates.js";

export default class extends EventEmitter {
	down = false;
	old = new Coordinates();
	position = new Coordinates();
	rawPosition = new Coordinates();
	target = null;
	stroke = new Coordinates();
	get locked() {
		return document.pointerLockElement === this.target;
	}

	_listen() {
		Object.defineProperties(this, {
			_onclick: { value: this.click.bind(this), writable: true },
			_onpointerdown: { value: this.pointerdown.bind(this), writable: true },
			_onpointermove: { value: this.move.bind(this), writable: true },
			_onpointerup: { value: this.up.bind(this), writable: true },
			_oncontextmenu: { value: this.menu.bind(this), writable: true },
			_onwheel: { value: this.wheel.bind(this), writable: true }
		});
		this.target.addEventListener('click', this._onclick, { passive: true });
		this.target.addEventListener('pointerdown', this._onpointerdown, { passive: true });
		this.target.addEventListener('pointermove', this._onpointermove, { passive: true });
		this.target.addEventListener('pointerup', this._onpointerup, { passive: true });
		this.target.addEventListener('contextmenu', this._oncontextmenu);
		this.target.addEventListener('wheel', this._onwheel);
		// document.addEventListener('pointerlockchange', this.lockChangeAlert.bind(this), false /* { passive: true } */);
	}

	_unlisten() {
		this.target.removeEventListener('click', this._onclick);
		this.target.removeEventListener('pointerdown', this._onpointerdown);
		this.target.removeEventListener('pointermove', this._onpointermove);
		this.target.removeEventListener('pointerup', this._onpointerup);
		this.target.removeEventListener('contextmenu', this._oncontextmenu);
		this.target.removeEventListener('wheel', this._onwheel);
	}

	setTarget(target) {
		this.target !== null && this.close();
		Object.defineProperty(this, 'target', { value: target, enumerable: false });
		this._listen()
	}

	async click(event) {
		if (event.ctrlKey && event.shiftKey) {
			await this.lock();
		}

		this.emit('click', event);
	}

	lock(options = {}) {
		return this.target.requestPointerLock(Object.assign({ unadjustedMovement: true }, arguments[0]));
	}

	pointerdown(event) {
		this.down = true;
		this.old.set(this.position);
		if (!this.locked) {
			this.rawPosition.set(new Coordinates(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio));
			this.position.set(this.rawPosition.toCanvas(this.target));
			this.target.setPointerCapture(event.pointerId);
		}

		this.emit('down', event);
	}

	move(event) {
		if (this.locked) {
			this.rawPosition.add(new Coordinates(event.movementX * window.devicePixelRatio, event.movementY * window.devicePixelRatio));
		} else {
			this.rawPosition.set(new Coordinates(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio));
		}

		this.position.set(this.rawPosition.toCanvas(this.target));
		this.emit('move', event);
	}

	up(event) {
		this.down = false;
		if (!this.locked) {
			this.rawPosition.set(new Coordinates(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio));
			this.position.set(this.rawPosition.toCanvas(this.target));
			this.target.releasePointerCapture(event.pointerId);
		}

		this.emit('up', event);
	}

	wheel(event) {
		this.emit('wheel', event);
	}

	menu(event) {
		event.preventDefault();
		this.emit('menu', event);
	}

	close() {
		this._unlisten();
		this.target = null
	}
}