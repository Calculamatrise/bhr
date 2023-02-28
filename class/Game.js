import RecursiveProxy from "./RecursiveProxy.js";
import Vector from "./Vector.js";
import Main from "./scenes/Main.js";
import Mouse from "./handler/Mouse.js";

export default class {
    accentColor = '#000000' // for themes
    lastFrame = null;
    lastTime = performance.now();
    progress = 0;
    ups = 25;
    settings = new RecursiveProxy(Object.assign({
        ap: false,
        theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }, JSON.parse(localStorage.getItem('bhr-settings')) ?? {}), {
        set() {
            Reflect.set(...arguments);
            localStorage.setItem('bhr-settings', JSON.stringify(this));
            return true;
        },
        deleteProperty() {
            Reflect.deleteProperty(...arguments);
            localStorage.setItem('bhr-settings', JSON.stringify(this));
            return true;
        }
    });

    get max() {
        return 1000 / this.ups;
    }

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.container = canvas.parentElement;

        this.mouse = new Mouse(canvas);
        this.mouse.on('mousedown', this.press.bind(this));
        this.mouse.on('mousemove', this.stroke.bind(this));
        this.mouse.on('mouseup', this.clip.bind(this));
        this.mouse.on('mousewheel', this.scroll.bind(this));

        document.addEventListener('keydown', this.keydown.bind(this));
        document.addEventListener('keyup', this.keyup.bind(this));

        window.addEventListener('resize', this.adjust.bind(canvas));
        window.dispatchEvent(new Event('resize'));

        let theme = document.querySelector('link#theme');
        if (this.settings.theme != 'dark') {
            theme.href = `styles/${this.settings.theme}.css`;
        }
    }

    adjust() {
        const style = getComputedStyle(this);
        this.setAttribute('height', parseFloat(style.height) * window.devicePixelRatio);
        this.setAttribute('width', parseFloat(style.width) * window.devicePixelRatio);
    }

    init(trackCode, { id = null, vehicle = 'BMX' } = {}) {
        if (trackCode === null) {
            return;
        } else if (!/^bmx|mtb$/i.test(vehicle)) {
            throw new TypeError("Invalid vehicle type.");
        }

        if (this.lastFrame) {
            this.close();
        }

        this.scene = new Main(this, {
            code: trackCode,
            id
        });

        this.scene.init(vehicle);
        this.lastFrame = requestAnimationFrame(this.render.bind(this));
    }

    render(time) {
        this.lastFrame = requestAnimationFrame(this.render.bind(this));
        this.delta = time - this.lastTime;
        // this.delta = Math.min(time - this.lastTime, this.max);
        if (this.delta < this.max) {
            // this.scene.update();
            this.scene.render(this.ctx);
            return;
        }

        this.scene.update(this.delta / this.max);
        this.scene.render(this.ctx);
        this.lastTime = time;
    }

    press(event) {
        this.scene.cameraLock = true;
        this.scene.cameraFocus = false;
        if (event.shiftKey || this.scene.processing) {
            return;
        }

        this.mouse.old.set(this.mouse.position);
        if (event.ctrlKey && this.scene.toolHandler.selected !== "select") {
            this.scene.toolHandler.setTool("select");
        } else if (!event.ctrlKey && this.scene.toolHandler.selected === "select") {
            this.scene.toolHandler.setTool(this.scene.toolHandler.old);
        }

        this.scene.toolHandler.press(event);
    }

    stroke(event) {
        if (this.scene.toolHandler.selected !== "camera") {
            this.scene.cameraFocus = false;
        }

        if (this.scene.processing) {
            return;
        } else if (event.shiftKey) {
            this.scene.toolHandler.cache.get("camera").stroke(event);
            return;
        }

        if (!new Set(["camera", "eraser", "select"]).has(this.scene.toolHandler.selected)) {
            this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
            this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
        }

        this.scene.toolHandler.stroke(event);
    }

    clip(event) {
        this.scene.cameraLock = false;
        if (this.scene.processing) {
            return;
        }

        this.scene.toolHandler.clip(event);
    }

    keydown(event) {
        event.preventDefault();
        switch(event.key.toLowerCase()) {
            case "backspace":
                if (event.shiftKey) {
                    this.scene.restoreCheckpoint();
                    break;
                }
    
                this.scene.removeCheckpoint();
                break;

            case "enter":
                this.scene.gotoCheckpoint();
                break;
    
            case ".":
                this.scene.restoreCheckpoint();
                break;

            case "tab":
                if (!this.scene.cameraFocus) {
                    this.scene.cameraFocus = this.scene.firstPlayer.vehicle.head;
                    break;
                }

                let index = this.scene.players.indexOf(this.scene.cameraFocus.parent.parent) + 1;
                if (this.scene.players.length <= index) {
                    index = 0;
                }

                this.scene.cameraFocus = this.scene.players[index].vehicle.head;
                break;
    
            case "-":
                this.scene.zoomOut();
                break;

            case "+":
            case "=":
                this.scene.zoomIn();
                break;

            case "z":
                if (this.scene.cameraFocus || !this.scene.editor) {
                    break;
                }

                if (event.ctrlKey) {
                    this.scene.history.redo();
                    break;
                }

                this.scene.history.undo();

                break;

            case "p":
            case " ":
                this.scene.paused = !this.scene.paused,
                this.container.querySelector("playpause")?.classList[this.scene.paused ? "remove" : "add"]("playing");
                break;
        }

        if (this.scene.editor) {    
            switch(event.key.toLowerCase()) {
                case "delete":
                    if (this.scene.toolHandler.selected !== "select" || this.scene.toolHandler.currentTool.selected.length < 1) {
                        break;
                    }

                    this.scene.toolHandler.currentTool.deleteSelected();
                    break;

                case "a":
                    this.scene.toolHandler.setTool("brush", false);
                    break;

                case "s":
                    this.scene.toolHandler.setTool("brush", true);
                    break;

                case "q":
                    this.scene.toolHandler.setTool("line", false);
                    break;

                case "w":
                    this.scene.toolHandler.setTool("line", true);
                    break;
    
                case "e":
                    this.scene.toolHandler.setTool("eraser");
                    break;

                case "r":
                    this.scene.toolHandler.setTool(this.scene.toolHandler.selected !== "camera" ? "camera" : this.scene.toolHandler.old);
                    break;
    
                case "m":
                    this.scene.history.undo();
                    break;

                case "n":
                    this.scene.history.redo();
                    break;
            }
        }
    }

    keyup(event) {
        switch (event.key.toLowerCase()) {
            case "b":
                if (!event.ctrlKey) {
                    break;
                }

                this.scene.switchBike();
                break;

            case "g":
                this.scene.players.length <= 1 && (this.scene.grid.size = 11 - this.scene.grid.size);
                break;

            case "f":
            case "f11":
                document.fullscreenElement ? document.exitFullscreen() : this.container.requestFullscreen();
                break;

            case "escape":
                let overlay = this.container.querySelector("game-overlay");
                if (overlay === null) {
                    break;
                }

                overlay.style.setProperty("display", overlay.style.display === "flex" ? (this.scene.paused = !1, "none") : (this.scene.paused = !0, "flex"));
                break;
        }
    }

    scroll(event) {
        if (event.ctrlKey) {
            this.scene.toolHandler.scroll(event);
        } else {
            if (0 < event.detail || event.wheelDelta < 0) {
                this.scene.zoomOut()
            } else if (0 > event.detail || event.wheelDelta > 0) {
                this.scene.zoomIn()
            }
        }

        let y = new Vector(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop + window.pageYOffset).toCanvas(this.canvas);
        this.scene.cameraFocus || this.scene.camera.add(this.mouse.position.difference(y));
    }

    load(code = null) {
        if (code === null) {
            this.loadFile();
            return;
        }

        this.init(code);
    }

    loadFile() {
        let reader = new FileReader();
        reader.addEventListener('load', () => this.init(this.result));

        let picker = document.createElement('input');
        picker.accept = "text/plain";
        picker.type = "file";
        picker.addEventListener("load", function() {
            reader.readAsText(this.files[0]);
        });

        picker.click();
    }

    saveAs() {
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([ game.scene.toString() ], { type: "text/plain" }));
        link.download = "bhr_track_" + new Date(new Date().setHours(new Date().getHours() - new Date().getTimezoneOffset() / 60)).toISOString().split(/t/i).join("_").replace(/\..+/, "").replace(/:/g, "-");
        link.click();
    }

    reset() {
        if (confirm("Do you really want to start a new track?")) {
            this.init("-18 1i 18 1i###BMX");
        }
    }

    close() {
        this.scene = null;
        this.mouse.close();

        window.removeEventListener('resize', this.adjust);

        cancelAnimationFrame(this.lastFrame);
    }
}