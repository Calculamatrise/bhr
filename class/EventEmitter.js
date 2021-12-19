export default class {
    #events = new Map();

    /**
     * 
     * @private
     * @param {String} event event name
     * @param  {...any} args arguments
     * @returns function call
     */
    emit(event, ...args) {
        if (this.#events.has(event)) {
            return !!this.#events.get(event)(...args);
        }

        return null;
    }

    /**
     * 
     * @private
     * @param {String} event event name
     * @param {Function} listener event listener
     * @returns {Boolean}
     */
    on(event, listener = function() {}) {
        if (typeof event !== "string") {
            throw new Error("Invalid event.");
        } else if (typeof listener !== "function") {
            throw new Error("Invalid listener.");
        }
        
		return !!this.#events.set(event, listener);
	}
}