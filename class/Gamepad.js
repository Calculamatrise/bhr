import EventEmitter from "./EventEmitter.js";

export default class extends EventEmitter {
	downKeys = new Set();
	constructor(parent) {
		super();
		this.parent = parent;
	}

	init() {
		window.addEventListener('keydown', this.down.bind(this));
		window.addEventListener('keyup', this.up.bind(this));
	}

	mask(key) {
		switch(key.toLowerCase()) {
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

	down(event) {
		event.preventDefault();
		let key = this.mask(event.key);
		if (key === null || this.downKeys.has(key)) {
			return;
		}

		this.downKeys.add(key);
		this.emit('down', key);
		this.parent.updateRecords(key);
	}

	up(event) {
		event.preventDefault();
		let key = this.mask(event.key);
		if (key === null) {
			return;
		}

		this.downKeys.delete(key);
		this.emit('up', key);
		this.parent.updateRecords(key);
	}

	toggle(key) {
		if (this.downKeys.delete(key)) {
			return;
		}

		this.downKeys.add(key);
	}

	close() {
		window.removeEventListener('keydown', this.keydown.bind(this));
		window.removeEventListener('keyup', this.keyup.bind(this));
	}
}