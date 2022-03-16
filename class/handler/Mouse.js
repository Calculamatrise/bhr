import EventEmitter from "../EventEmitter.js";
import Vector from "../Vector.js";

export default class extends EventEmitter {
    constructor(canvas) {
        super();

        this.canvas = canvas;

        this.down = false;
        this.position = new Vector();

        this.canvas.addEventListener("click", this.click.bind(this));
        this.canvas.addEventListener("mouseover", this.mouseover.bind(this));
		this.canvas.addEventListener("mousedown", this.mousedown.bind(this));
        this.canvas.addEventListener("mousemove", this.mousemove.bind(this));
		this.canvas.addEventListener("mouseup", this.mouseup.bind(this));
        this.canvas.addEventListener("mousewheel", this.mousewheel.bind(this));
        this.canvas.addEventListener("contextmenu", this.preventDefault);
    }
    old = new Vector();
    get real() {
        return this.position.toPixel();
    }

    click(event) {
        event.preventDefault();
		
		return this.emit("click", event);
    }

    mouseover(event) {
        event.preventDefault();

        return this.emit("mouseover", event);
    }

	mousedown(event) {
		event.preventDefault();

        this.down = true;

        this.emit("mousedown", event);
        this.old.set(this.position);

        return this.down;
	}

    mousemove(event) {
        event.preventDefault();

        this.position.set(new Vector(event.offsetX, event.offsetY).toCanvas(this.canvas));

        return this.emit("mousemove", event);
    }

	mouseup(event) {
		event.preventDefault();

        this.down = false;
		
		return this.emit("mouseup", event);
	}

    mousewheel(event) {
        event.preventDefault();
        
        return this.emit("mousewheel", event);
    }

    preventDefault(event) {
        event.preventDefault();
    }
    
    close() {
        this.canvas.removeEventListener("click", this.click);
        this.canvas.removeEventListener("mousedown", this.mousedown);
        this.canvas.removeEventListener("mousemove", this.mousemove);
		this.canvas.removeEventListener("mouseup", this.mouseup);
        this.canvas.removeEventListener("mousewheel", this.mousewheel);
        this.canvas.removeEventListener("contextmenu", this.preventDefault);
    }
}