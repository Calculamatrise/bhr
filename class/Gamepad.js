import EventEmitter from "./EventEmitter.js";

export default class extends EventEmitter {
    constructor(parent) {
        super();

        this.parent = parent;
    }

    downKeys = new Map();
    #records = Array.from({ length: 5 }, () => ({}));

    get records() {
        return this.#records;
    }

    init() {
        window.addEventListener("keydown", this.keydown.bind(this));
		window.addEventListener("keyup", this.keyup.bind(this));
    }

    key(event) {
        switch(event.key.toLowerCase()) {
            case "a":
            case "arrowleft":
                return 0;
            
            case "d":
            case "arrowright":
                return 1;

            case "w":
            case "arrowup":
                return 2;

            case "s":
            case "arrowdown":
                return 3;

            case "z":
                return 4;

            default:
                return null;
        }
    }

	keydown(event) {
		event.preventDefault();

        const key = this.key(event);

        if (this.downKeys.has(event.key)) {
            return;
        }

        this.downKeys.set(event.key, true);

        if (this.#records.hasOwnProperty(key)) {
            this.#records[key][this.parent.track.currentTime] = 1;
        }

		return this.emit("keydown", event.key);
	}

	keyup(event) {
		event.preventDefault();

        const key = this.key(event);

        this.downKeys.delete(event.key);

        if (this.#records.hasOwnProperty(key)) {
            this.#records[key][this.parent.track.currentTime] = 1;
        }

		return this.emit("keyup", event.key);
	}

    snapshot() {
        return this.#records.map(records => ({...records}));
    }

    restore(records) {
        this.#records = records.map(records => ({...records}));
    }

    reset() {
        this.downKeys = new Map();
        this.#records = Array.from({ length: 5 }, () => ({}));
    }
    
    close() {
        window.removeEventListener("keydown", this.keydown.bind(this));
		window.removeEventListener("keyup", this.keyup.bind(this));
    }
}