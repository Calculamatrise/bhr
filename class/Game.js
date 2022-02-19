import Mouse from "./handler/Mouse.js";

import Main from "./scenes/Main.js";

import Vector from "./Vector.js";
import Target from "./item/Target.js";
import Checkpoint from "./item/Checkpoint.js";
import Bomb from "./item/Bomb.js";
import Boost from "./item/Boost.js";
import Gravity from "./item/Gravity.js";
import Antigravity from "./item/Antigravity.js";
import Slowmo from "./item/Slowmo.js";
import Teleporter from "./item/Teleporter.js";

export default class {
    constructor(canvas) {
        this.canvas = canvas;

        this.ctx = this.canvas.getContext("2d");
        this.container = this.canvas.parentElement;
        
        window.addEventListener("resize", this.adjust.bind(this.canvas));
        this.adjust.bind(this.canvas)();

        this.mouse = new Mouse(this.canvas);
        this.mouse.on("mouseover", this.initCursor.bind(this));
        this.mouse.on("mousedown", this.mouseDown.bind(this));
        this.mouse.on("mousemove", this.mouseMove.bind(this));
        this.mouse.on("mouseup", this.mouseUp.bind(this));
        this.mouse.on("mousewheel", this.scroll.bind(this));
    }

    fps = 25;
    lastTime = -1;
    lastFrame = null;
    progress = 0;
    get theme() {
        return localStorage.getItem("theme");
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

        this.scene.init([
            {
                vehicle: "BMX"
            }
        ]);
        
        this.lastFrame = requestAnimationFrame(this.render.bind(this));
    }

    initCursor() {
        if (this.scene)
            this.scene.displayText = false;

        this.canvas.style.cursor = this.scene.toolHandler.selected === "camera" ? "move" : "none";
    }

    render(time) {
        this.lastFrame = requestAnimationFrame(this.render.bind(this));
        this.delta = time - this.lastTime;
        if (this.delta < 1000 / this.fps) {
            this.scene.render(this.ctx);

            return;
        }


        this.scene.update(this.delta / (1000 / this.fps));
        this.scene.render(this.ctx);
        this.lastTime = time;
    }

    mouseDown(event) {
        this.scene.cameraLock = true;
        this.scene.cameraFocus = false;
        if (event.button === 2 && this.scene.toolHandler.selected !== "camera") {
            //this.scene.erase(this.mouse.position);
            return;
        } else if (this.scene.firstPlayer.gamepad.downKeys.has("q") && this.scene.toolHandler.selected === "line" && !this.scene.toolHandler.currentTool.scenery) {
            this.scene.addLine(this.mouse.old, this.mouse.position, false);
        } else {
            let x;
            this.mouse.old.copy(this.mouse.position);
            switch (this.scene.toolHandler.selected) {
                case "boost":
                case "gravity":
                    this.canvas.style.cursor = "crosshair";
                    break;
                    
                case "eraser":
                    this.scene.erase(this.mouse.position);
                    break;

                case "goal":
                    x = new Target(this.scene, this.mouse.old.x,this.mouse.old.y);
                    this.scene.targets++;
                    break;

                case "checkpoint":
                    x = new Checkpoint(this.scene, this.mouse.old.x,this.mouse.old.y);
                    break;

                case "bomb":
                    x = new Bomb(this.scene, this.mouse.old.x,this.mouse.old.y);
                    break;

                case "slow-mo":
                    x = new Slowmo(this.scene, this.mouse.old.x,this.mouse.old.y);
                    break;
                    
                case "antigravity":
                    x = new Antigravity(this.scene, this.mouse.old.x,this.mouse.old.y);
                    break;

                case "teleporter":
                    x = new Teleporter(this.scene, this.mouse.old.x,this.mouse.old.y);
                    this.scene.teleporter = x;
                    break;

                case "brush":
                case "scenery brush":
                    this.scene.addLine(this.mouse.old, this.mouse.position, this.scene.toolHandler.currentTool.scenery);
                    this.scene.cameraLock = true;
                    break;
            }
            
            if (x !== void 0) {
                let c = Math.floor(x.position.x / this.scene.grid.scale);
                let d = Math.floor(x.position.y / this.scene.grid.scale);
                this.scene.grid.sector(c, d, true).powerups.push(x);
            }
        }
    }

    mouseMove(event) {
        if (this.scene.toolHandler.selected !== "camera") {
            this.scene.cameraFocus = false;
        }

        if (this.scene.toolHandler.selected !== "eraser") {
            if (event.button !== 2) {
                this.mouse.position.x = Math.round(this.mouse.position.x / this.scene.gridSize) * this.scene.gridSize;
                this.mouse.position.y = Math.round(this.mouse.position.y / this.scene.gridSize) * this.scene.gridSize;
            }
        }

        if (this.scene.cameraLock) {
            switch(this.scene.toolHandler.selected) {
                case "brush":
                    this.mouse.old.distanceTo(this.mouse.position) >= this.scene.toolHandler.currentTool.length && this.scene.addLine(this.mouse.old, this.mouse.position, this.scene.toolHandler.currentTool.scenery);
                    break;

                case "camera":
                    this.scene.camera.addToSelf(this.mouse.old.sub(this.mouse.position)),
                    this.mouse.position.copy(this.mouse.old);
                    break;

                case "eraser":
                    this.scene.erase(this.mouse.position);
                    break;
            }
        }

        this.canvas.style.cursor = this.scene.toolHandler.selected == "camera" ? "move" : ["boost", "gravity"].includes(this.scene.toolHandler.selected) ? "crosshair" : "none";

    }

    mouseUp(event) {
        if (!event.ctrlKey)
            this.scene.cameraLock = false;

        //if (this.scene.cameraLock) {
            if (["line", "brush"].includes(this.scene.toolHandler.selected)) {
                this.scene.addLine(this.mouse.old, this.mouse.position, this.scene.toolHandler.currentTool.scenery);
            } else if ("teleporter" === this.scene.toolHandler.selected) {
                this.mouse.old.copy(this.mouse.position);
                if (this.scene.teleporter) {
                    if (this.scene.teleporter.position.distanceTo(this.mouse.old) > 40) {
                        this.scene.teleporter.createAlt(this.mouse.old.x, this.mouse.old.y);
                    
                        let x = Math.floor(this.scene.teleporter.alt.x / this.scene.grid.scale);
                        let y = Math.floor(this.scene.teleporter.alt.y / this.scene.grid.scale);
                        this.scene.grid.sector(x, y, true).powerups.push(this.scene.teleporter);
                    } else {
                        this.scene.teleporter.remove();
                    }
                    
                    delete this.scene.teleporter;
                }
            } else if (this.canvas.style.cursor === "crosshair" && ["boost", "gravity"].includes(this.scene.toolHandler.selected)) {
                this.canvas.style.cursor = "none";

                let d = Math.round(180 * Math.atan2(-(this.mouse.position.x - this.mouse.old.x), this.mouse.position.y - this.mouse.old.y) / Math.PI);
                let c = this.scene.toolHandler.selected === "boost" ? new Boost(this.scene, this.mouse.old.x,this.mouse.old.y,d) : new Gravity(this.scene, this.mouse.old.x,this.mouse.old.y,d);
                let x = Math.floor(c.position.x / this.scene.grid.scale);
                let y = Math.floor(c.position.y / this.scene.grid.scale);
                this.scene.grid.sector(x, y, true).powerups.push(c);
            }
        //}
    }

    scroll(event) {
        if (event.ctrlKey) {
            if ("eraser" === this.scene.toolHandler.selected) {
                if ((0 < event.detail || 0 > event.wheelDelta) && 5 < this.scene.toolHandler.currentTool.size) {
                    this.scene.toolHandler.currentTool.size -= 5;
                } else {
                    if ((0 > event.detail || 0 < event.wheelDelta) && 40 > this.scene.toolHandler.currentTool.size) {
                        this.scene.toolHandler.currentTool.size += 5
                    }
                }
            } else {
                if ("brush" === this.scene.toolHandler.selected || "scenery brush" === this.scene.toolHandler.selected) {
                    if ((0 < event.detail || 0 > event.wheelDelta) && 4 < this.scene.toolHandler.currentTool.length) {
                        this.scene.toolHandler.currentTool.length -= 8;
                    } else if ((0 > event.detail || 0 < event.wheelDelta) && 200 > this.scene.toolHandler.currentTool.length) {
                        this.scene.toolHandler.currentTool.length += 8;
                    }
                }
            }
        } else {
            if (0 < event.detail || 0 > event.wheelDelta) {
                this.scene.zoomOut()
            } else if (0 > event.detail || 0 < event.wheelDelta) {
                this.scene.zoomIn()
            }
        }

        let y = new Vector(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop + window.pageYOffset).toCanvas();
        this.scene.cameraFocus || this.scene.camera.addToSelf(this.mouse.position.sub(y))
    }

    load(code = null) {
        if (code) {
            let t = this.scene.editor;
            this.close();
            this.init(code.value);
            document.querySelector("#charcount").innerHTML = "Trackcode";
            code.value = null;
            this.scene.editor = t;

            return;
        }

        this.canvas.style.display = "block";
        document.querySelector("#track_menu").style.display = "none";
        code = document.querySelector("#trackcode");
        if (code.value.includes("#")) {
            let t = this.scene.editor;
            this.close();
            this.init(code.value);
            document.querySelector("#charcount").innerHTML = "Trackcode";
            code.value = null;
            this.scene.editor = t;
        } else {
            alert("No trackcode to load!");
            this.canvas.style.display = "none";
            document.getElementById("track_menu").style.display = "block";
        }
    }

    save() {
        if (this.scene.id === void 0) {
            const date = new Date();
            !function(t, e) {
                if (typeof navigator.msSaveBlob == "function")
                    return navigator.msSaveBlob(t, e);

                let saver = document.createElementNS("http://www.w3.org/2000/svg", "a");
                saver.href = URL.createObjectURL(t);
                saver.download = e;
                document.body.appendChild(saver);
                saver.dispatchEvent(new MouseEvent("click"));
                document.body.removeChild(saver);
                URL.revokeObjectURL(saver.href);
            }(new Blob([this.scene.toString()], { type: "txt" }), `black_hat_rider_${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`);
        }
    }

    reset() {
        if (confirm("Do you really want to start a new track?")) {
            this.close();
            this.init("-18 1i 18 1i###BMX");
            document.querySelector("textarea#code").value = null;
        }
    }

    close() {
        this.scene = null;

        this.mouse.close();

        window.removeEventListener("resize", this.adjust);

        cancelAnimationFrame(this.lastFrame);
    }
}