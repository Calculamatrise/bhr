export default class extends Array {
	cache = []
	clear() {
		super.splice(0);
		this.cache.splice(0)
	}

	push() {
		return this.cache.splice(0),
		super.push(...arguments)
	}
}