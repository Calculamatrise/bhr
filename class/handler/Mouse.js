import EventEmitter from "../EventEmitter.js";
import Coordinates from "../Coordinates.js";

export default class extends EventEmitter {
	active = false;
	down = false;
	old = new Coordinates();
	position = new Coordinates();
	rawPosition = new Coordinates();
	target = null;
	stroke = new Coordinates();
	get locked() {
		return document.pointerLockElement === this.target
	}

	_listen() {
		Object.defineProperties(this, {
			_onblur: { value: () => this.active = false, writable: true },
			_onclick: { value: this._click.bind(this), writable: true },
			_oncontextmenu: { value: this._contextmenu.bind(this), writable: true },
			_onpointerdown: { value: this._down.bind(this), writable: true },
			_onpointerenter: { value: this.activate.bind(this), writable: true },
			_onpointermove: { value: this._move.bind(this), writable: true },
			_onpointerup: { value: this._up.bind(this), writable: true },
			_onwheel: { value: this._wheel.bind(this), writable: true }
		});
		this.target.addEventListener('click', this._onclick, { passive: true });
		this.target.addEventListener('contextmenu', this._oncontextmenu);
		this.target.addEventListener('pointerdown', this._onpointerdown, { passive: true });
		this.target.addEventListener('pointerleave', this._onblur, { passive: true });
		this.target.addEventListener('pointerenter', this._onpointerenter, { passive: true });
		this.target.addEventListener('pointermove', this._onpointermove, { passive: true });
		this.target.addEventListener('pointerup', this._onpointerup, { passive: true });
		this.target.addEventListener('wheel', this._onwheel);
		window.addEventListener('blur', this._onblur, { passive: true });
		// document.addEventListener('pointerlockchange', this.lockChangeAlert.bind(this), false /* { passive: true } */);
	}

	_unlisten() {
		this.target.removeEventListener('click', this._onclick);
		this.target.removeEventListener('contextmenu', this._oncontextmenu);
		this.target.removeEventListener('pointerdown', this._onpointerdown);
		this.target.removeEventListener('pointerenter', this._onpointerenter);
		this.target.removeEventListener('pointerleave', this._onblur);
		this.target.removeEventListener('pointermove', this._onpointermove);
		this.target.removeEventListener('pointerup', this._onpointerup);
		this.target.removeEventListener('wheel', this._onwheel);
		window.removeEventListener('blur', this._onblur);
	}

	setTarget(target) {
		this.target !== null && this.close();
		Object.defineProperty(this, 'target', { value: target, enumerable: false });
		this._listen()
	}

	activate() { this.active = true }
	lock(options = {}) {
		return this.target.requestPointerLock(Object.assign({ unadjustedMovement: true }, arguments[0]));
	}

	async _click(event) {
		if (event.ctrlKey && event.shiftKey) {
			await this.lock();
		}

		this.emit('click', event);
	}

	_down(event) {
		this.activate();
		this.down = true;
		this.old.set(this.position);
		if (!this.locked) {
			this.rawPosition.set(new Coordinates(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio));
			this.position.set(this.rawPosition.toCanvas(this.target));
			this.target.setPointerCapture(event.pointerId);
		}

		this.emit('down', event);
	}

	_move(event) {
		this.activate();
		if (this.locked) {
			this.rawPosition.add(new Coordinates(event.movementX * window.devicePixelRatio, event.movementY * window.devicePixelRatio));
		} else {
			this.rawPosition.set(new Coordinates(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio));
		}

		this.position.set(this.rawPosition.toCanvas(this.target));
		this.emit('move', event);
	}

	_up(event) {
		this.activate();
		this.down = false;
		if (!this.locked) {
			this.rawPosition.set(new Coordinates(event.offsetX * window.devicePixelRatio, event.offsetY * window.devicePixelRatio));
			this.position.set(this.rawPosition.toCanvas(this.target));
			this.target.releasePointerCapture(event.pointerId);
		}

		this.emit('up', event);
	}

	_wheel(event) {
		this.activate();
		this.emit('wheel', event);
	}

	_contextmenu(event) {
		event.preventDefault();
		this.activate();
		this.emit('menu', event);
	}

	close() {
		this._unlisten();
		this.target = null
	}
}