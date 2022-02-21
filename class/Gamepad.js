export default class {
    constructor(parent) {
        this.parent = parent;
    }
    downKeys = new Set();
    init() {
        window.addEventListener("keydown", this.keydown.bind(this));
        window.addEventListener("keyup", this.keyup.bind(this));
    }

    mask(key) {
        switch(key.toLowerCase()) {
            case "a":
            case "arrowleft":
                return "left";
            
            case "d":
            case "arrowright":
                return "right";

            case "w":
            case "arrowup":
                return "up";

            case "s":
            case "arrowdown":
                return "down";

            case "z":
                return "z";

            default:
                return null;
        }
    }

	keydown(event) {
		event.preventDefault();
        
        const key = this.mask(event.key);
        if (key === null) {
            return;
        }

        if (this.downKeys.has(key)) {
            return;
        }

        this.downKeys.add(key);
        this.parent.updateRecords(key);
	}

	keyup(event) {
		event.preventDefault();

        const key = this.mask(event.key);
        if (key === null) {
            return;
        }
        
        this.downKeys.delete(key);
        this.parent.updateRecords(key);
	}

    toggle(key) {
        if (this.downKeys.delete(key)) {
            return;
        }

        this.downKeys.add(key);
    }
    
    close() {
        window.removeEventListener("keydown", this.keydown.bind(this));
		window.removeEventListener("keyup", this.keyup.bind(this));
    }
}