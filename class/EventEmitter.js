export default class {
    /** @private */
    #events = new Map();

    /**
     * 
     * @private
     * @param {String} event 
     * @param  {...any} [args] 
     */
    emit(event, ...args) {
        let listeners = Array.from(this.#events.get(event) || []);
        if (typeof this["on" + event] == "function") {
            listeners.push(this["on" + event]);
        }

        let unique = this.#events.get(event + "_once");
        if (unique !== void 0) {
            listeners.push(...unique);
            this.#events.delete(event + "_once");
        }

        new Set(listeners).forEach(listener => listener.apply(this, args));
    }

    /**
     * 
     * @private
     * @param {Array<String>} events 
     * @param {...any} [args] 
     */
    emits(events, ...args) {
        if (!(events instanceof Array)) {
            throw new TypeError("Events must be of type: Array<String>");
        }

        events.forEach(event => this.emit(event, ...args));
    }

    /**
     * 
     * @param {String} event 
     * @param {Function} listener 
     * @returns {Number}
     */
    on(event, listener) {
        if (typeof event != "string") {
            throw new TypeError("Event must be of type: String");
        } else if (typeof listener != "function") {
            throw new TypeError("Listener must be of type: Function");
        }

        if (!this.#events.has(event)) {
            this.#events.set(event, new Set());
        }

        let events = this.#events.get(event);
		return events.add(listener),
        events.length;
	}

    /**
     * 
     * @param {String} event 
     * @param {Function} listener 
     * @returns {Function}
     */
    once(event, listener) {
        if (typeof event != "string") {
            throw new TypeError("Event must be of type: String");
        }

        return this.on(event + "_once", listener);
    }

    /**
     * 
     * @param {String} event 
     * @returns {Set}
     */
    listeners(event) {
        return this.#events.get(event) || new Set();
    }

    /**
     * 
     * @param {String} event 
     * @returns {Number}
     */
    listenerCount() {
        return this.listeners().size;
    }

    /**
     * 
     * @param {String} event 
     * @param {Function} listener 
     * @returns {Boolean}
     */
    removeListener(event, listener) {
        if (typeof event != "string") {
            throw new TypeError("Event must be of type: String");
        }

        let listeners = this.#events.get(event);
        if (listeners !== void 0) {
            listeners.delete(listener);
        }

        let unique = this.#events.get(event + "_once");
        if (unique !== void 0) {
            unique.delete(listener);
        }

        return true;
    }

    /**
     * 
     * @param {String} event 
     * @returns {Boolean}
     */
    removeAllListeners(event) {
        if (typeof event != "string") {
            throw new TypeError("Event must be of type: String");
        }

        return this.#events.delete(event);
    }
}