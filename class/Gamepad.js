import EventEmitter from "./EventEmitter.js";

export default class extends EventEmitter {
    constructor(parent) {
        super();

        this.parent = parent;
    }

    downKeys = new Set();
    pendingKeys = new Set();
    pendingDownKeys = new Set();
    #records = Array.from({ length: 5 }, () => ({}));
    get records() {
        return this.#records;
    }

    init() {
        window.addEventListener("keydown", this.keydown.bind(this));
		window.addEventListener("keyup", this.keyup.bind(this));
    }

    key({ key } = {}) {
        switch((typeof arguments[0] === "string" ? arguments[0] : key).toLowerCase()) {
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

        if (this.downKeys.has(event.key)) {
            return;
        }

        this.downKeys.add(event.key);

        const key = this.key(event);
        if (this.#records.hasOwnProperty(key)) {
            if (this.parent.scene.paused) {
                !this.pendingKeys.has(event.key) && this.pendingDownKeys.add(event.key);
            } else {
                this.#records[key][this.parent.scene.currentTime] = 1;
            }
        }

        // if (this.parent.scene.paused) {
        //     return;
        // }

		return this.emit("keydown", event.key);
	}

	keyup(event) {
		event.preventDefault();

        this.downKeys.delete(event.key);

        const key = this.key(event);
        if (this.#records.hasOwnProperty(key)) {
            if (this.parent.scene.paused) {
                !this.pendingDownKeys.has(event.key) && this.pendingKeys.add(event.key);
            } else {
                this.#records[key][this.parent.scene.currentTime] = 1;
            }
        }

        // if (this.parent.scene.paused) {
        //     return;
        // }

		return this.emit("keyup", event.key);
	}

    record() {
        for (const key of this.pendingDownKeys) {
            if (this.downKeys.has(key)) {
                this.#records[this.key({ key })][this.parent.scene.currentTime] = 1;
            }
        }

        for (const key of this.pendingKeys) {
            if (!this.downKeys.has(key)) {
                this.#records[this.key({ key })][this.parent.scene.currentTime] = 1;
            }
        }
        
        this.pendingDownKeys.clear();
        this.pendingKeys.clear();
    }

    snapshot() {
        return [...this.#records.map(records => ({...records}))];
    }

    restore(records) {
        this.#records = [...records.map(records => ({...records}))];
    }

    reset() {
        this.#records = Array.from({ length: 5 }, () => ({}));
    }
    
    close() {
        window.removeEventListener("keydown", this.keydown.bind(this));
		window.removeEventListener("keyup", this.keyup.bind(this));
    }
}