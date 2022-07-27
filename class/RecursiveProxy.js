export default class {
    constructor(target, handler) {
        return new Proxy(target, {
            ...handler,
            get(target, property) {
                let plain = JSON.parse(JSON.stringify(target));
                if (typeof plain[property] == "object" && plain[property] !== null) {
                    return new Proxy(target[property], this);
                }

                if (typeof handler.get == "function") {
                    return handler.get.apply(this, arguments);
                }

                return target[property];
            }
        })
    }
}