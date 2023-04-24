export default class extends Array {
	cache = []
	push() {
		this.cache.splice(0);
		return super.push(...arguments);
	}

	reset() {
		this.splice(0, this.length);
		this.cache.splice(0);
	}
}