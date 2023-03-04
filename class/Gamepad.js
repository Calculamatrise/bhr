import EventEmitter from "./EventEmitter.js";

export default class extends EventEmitter {
	downKeys = new Set();
	init() {
		window.addEventListener('blur', this.blur.bind(this));
		window.addEventListener('keydown', this.down.bind(this));
		window.addEventListener('keyup', this.up.bind(this));
	}

	blur() {
		this.downKeys.clear();
	}

	down(event) {
		event.preventDefault();
		let key = this.constructor.mask(event.key);
		if (key === null || this.downKeys.has(key)) {
			return;
		}

		this.downKeys.add(key);
		this.emit('down', key);
	}

	up(event) {
		event.preventDefault();
		let key = this.constructor.mask(event.key);
		if (key === null) {
			return;
		}

		this.downKeys.delete(key);
		this.emit('up', key);
	}

	toggle(key) {
		if (this.downKeys.delete(key)) {
			return;
		}

		this.downKeys.add(key);
	}

	close() {
		window.removeEventListener('blur', this.blur.bind(this));
		window.removeEventListener('keydown', this.down.bind(this));
		window.removeEventListener('keyup', this.up.bind(this));
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
				return null;
		}
	}
}