export default class {
    constructor(parent) {
        this.parent = parent;

        this.downKeys = new Map();
    }
    #events = new Map();
    #records = [
        {},
        {},
        {},
        {},
        {}
    ]
    get records() {
        return this.#records;
    }
    #emit(event, ...args) {
        if (this.#events.has(event))
            return !!this.#events.get(event)(...args);

        return null;
    }
    on(event, func = function() {}) {
		return !!this.#events.set(event, func);
	}
    init() {
        window.addEventListener("keydown", this.keydown.bind(this));
        window.addEventListener("keypress", this.keypress.bind(this));
		window.addEventListener("keyup", this.keyup.bind(this));
    }
	keydown(event) {
		event.preventDefault();

        const key = event.key.replace(/^(arrowleft|a)$/gi, 0)
            .replace(/^(arrowright|d)$/gi, 1)
            .replace(/^(arrowup|w)$/gi, 2)
            .replace(/^(arrowdown|s)$/gi, 3)
            .replace(/^z$/gi, 4);

        if (this.downKeys.has(event.key))
            return;

        this.downKeys.set(event.key, true);

        if (this.#records.hasOwnProperty(key.toLowerCase()))
            this.#records[key.toLowerCase()][this.parent.track.currentTime] = 1;

		return this.#emit("keydown", event.key);
	}
    keypress(event) {
        event.preventDefault();
        
        return this.#emit("keypress", event.key, event.keyCode);
    }
	keyup(event) {
		event.preventDefault();

        const key = event.key.replace(/^(arrowleft|a)$/gi, 0)
            .replace(/^(arrowright|d)$/gi, 1)
            .replace(/^(arrowup|w)$/gi, 2)
            .replace(/^(arrowdown|s)$/gi, 3)
            .replace(/^z$/gi, 4);

        this.downKeys.delete(event.key);

        if (this.#records.hasOwnProperty(key.toLowerCase()))
            this.#records[key.toLowerCase()][this.parent.track.currentTime] = 1;
		
		return this.#emit("keyup", event.key);
	}
    snapshot() {
        return this.records;
    }
    restore(records) {
        if (typeof records !== "object")
            return null;
            
        this.#records = records;
    }
    reset() {
        this.downKeys = new Map();
        this.#records = [
            {},
            {},
            {},
            {},
            {}
        ]
    }
    close() {
        window.removeEventListener("keydown", this.keydown.bind(this));
        window.removeEventListener("keypress", this.keypress.bind(this));
		window.removeEventListener("keyup", this.keyup.bind(this));
    }
}