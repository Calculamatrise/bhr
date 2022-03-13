import Mouse from "./handler/Mouse.js";

import Main from "./scenes/Main.js";

import Vector from "./Vector.js";

export default class {
    constructor(canvas) {
        this.canvas = canvas;

        this.ctx = this.canvas.getContext("2d");
        this.container = this.canvas.parentElement;
        
        window.addEventListener("resize", this.adjust.bind(this.canvas));
        this.adjust.call(this.canvas);

        this.mouse = new Mouse(this.canvas);
        this.mouse.on("mouseover", this.initCursor.bind(this));
        this.mouse.on("mousedown", this.press.bind(this));
        this.mouse.on("mousemove", this.stroke.bind(this));
        this.mouse.on("mouseup", this.clip.bind(this));
        this.mouse.on("mousewheel", this.scroll.bind(this));

        document.addEventListener("keydown", this.keydown.bind(this));
        document.addEventListener("keyup", this.keyup.bind(this));
    }
    fps = 25;
    ups = 50;
    lastTime = -1;
    lastFrame = null;
    progress = 0;
    get theme() {
        const theme = localStorage.getItem("theme");
        if (theme === null) {
            return localStorage.setItem("theme", window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"), this.theme;
        }

        return theme;
    }

    get settings() {
        let settings; this.settings = {};
        return settings = new Proxy(JSON.parse(localStorage.getItem("bhr-settings")), {
            get(target, key) {
                if (typeof target[key] === "object" && target[key] !== null) {
                    return new Proxy(target[key], this);
                }

                return target[key];
            },
            set(object, property, value) {
                object[property] = value;

                return localStorage.setItem("bhr-settings", JSON.stringify(settings)), true;
            }
        });
    }

    set settings(value) {
        localStorage.setItem("bhr-settings", JSON.stringify(Object.assign({
            ap: false,
            theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        }, Object.assign(JSON.parse(localStorage.getItem("bhr-settings")) ?? {}, value ?? {}))));
    }

    adjust() {
        this.setAttribute("height", parseFloat(getComputedStyle(this).height) * window.devicePixelRatio);
        this.setAttribute("width", parseFloat(getComputedStyle(this).width) * window.devicePixelRatio);
    }

    init(trackCode, { id = null, vehicle = "BMX" } = {}) {
        if (trackCode === null) {
            return;
        }

        if (typeof vehicle !== "string" || !["BMX", "MTB"].includes(vehicle.toUpperCase())) {
            throw new Error("Invalid vehicle type.");
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

    initCursor() {
        if (this.scene)
            this.scene.displayText = false;

        this.canvas.style.cursor = this.scene.toolHandler.selected === "camera" ? "move" : "none";
    }

    render(time) {
        this.lastFrame = requestAnimationFrame(this.render.bind(this));

        const delta = time - this.lastTime;
        // const delta = Math.min(time - this.lastTime, 1000 / this.ups);
        if (delta < 1000 / this.fps) {
            // this.scene.update(delta / (1000 / this.ups));
            this.scene.render(this.ctx);
            return;
        }

        this.scene.update(delta / (1000 / this.ups));
        this.scene.render(this.ctx);
        this.lastTime = time;
    }

    press(event) {
        this.scene.cameraLock = true;
        this.scene.cameraFocus = false;
        this.mouse.old.copy(this.mouse.position);
        if (event.shiftKey || event.ctrlKey || this.scene.processing) {
            return;
        }

        if (!event.ctrlKey && this.scene.toolHandler.selected === "select") {
            this.scene.toolHandler.setTool(this.scene.toolHandler.old);
        }

        this.scene.toolHandler.press(event);
    }

    stroke(event) {
        if (this.scene.toolHandler.selected !== "camera") {
            this.scene.cameraFocus = false;
        }

        if (this.scene.toolHandler.selected !== "eraser" && event.button !== 2) {
            this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.grid.size) * this.scene.grid.size;
            this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.grid.size) * this.scene.grid.size;
        }

        if (this.scene.processing) {
            return;
        } else if (event.shiftKey) {
            this.scene.toolHandler.cache.get("camera").stroke(event);
            return;
        } else if (event.ctrlKey && this.scene.toolHandler.selected !== "select") {
            this.scene.toolHandler.setTool("select");
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
                this.scene.paused = this.settings.ap ? true : !this.scene.paused,
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

        let y = new Vector(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop + window.pageYOffset).toCanvas();
        this.scene.cameraFocus || this.scene.camera.addToSelf(this.mouse.position.sub(y))
    }

    load(code = null) {
        if (code === null) {
            this.loadFile();
            return;
        }

        this.init(code.value);
    }

    loadFile() {
        let reader = new FileReader();
        reader.addEventListener('load', () => {
            this.init(this.result);
        });

        let picker = document.createElement('input');
        picker.accept = "text/plain";
        picker.type = "file";
        picker.addEventListener("load", function() {
            reader.readAsText(this.files[0]);
        });

        picker.click();
    }

    saveAs() {
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(new Blob([ game.scene.toString() ], { type: "text/plain" }));
        link.download = "bhr_track_" + new Date(new Date().setHours(new Date().getHours() - new Date().getTimezoneOffset() / 60)).toISOString().split(/t/i).join("_").replace(/\..+/, "").replace(/:/g, "-");
        link.click();
    }

    reset() {
        if (!confirm("Do you really want to start a new track?")) {
            return;
        }

        this.init("-18 1i 18 1i###BMX");
    }

    close() {
        this.scene = null;
        this.mouse.close();

        window.removeEventListener("resize", this.adjust);

        cancelAnimationFrame(this.lastFrame);
    }
}