export default class extends Array {
    cache = [];
    push(...args) {
        this.cache = [];
        
        super.push(...args);
    }
}