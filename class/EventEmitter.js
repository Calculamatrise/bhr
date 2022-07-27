export default class {
    #events = new Map();

    /**
     * 
     * @param {String} event 
     * @param {Function} listener 
     * @returns {Number}
     */
    on(event, listener) {
        if (typeof event != "string") {
            throw new TypeError("Event must be of type: String.");
        } else if (typeof listener != "function") {
            throw new TypeError("Listener must be of type: Function.");
        }

        if (!this.#events.has(event)) {
            this.#events.set(event, new Set());
        }

        let events = this.#events.get(event);
        events.add(listener);
		return events.length;
	}

    /**
     * 
     * @param {String} event 
     * @param {Function} listener 
     * @returns {Function}
     */
    once(event, listener) {
        if (typeof event != "string") {
            throw new TypeError("Event must be of type: String.");
        }

        return this.on(event + "_once", listener);
    }

    /**
     * 
     * @private
     * @param {String} event 
     * @param  {...any} args 
     */
    emit(event, ...args) {
        let listeners = this.#events.get(event) || [];
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
     * @param {String} event 
     * @param {Function} listener 
     * @returns {Boolean}
     */
    removeListener(event, listener) {
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
}