import Mouse from "./handler/Mouse.js";

import Track from "./track/Track.js";
import Player from "./Player.js";

import Vector from "./Vector.js";
import Sector from "./sector/Sector.js";
import Target from "./item/Target.js";
import Checkpoint from "./item/Checkpoint.js";
import Bomb from "./item/Bomb.js";
import Boost from "./item/Boost.js";
import Gravity from "./item/Gravity.js";
import Antigravity from "./item/Antigravity.js";
import Slowmo from "./item/Slowmo.js";
import Teleporter from "./item/Teleporter.js";

let Z = false, Hb = false;

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
    lastTime = null;
    lastFrame = null;
    progress = 0;
    get theme() {
        return localStorage.getItem("theme");
    }

    adjust() {
        this.setAttribute("height", parseFloat(getComputedStyle(this).height) * window.devicePixelRatio);
        this.setAttribute("width", parseFloat(getComputedStyle(this).width) * window.devicePixelRatio);
    }

    init(trackCode) {
        if (trackCode === null) {
            return;
        }

        if (this.lastFrame) {
            this.close();
        }

        this.track = new Track(this, {
            code: trackCode
        });
        this.track.players.push(new Player(this.track, {
            vehicle: "BMX"
        }));
        this.track.cameraFocus = this.track.firstPlayer.head;
        
        this.lastFrame = requestAnimationFrame(this.render.bind(this));
    }

    initCursor() {
        if (this.track)
            this.track.displayText = false;

        this.canvas.style.cursor = this.track.toolHandler.selected === "camera" ? "move" : "none";
    }

    render(time) {
        this.lastFrame = requestAnimationFrame(this.render.bind(this));
        this.delta = time - this.lastTime;
        if (this.delta < 1000 / this.fps) {
            this.track.render(this.ctx);

            return;
        }

        this.track.update(this.delta / (1000 / this.fps));
        this.track.render(this.ctx);
        this.lastTime = time;
    }

    mouseDown(event) {
        this.track.cameraLock = true;
        this.track.cameraFocus = false;
        if (event.button === 2 && this.track.toolHandler.selected !== "camera") {
            //this.track.erase(this.mouse.position);
            return;
        } else if (this.track.firstPlayer.gamepad.downKeys.has("q") && this.track.toolHandler.selected === "line" && !this.track.toolHandler.currentTool.scenery) {
            this.track.addLine(this.mouse.old, this.mouse.position, false);
        } else {
            let x;
            Z || this.mouse.old.copy(this.mouse.position);
            switch (this.track.toolHandler.selected) {
                case "boost":
                case "gravity":
                    this.canvas.style.cursor = "crosshair";
                    break;
                    
                case "eraser":
                    this.track.erase(this.mouse.position);
                    break;

                case "goal":
                    x = new Target(this.track, this.mouse.old.x,this.mouse.old.y);
                    this.track.targets++;
                    break;

                case "checkpoint":
                    x = new Checkpoint(this.track, this.mouse.old.x,this.mouse.old.y);
                    break;

                case "bomb":
                    x = new Bomb(this.track, this.mouse.old.x,this.mouse.old.y);
                    break;

                case "slow-mo":
                    x = new Slowmo(this.track, this.mouse.old.x,this.mouse.old.y);
                    break;
                    
                case "antigravity":
                    x = new Antigravity(this.track, this.mouse.old.x,this.mouse.old.y);
                    break;

                case "teleporter":
                    x = new Teleporter(this.track, this.mouse.old.x,this.mouse.old.y);
                    this.track.teleporter = x;
                    break;

                case "brush":
                case "scenery brush":
                    this.track.addLine(this.mouse.old, this.mouse.position, this.track.toolHandler.currentTool.scenery);
                    this.track.cameraLock = true;
                    break;
            }
            
            if (x !== void 0) {
                let c = Math.floor(x.position.x / this.track.scale)
                , d = Math.floor(x.position.y / this.track.scale);
                this.track.grid[c] === void 0 && (this.track.grid[c] = []);
                this.track.grid[c][d] === void 0 && (this.track.grid[c][d] = new Sector);
                this.track.grid[c][d].powerups.push(x);
                this.track.powerups.push(x);
            }
        }
    }

    mouseMove(event) {
        if (this.track.toolHandler.selected !== "camera") {
            this.track.cameraFocus = false;
        }

        if (this.track.toolHandler.selected !== "eraser") {
            if (event.button !== 2) {
                this.mouse.position.x = Math.round(this.mouse.position.x / this.track.gridSize) * this.track.gridSize;
                this.mouse.position.y = Math.round(this.mouse.position.y / this.track.gridSize) * this.track.gridSize;
            }
        }

        if (this.track.cameraLock) {
            switch(this.track.toolHandler.selected) {
                case "brush":
                    this.mouse.old.distanceTo(this.mouse.position) >= this.track.toolHandler.currentTool.length && this.track.addLine(this.mouse.old, this.mouse.position, this.track.toolHandler.currentTool.scenery);
                    break;

                case "camera":
                    this.track.camera.addToSelf(this.mouse.old.sub(this.mouse.position)),
                    this.mouse.position.copy(this.mouse.old);
                    break;

                case "eraser":
                    this.track.erase(this.mouse.position);
                    break;
            }
        }

        this.canvas.style.cursor = this.track.toolHandler.selected == "camera" ? "move" : ["boost", "gravity"].includes(this.track.toolHandler.selected) ? "crosshair" : "none";

    }

    mouseUp(event) {
        if (!Z)
            this.track.cameraLock = false;

        if (Hb)
            return Hb = false;

        //if (this.track.cameraLock) {
            if (["line", "brush"].includes(this.track.toolHandler.selected)) {
                this.track.addLine(this.mouse.old, this.mouse.position, this.track.toolHandler.currentTool.scenery);
            } else if ("teleporter" === this.track.toolHandler.selected) {
                this.mouse.old.copy(this.mouse.position);
                if (this.track.teleporter) {
                    if (this.track.teleporter.position.distanceTo(this.mouse.old) > 40) {
                        this.track.teleporter.createAlt(this.mouse.old.x, this.mouse.old.y);
                    
                        let x = Math.floor(this.track.teleporter.alt.x / this.track.scale);
                        let y = Math.floor(this.track.teleporter.alt.y / this.track.scale);
        
                        this.track.grid[x] === void 0 && (this.track.grid[x] = []),
                        this.track.grid[x][y] === void 0 && (this.track.grid[x][y] = new Sector()),
                        this.track.grid[x][y].powerups.push(this.track.teleporter);
                    } else {
                        this.track.teleporter.remove();
                    }
                    
                    delete this.track.teleporter;
                }
            } else if (this.canvas.style.cursor === "crosshair" && ["boost", "gravity"].includes(this.track.toolHandler.selected)) {
                this.canvas.style.cursor = "none";

                let d = Math.round(180 * Math.atan2(-(this.mouse.position.x - this.mouse.old.x), this.mouse.position.y - this.mouse.old.y) / Math.PI);
                let c = this.track.toolHandler.selected === "boost" ? new Boost(this.track, this.mouse.old.x,this.mouse.old.y,d) : new Gravity(this.track, this.mouse.old.x,this.mouse.old.y,d);
                let y = Math.floor(c.position.x / this.track.scale);
                let x = Math.floor(c.position.y / this.track.scale);

                this.track.grid[y] === void 0 && (this.track.grid[y] = []),
                this.track.grid[y][x] === void 0 && (this.track.grid[y][x] = new Sector()),
                this.track.grid[y][x].powerups.push(c);
                this.track.powerups.push(c);
            }
        //}
    }

    scroll(event) {
        if (Z) {
            if ("eraser" === this.track.toolHandler.selected) {
                if ((0 < event.detail || 0 > event.wheelDelta) && 5 < this.track.toolHandler.currentTool.size) {
                    this.track.toolHandler.currentTool.size -= 5;
                } else {
                    if ((0 > event.detail || 0 < event.wheelDelta) && 40 > this.track.toolHandler.currentTool.size) {
                        this.track.toolHandler.currentTool.size += 5
                    }
                }
            } else {
                if ("brush" === this.track.toolHandler.selected || "scenery brush" === this.track.toolHandler.selected) {
                    if ((0 < event.detail || 0 > event.wheelDelta) && 4 < this.track.toolHandler.currentTool.length) {
                        this.track.toolHandler.currentTool.length -= 8;
                    } else if ((0 > event.detail || 0 < event.wheelDelta) && 200 > this.track.toolHandler.currentTool.length) {
                        this.track.toolHandler.currentTool.length += 8;
                    }
                }
            }
        } else {
            if (0 < event.detail || 0 > event.wheelDelta) {
                this.track.zoomOut()
            } else if (0 > event.detail || 0 < event.wheelDelta) {
                this.track.zoomIn()
            };
        }
        let y = new Vector(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop + window.pageYOffset).toCanvas();
        this.track.cameraFocus || this.track.camera.addToSelf(this.mouse.position.sub(y))
    }

    load() {
        this.canvas.style.display = "block";
        document.querySelector("#track_menu").style.display = "none";
        const code = document.querySelector("#trackcode");
        if (code.value.includes("#")) {
            var t = this.track.editor;
            this.close();
            this.init(code.value);
            document.querySelector("#charcount").innerHTML = "Trackcode";
            code.value = null;
            this.track.editor = t;
        } else {
            alert("No trackcode to load!");
            this.canvas.style.display = "none";
            document.getElementById("track_menu").style.display = "block";
        }
    }

    save() {
        if (this.track.id === void 0) {
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
            }(new Blob([this.track.toString()], { type: "txt" }), `black_hat_rider_${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`);
        }
    }

    saveGhost() {
        if (this.track.id === void 0) {
            const date = new Date();
            !function(t, e) {
                if (typeof navigator.msSaveBlob == "function")
                    return navigator.msSaveBlob(t, e);

                var saver = document.createElementNS("http://www.w3.org/2000/svg", "a");
                saver.href = URL.createObjectURL(t);
                saver.download = e;
                saver.dispatchEvent(new MouseEvent("click"));
                URL.revokeObjectURL(saver.href);
            }(new Blob([JSON.stringify(this.firstPlayer.gamepad.records)], { type: "txt" }), `black_hat_ghost-${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`);
        }
    }

    reset() {
        if (confirm("Do you really want to start a new track?")) {
            this.close();
            this.init("-18 1i 18 1i###BMX");
            document.querySelector("#charcount").innerHTML = "Trackcode";
            document.querySelector("#trackcode").value = null;
        }
    }

    close() {
        this.track = null;

        this.mouse.close();

        window.removeEventListener("resize", this.adjust);

        cancelAnimationFrame(this.lastFrame);
    }
}