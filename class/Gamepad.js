import EventEmitter from "./EventEmitter.js";

export default class extends EventEmitter {
	downKeys = new Set();
	// keymap?
	_listen() {
		Object.defineProperties(this, {
			_onblur: { value: this.blur.bind(this), writable: true },
			_onkeydown: { value: this.down.bind(this), writable: true },
			_onkeyup: { value: this.up.bind(this), writable: true }
		});
		window.addEventListener('blur', this._onblur, { passive: true });
		window.addEventListener('keydown', this._onkeydown);
		window.addEventListener('keyup', this._onkeyup)
	}

	_unlisten() {
		window.removeEventListener('blur', this._onblur);
		window.removeEventListener('keydown', this._onkeydown);
		window.removeEventListener('keyup', this._onkeyup)
	}

	blur() { this.downKeys.clear() }
	down(event) {
		let key = this.constructor.mask(event.key);
		if (key === null || this.downKeys.has(key)) return;
		event.preventDefault();
		this.downKeys.add(key);
		this.emit('down', key);
	}

	up(event) {
		let key = this.constructor.mask(event.key);
		if (key === null) return;
		event.preventDefault();
		this.downKeys.delete(key);
		this.emit('up', key)
	}

	toggle(key) {
		this.downKeys.delete(key) || this.downKeys.add(key)
	}

	close() {
		this._unlisten();
		this.onblur = null;
		this.onkeydown = null;
		this.onkeyup = null
	}

	static mask(key) {
		switch (key.toLowerCase()) {
		case 'a':
		case 'arrowleft':
			return 'left';
		case 'd':
		case 'arrowright':
			return 'right';
		case 'w':
		case 'arrowup':
			return 'up';
		case 's':
		case 'arrowdown':
			return 'down';
		case 'z':
			return 'z';
		default:
			return null
		}
	}
}