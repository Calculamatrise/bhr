import EventEmitter from "../EventEmitter.js";
import Vector from "../Vector.js";

export default class extends EventEmitter {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.canvas.addEventListener("click", this.click.bind(this));
		this.canvas.addEventListener("mousedown", this.mousedown.bind(this));
        this.canvas.addEventListener("mousemove", this.mousemove.bind(this));
		this.canvas.addEventListener("mouseup", this.mouseup.bind(this));
        this.canvas.addEventListener("mousewheel", this.mousewheel.bind(this));
        this.canvas.addEventListener("contextmenu", this.preventDefault);
    }
    down = false;
    old = new Vector();
    position = new Vector();
    click(event) {
        event.preventDefault();
		this.emit("click", event);
    }

	mousedown(event) {
		event.preventDefault();
        this.down = true;
        this.emit("mousedown", event);
        this.old.set(this.position);
	}

    mousemove(event) {
        event.preventDefault();
        this.position.set(new Vector(event.offsetX, event.offsetY).toCanvas(this.canvas));
        this.emit("mousemove", event);
    }

	mouseup(event) {
		event.preventDefault();
        this.down = false;
        this.emit("mouseup", event);
	}

    mousewheel(event) {
        event.preventDefault();
        this.emit("mousewheel", event);
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