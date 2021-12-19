export default class extends Array {
    cache = [];
    push(...args) {
        this.cache.splice(0, this.cache.length);
        
        super.push(...args);
    }

    reset() {
        this.splice(0, this.length);
        
        this.cache.splice(0, this.cache.length);
    }
}