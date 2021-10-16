import Mouse from "./handler/Mouse.js";

import Track from "./track/Track.js";
import Player from "./Player.js";

import Vector from "./Vector.js";
import Sector from "./sector/Sector.js";
import tool from "../constant/tool.js";
import Target from "./item/Target.js";
import Checkpoint from "./item/Checkpoint.js";
import Bomb from "./item/Bomb.js";
import Boost from "./item/Boost.js";
import Gravity from "./item/Gravity.js";
import Antigravity from "./item/Antigravity.js";
import Slowmo from "./item/Slowmo.js";
import Teleporter from "./item/Teleporter.js";

let Z = false, Hb = false, older = null;

export default class {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.style.setProperty("background-color", this.theme.dark ? "#1B1B1B" : "white");
        this.ctx = this.canvas.getContext("2d");
        
        window.addEventListener("resize", this.adjust.bind(canvas));
        this.adjust.bind(canvas)();

        this.mouse = new Mouse(canvas);
        this.mouse.on("mouseover", this.initCursor.bind(this));
        this.mouse.on("mousedown", this.mouseDown.bind(this));
        this.mouse.on("mousemove", this.mouseMove.bind(this));
        this.mouse.on("mouseup", this.mouseUp.bind(this));
        this.mouse.on("mousewheel", this.scroll.bind(this));

        this.fps = 25;
    }
    lastTime = null;
    lastFrame = null;
    progress = 0;
    get theme() {
        this.canvas.style.backgroundColor = JSON.parse(localStorage.getItem("dark")) ?? window.matchMedia("(prefers-color-scheme: dark)").matches ? "#1B1B1B" : "white";
        return {
            dark: JSON.parse(localStorage.getItem("dark")) ?? window.matchMedia("(prefers-color-scheme: dark)").matches
        }
    }
    adjust() {
        this.setAttribute("height", +getComputedStyle(this).getPropertyValue("height").slice(0, -2) * window.devicePixelRatio);
        this.setAttribute("width", +getComputedStyle(this).getPropertyValue("width").slice(0, -2) * window.devicePixelRatio);
    }
    init(trackCode) {
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
    mouseDown(event) {
        this.track.cameraLock = true;
        this.track.cameraFocus = false;
        if (this.mouse.position.x / 25 < 1 && [0, 1, 2, 4, 6, 7, 12, 13, 15, 16, 17].includes(Math.floor(this.mouse.position.y / 25))) {
            this.track.cameraLock = false;
            switch(Math.floor(this.mouse.position.y / 25) + 1) {
                case 1:
                    this.track.paused = !this.track.paused;
                    break;

                case 2:
                    this.track.gotoCheckpoint();
                    break;

                case 3:
                    this.track.removeCheckpoint();
                    break;

                case 5:
                    this.track.switchBike();
                    break;

                case 7:
                    this.track.lineShading ? (this.track.lineShading = false,
                    this.track.displayText[2] = tool.descriptions.left[6] = "Enable line shading") : (this.track.lineShading = true,
                    this.track.displayText[2] = tool.descriptions.left[6] = "Disable line shading");
                    this.track.sectors = [];
                    break;

                case 8:
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else {
                        this.canvas.requestFullscreen();
                    }
                    break;

                case 13:
                    if (this.track.toolHandler.selected == "eraser") {
                        if (tool.eraser.size < 500) {
                            tool.eraser.size += 5;
                        }
                    } else if (["brush", "scenery brush"].includes(this.track.toolHandler.selected)) {
                        if (tool.brush.length < 200) {
                            tool.brush.length += 8;
                        }
                    }
                    break;

                case 14:
                    if (this.track.toolHandler.selected == "eraser") {
                        if (tool.eraser.size > 10) {
                            tool.eraser.size -= 5;
                        }
                    } else if (["brush", "scenery brush"].includes(this.track.toolHandler.selected)) {
                        if (tool.brush.length > 4) {
                            tool.brush.length -= 8;
                        }
                    }
                    break;

                case 16:
                    if (this.track.toolHandler.selected == "eraser") {
                        tool.eraser.settings.physics = !tool.eraser.settings.physics;
                        this.track.displayText[2] = tool.descriptions.left[15];
                    }
                    break;

                case 17:
                    if (this.track.toolHandler.selected == "eraser") {
                        tool.eraser.settings.scenery = !tool.eraser.settings.scenery;
                        this.track.displayText[2] = tool.descriptions.left[16];
                    }
                    break;
                    
                case 18:
                    if (this.track.toolHandler.selected == "eraser") {
                        tool.eraser.settings.powerups = !tool.eraser.settings.powerups;
                        this.track.displayText[2] = tool.descriptions.left[17];
                    }
                    break;
            }
        } else if (this.track.editor && this.mouse.position.x / 25 > this.canvas.width / 25 - 1 &&
        [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17].includes(Math.floor(this.mouse.position.y / 25))) {
            this.track.cameraLock = false;
            switch (Math.floor(this.mouse.position.y / 25) + 1) {
                case 1:
                    this.track.toolHandler.selected = "brush";
                    break;

                case 2:
                    this.track.toolHandler.selected = "scenery brush";
                    break;

                case 3:
                    this.track.toolHandler.selected = "line";
                    break;

                case 4:
                    this.track.toolHandler.selected = "scenery line";
                    break;

                case 5:
                    this.track.toolHandler.selected = "eraser";
                    break;

                case 6:
                    this.track.toolHandler.selected = "camera";
                    break;

                case 7:
                    if (tool.grid === 1) {
                        tool.grid = 10;
                        this.track.displayText[2] = tool.descriptions.right[6] = "Disable grid snapping ( G )";
                    } else {
                        tool.grid = 1;
                        this.track.displayText[2] = tool.descriptions.right[6] = "Enable grid snapping ( G )";
                    }
                    break;

                case 9:
                    this.track.toolHandler.selected = "goal";
                    break;
                    
                case 10:
                    this.track.toolHandler.selected = "checkpoint";
                    break;

                case 11:
                    this.track.toolHandler.selected = "boost";
                    break;

                case 12:
                    this.track.toolHandler.selected = "gravity";
                    break;

                case 13:
                    this.track.toolHandler.selected = "bomb";
                    break;

                case 14:
                    this.track.toolHandler.selected = "slow-mo";
                    break;

                case 15:
                    this.track.toolHandler.selected = "antigravity";
                    break;

                case 16:
                    this.track.toolHandler.selected = "teleporter";
                    break;

                case 18:
                    this.track.undo()
                    break;
            }
        } else if (event.button === 2 && this.track.toolHandler.selected !== "camera") {
            //this.track.erase(this.mouse.position);
            return;
        } else if (this.track.firstPlayer.gamepad.downKeys.has("q") && this.track.toolHandler.selected === "line") {
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
                    x = new Target(this.mouse.old.x,this.mouse.old.y, this.track);
                    this.track.targets++;
                    break;

                case "checkpoint":
                    x = new Checkpoint(this.mouse.old.x,this.mouse.old.y, this.track);
                    break;

                case "bomb":
                    x = new Bomb(this.mouse.old.x,this.mouse.old.y, this.track);
                    break;

                case "slow-mo":
                    x = new Slowmo(this.mouse.old.x,this.mouse.old.y, this.track);
                    break;
                    
                case "antigravity":
                    x = new Antigravity(this.mouse.old.x,this.mouse.old.y, this.track);
                    break;

                case "teleporter":
                    x = new Teleporter(this.mouse.old.x,this.mouse.old.y, this.track);
                    this.track.teleporter = x;
                    break;

                case "brush":
                case "scenery brush":
                    this.track.addLine(this.mouse.old, this.mouse.position, "brush" !== this.track.toolHandler.selected);
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
                this.mouse.position.x = Math.round(this.mouse.position.x / tool.grid) * tool.grid;
                this.mouse.position.y = Math.round(this.mouse.position.y / tool.grid) * tool.grid;
            }
        }

        if (this.track.cameraLock) {
            if (this.track.toolHandler.selected === "camera") {
                this.track.camera.addToSelf(this.mouse.old.sub(this.mouse.position)),
                this.mouse.position.copy(this.mouse.old);
            } else if (this.track.toolHandler.selected === "eraser" || window.BHR_RCE_ENABLED && event.button === 2) {
                this.track.erase(this.mouse.position);
            } else if (["brush", "scenery brush"].includes(this.track.toolHandler.selected) && this.mouse.old.distanceTo(this.mouse.position) >= tool.brush.length) {
                this.track.addLine(this.mouse.old, this.mouse.position, "brush" !== this.track.toolHandler.selected);
            }
        }

        const x = this.mouse.position.x / 25;
        const y = Math.floor(this.mouse.position.y / 25);
        if (x < 1) {
            if (y > 11) {
                if ("eraser\\brush\\scenery brush".split(/\\/).includes(this.track.toolHandler.selected)) {
                    if (y > 13) {
                        if (this.track.toolHandler.selected == "eraser") {
                            this.track.displayText = [0, y, tool.descriptions.left[y]];
                        }
                    } else {
                        this.track.displayText = [0, y, tool.descriptions.left[y]];
                    }
                }
            } else {
                this.track.displayText = [0, y, tool.descriptions.left[y]];
            }

            if ([0, 1, 2, 4, 6, 7].includes(y) || this.track.toolHandler.selected == "eraser" && [12, 13, 15, 16, 17].includes(y)) {
                this.canvas.style.cursor = "default";
            } else {
                this.canvas.style.cursor = this.track.toolHandler.selected == "camera" ? "move" : ["boost", "gravity"].includes(this.track.toolHandler.selected) ? "crosshair" : "none";
            }
        } else if (this.track.editor && x > this.canvas.width / 25 - 1) {
            this.track.displayText = [1, y, tool.descriptions.right[y]];
            if (14 === y && ("scenery line" === this.track.toolHandler.selected || "scenery brush" === this.track.toolHandler.selected)) {
                this.track.displayText[2] = "Shorten last set of scenery lines ( Z )";
            }
            
            if ([0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17].includes(y)) {
                this.canvas.style.cursor = "default";
            } else {
                this.canvas.style.cursor = this.track.toolHandler.selected == "camera" ? "move" : ["boost", "gravity"].includes(this.track.toolHandler.selected) ? "crosshair" : "none";
            }
        } else {
            this.track.displayText = false;
            this.canvas.style.cursor = this.track.toolHandler.selected == "camera" ? "move" : ["boost", "gravity"].includes(this.track.toolHandler.selected) ? "crosshair" : "none";
        }
    }
    mouseUp(event) {
        if (!Z)
            this.track.cameraLock = false;

        if (Hb)
            return Hb = false;

        //if (this.track.cameraLock) {
            if (["line", "scenery line", "brush", "scenery brush"].includes(this.track.toolHandler.selected)) {
                this.track.addLine(this.mouse.old, this.mouse.position, "line" !== this.track.toolHandler.selected && "brush" !== this.track.toolHandler.selected);
            } else if ("teleporter" === this.track.toolHandler.selected) {
                this.mouse.old.copy(this.mouse.position);
                if (this.track.teleporter) {
                    this.track.teleporter.tpb(this.mouse.old.x, this.mouse.old.y);
                    delete this.track.teleporter;
                }
            } else if (this.canvas.style.cursor === "crosshair" && ["boost", "gravity"].includes(this.track.toolHandler.selected)) {
                this.canvas.style.cursor = "none";

                let d = Math.round(180 * Math.atan2(-(this.mouse.position.x - this.mouse.old.x), this.mouse.position.y - this.mouse.old.y) / Math.PI);
                let c = "boost" === this.track.toolHandler.selected ? new Boost(this.mouse.old.x,this.mouse.old.y,d, this.track) : new Gravity(this.mouse.old.x,this.mouse.old.y,d, this.track);
                let y = Math.floor(c.position.x / this.track.scale);
                let x = Math.floor(c.position.y / this.track.scale);

                this.track.grid[y] === void 0 && (this.track.grid[y] = []),
                this.track.grid[y][x] === void 0 && (this.track.grid[y][x] = new Sector),
                this.track.grid[y][x].powerups.push(c);
                this.track.powerups.push(c);
            }
        //}
    }
    scroll(event) {
        if (Z) {
            if ("eraser" === this.track.toolHandler.selected) {
                if ((0 < event.detail || 0 > event.wheelDelta) && 5 < tool.eraser.size) {
                    tool.eraser.size -= 5;
                } else {
                    if ((0 > event.detail || 0 < event.wheelDelta) && 40 > tool.eraser.size) {
                        tool.eraser.size += 5
                    }
                }
            } else {
                if ("brush" === this.track.toolHandler.selected || "scenery brush" === this.track.toolHandler.selected) {
                    if ((0 < event.detail || 0 > event.wheelDelta) && 4 < tool.brush.length) {
                        tool.brush.length -= 8;
                    } else if ((0 > event.detail || 0 < event.wheelDelta) && 200 > tool.brush.length) {
                        tool.brush.length += 8;
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
    render(time) {
        this.lastFrame = requestAnimationFrame(this.render.bind(this));
        this.delta = time - this.lastTime;
        if (this.delta < 1000 / this.fps) {
            //this.track.fixedUpdate();
            this.track.render(this.ctx);

            return;
        }
        // this.progress += this.delta / (1000 / 50);
        // while(this.progress >= 1) {
        //     this.track.fixedUpdate();
        //     this.progress--;
        // }
        this.track.fixedUpdate();
        // this.track.update(this.progress);
        this.track.render(this.ctx);
        this.lastTime = time;
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
    close() {
        this.track = null;

        this.mouse.close();

        window.removeEventListener("resize", this.adjust);

        cancelAnimationFrame(this.lastFrame);
    }
    reset() {
        if (confirm("Do you really want to start y new track?")) {
            this.close();
            this.init("-18 1i 18 1i###BMX");
            document.querySelector("#charcount").innerHTML = "Trackcode";
            document.querySelector("#trackcode").value = null;
        }
    }
}