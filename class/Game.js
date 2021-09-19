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

let Z = false, Hb = false;

export default class {
    constructor(canvas) {
        this.canvas = canvas;
        
        window.addEventListener("resize", this.adjust.bind(canvas));
        this.adjust.bind(canvas)();

        this.mouse = new Mouse(canvas);
        this.mouse.on("mouseover", this.initCursor.bind(this));
        this.mouse.on("mousedown", this.mouseDown.bind(this));
        this.mouse.on("mousemove", this.mouseMove.bind(this));
        this.mouse.on("mouseup", this.mouseUp.bind(this));

        this.fps = 25;
        this.lastTime = -1;
        this.lastFrame = null;
    }
    adjust() {
        this.setAttribute("height", +getComputedStyle(this).getPropertyValue("height").slice(0, -2) * window.devicePixelRatio);
        this.setAttribute("width", +getComputedStyle(this).getPropertyValue("width").slice(0, -2) * window.devicePixelRatio);
    }
    init(trackCode) {
        this.track = new Track(this, trackCode);
        this.track.players.push(new Player(this.track, {
            vehicle: "BMX"
        }));
        this.track.cameraFocus = this.track.firstPlayer.head;
        
        this.lastFrame = requestAnimationFrame(this.update.bind(this));
    }
    initCursor() {
        if (this.track)
            this.track.displayText = false;

        this.canvas.style.cursor = "camera" === tool.selected ? "move" : "none";
    }
    mouseDown(event) {
        this.track.cameraLock = true;
        this.track.cameraFocus = false;
        if (Math.floor(this.mouse.real.x / 25) < 1 && [0, 1, 2, 4, 6, 7, 12, 13, 15, 16, 17].includes(Math.floor(this.mouse.real.y / 25))) {
            this.track.cameraLock = false;
            switch (Math.floor((event.clientY - this.canvas.offsetTop + window.pageYOffset) / 25) + 1) {
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
                    if (tool.selected == "eraser") {
                        if (tool.eraser.size < 500) {
                            tool.eraser.size += 5;
                        }
                    } else if ("brush\\scenery brush".split(/\\/).includes(tool.selected)) {
                        if (tool.brush.length < 200) {
                            tool.brush.length += 8;
                        }
                    }
                    break;

                case 14:
                    if (tool.selected == "eraser") {
                        if (tool.eraser.size > 10) {
                            tool.eraser.size -= 5;
                        }
                    } else if ("brush\\scenery brush".split(/\\/).includes(tool.selected)) {
                        if (tool.brush.length > 4) {
                            tool.brush.length -= 8;
                        }
                    }
                    break;

                case 16:
                    if (tool.selected == "eraser") {
                        tool.eraser.settings.physics = !tool.eraser.settings.physics;
                        this.track.displayText[2] = tool.descriptions.left[15];
                    }
                    break;

                case 17:
                    if (tool.selected == "eraser") {
                        tool.eraser.settings.scenery = !tool.eraser.settings.scenery;
                        this.track.displayText[2] = tool.descriptions.left[16];
                    }
                    break;
                    
                case 18:
                    if (tool.selected == "eraser") {
                        tool.eraser.settings.powerups = !tool.eraser.settings.powerups;
                        this.track.displayText[2] = tool.descriptions.left[17];
                    }
                    break;
            }
        } else if (this.track.editor && Math.floor(this.mouse.real.x / 25) > this.canvas.width / 25 - 1.367 &&
        [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17].includes(Math.floor(this.mouse.real.y / 25))) {
            this.track.cameraLock = false;
            switch (Math.floor(this.mouse.real.y / 25) + 1) {
                case 1:
                    tool.selected = "brush";
                    break;

                case 2:
                    tool.selected = "scenery brush";
                    break;

                case 3:
                    tool.selected = "line";
                    break;

                case 4:
                    tool.selected = "scenery line";
                    break;

                case 5:
                    tool.selected = "eraser";
                    break;

                case 6:
                    tool.selected = "camera";
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
                    tool.selected = "goal";
                    break;
                    
                case 10:
                    tool.selected = "checkpoint";
                    break;

                case 11:
                    tool.selected = "boost";
                    break;

                case 12:
                    tool.selected = "gravity";
                    break;

                case 13:
                    tool.selected = "bomb";
                    break;

                case 14:
                    tool.selected = "slow-mo";
                    break;

                case 15:
                    tool.selected = "antigravity";
                    break;

                case 16:
                    tool.selected = "teleporter";
                    break;

                case 18:
                    this.track.undo()
                    break;
            }
        } else if (event.button === 2 && tool.selected !== "camera") {
            let y = this.track.erase(this.mouse.position);
            // this.track.pushUndo(() => {
            //     this.track.addToSelf(y, true);
            // }, () => {
            //     for (let x = 0, c = y.length; x < c; x++) {
            //         y[x].remove();
            //     }
            // });
            Hb = true;
        } else {
            let x;
            Z || this.mouse.old.copy(this.mouse.position);
            switch (tool.selected) {
                case "boost":
                case "gravity":
                    this.canvas.style.cursor = "crosshair";
                    break;
                    
                case "eraser":
                    let y = this.track.erase(this.mouse.position);
                    // this.track.pushUndo(() => {
                    //     this.track.addToSelf(y, true);
                    // }, () => {
                    //     for (let x = 0, c = y.length; x < c; x++) {
                    //         y[x].remove();
                    //     }
                    // });
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
                    this.track.addLine(this.mouse.old, this.mouse.position, "brush" !== tool.selected);
                    this.track.cameraLock = true;
                    break;
            }
            if (x !== void 0) {
                let c = Math.floor(x.pos.x / this.track.scale)
                , d = Math.floor(x.pos.y / this.track.scale);
                this.track.grid[c] === void 0 && (this.track.grid[c] = []);
                this.track.grid[c][d] === void 0 && (this.track.grid[c][d] = new Sector);
                this.track.powerups.push(x);
                this.track.grid[c][d].powerups.push(x);
                // this.track.pushUndo(function() {
                //     x.remove()
                // }, function() {
                //     x instanceof Target && ++track.targets;
                //     this.track.grid[c][d].powerups.push(x)
                // })
            }
        }
    }
    mouseMove(event) {
        if (tool.selected !== "camera") {
            this.track.cameraFocus = false;
        }

        if (tool.selected !== "eraser") {
            if (event.button !== 2) {
                this.mouse.position.x = Math.round(this.mouse.position.x / tool.grid) * tool.grid;
                this.mouse.position.y = Math.round(this.mouse.position.y / tool.grid) * tool.grid;
            }
        }

        if (this.track.cameraLock) {
            if (tool.selected === "camera") {
                this.track.camera.addToSelf(this.mouse.old.sub(this.mouse.position)),
                this.mouse.position.copy(this.mouse.old);
            } else if (tool.selected === "eraser" || window.BHR_RCE_ENABLED && event.button === 2) {
                let a = this.track.erase(this.mouse.position);
                if (a.length) {
                    // this.track.pushUndo(() => {
                    //     this.track.addToSelf(a, true);
                    // }, () => {
                    //     for (let b = 0, c = a.length; b < c; b++) {
                    //         a[b].remove();
                    //     }
                    // });
                }
            } else if (["brush", "scenery brush"].includes(tool.selected) && this.mouse.old.distanceTo(this.mouse.position) >= tool.brush.length) {
                let b = this.track.addLine(this.mouse.old, this.mouse.position, "brush" !== tool.selected);
                // this.track.pushUndo(function() {
                //     b.remove()
                // }, function() {
                //     b.xb()
                // })
            }
        }

        const x = Math.floor(this.mouse.real.x / 25);
        const y = Math.floor(this.mouse.real.y / 25);
        if (x < 1) {
            if (y > 11) {
                if ("eraser\\brush\\scenery brush".split(/\\/).includes(tool.selected)) {
                    if (y > 13) {
                        if (tool.selected == "eraser") {
                            this.track.displayText = [0, y, tool.descriptions.left[y]];
                        }
                    } else {
                        this.track.displayText = [0, y, tool.descriptions.left[y]];
                    }
                }
            } else {
                this.track.displayText = [0, y, tool.descriptions.left[y]];
            }

            if ([0, 1, 2, 4, 6, 7].includes(y) || tool.selected == "eraser" && [12, 13, 15, 16, 17].includes(y)) {
                this.canvas.style.cursor = "default";
            } else {
                this.canvas.style.cursor = tool.selected == "camera" ? "move" : ["boost", "gravity"].includes(tool.selected) ? "crosshair" : "none";
            }
        } else if (this.track.editor && x > this.canvas.width / 25 - 1.367) {
            this.track.displayText = [1, y, tool.descriptions.right[y]];
            if (14 === y && ("scenery line" === tool.selected || "scenery brush" === tool.selected)) {
                this.track.displayText[2] = "Shorten last set of scenery lines ( Z )";
            }
            
            if ([0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17].includes(y)) {
                this.canvas.style.cursor = "default";
            } else {
                this.canvas.style.cursor = tool.selected == "camera" ? "move" : ["boost", "gravity"].includes(tool.selected) ? "crosshair" : "none";
            }
        } else {
            this.track.displayText = false;
            this.canvas.style.cursor = tool.selected == "camera" ? "move" : ["boost", "gravity"].includes(tool.selected) ? "crosshair" : "none";
        }
    }
    mouseUp(event) {
        if (!Z)
            this.track.cameraLock = false;

        if (Hb)
            return Hb = false;

        //if (this.track.cameraLock) {
            if ("line" === tool.selected || "scenery line" === tool.selected || "brush" === tool.selected || "scenery brush" === tool.selected) {
                let e = this.track.addLine(this.mouse.old, this.mouse.position, "line" !== tool.selected && "brush" !== tool.selected);
                // this.track.pushUndo(function() {
                //     e.remove()
                // }, function() {
                //     e.xb()
                // })
            } else if ("teleporter" === tool.selected) {
                this.mouse.old.copy(this.mouse.position);
                if (this.track.teleporter) {
                    this.track.teleporter.tpb(this.mouse.old.x, this.mouse.old.y);
                    delete this.track.teleporter;
                }
            } else if (this.canvas.style.cursor === "crosshair" && ["boost", "gravity"].includes(tool.selected)) {
                this.canvas.style.cursor = "none";
                let d = Math.round(180 * Math.atan2(-(this.mouse.position.x - this.mouse.old.x), this.mouse.position.y - this.mouse.old.y) / Math.PI);
                let c = "boost" === tool.selected ? new Boost(this.mouse.old.x,this.mouse.old.y,d, this.track) : new Gravity(this.mouse.old.x,this.mouse.old.y,d, this.track);
                let y = Math.floor(c.pos.x / this.track.scale);
                let x = Math.floor(c.pos.y / this.track.scale);
                this.track.grid[y] === void 0 && (this.track.grid[y] = []),
                this.track.grid[y][x] === void 0 && (this.track.grid[y][x] = new Sector),
                this.track.grid[y][x].powerups.push(c);
                this.track.powerups.push(c);
                // this.track.pushUndo(function() {
                //     c.remove()
                // }, function() {
                //     this.track.grid[y][x].powerups.push(c)
                // })
            }
        //}
    }
    scroll(event) {
        if (Z) {
            if ("eraser" === tool.selected) {
                if ((0 < event.detail || 0 > event.wheelDelta) && 5 < tool.eraser.size) {
                    tool.eraser.size -= 5;
                } else {
                    if ((0 > event.detail || 0 < event.wheelDelta) && 40 > tool.eraser.size) {
                        tool.eraser.size += 5
                    }
                }
            } else {
                if ("brush" === tool.selected || "scenery brush" === tool.selected) {
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
        y = (new Vector(event.clientX - this.canvas.offsetLeft, event.clientY - this.canvas.offsetTop + window.pageYOffset)).toCanvas();
        this.track.cameraFocus || this.track.camera.addToSelf(this.mouse.position.sub(y))
    }
    update(time) {
        this.lastFrame = requestAnimationFrame(this.update.bind(this));
        this.delta = (time - this.lastTime) / 1000;
        if (this.delta * 1000 < 1000 / this.fps)
            return;

        this.track.update(this.delta);
        this.track.render();
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

                let saver = document.createElementNS("http://www.w3.org/1999/xhtml", "y");
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

                var saver = document.createElementNS("http://www.w3.org/1999/xhtml", "y");
                saver.href = URL.createObjectURL(t);
                saver.download = e;
                document.body.appendChild(saver);
                saver.dispatchEvent(new MouseEvent("click"));
                document.body.removeChild(saver);
                URL.revokeObjectURL(saver.href);
            }(new Blob([JSON.stringify(this.firstPlayer.gamepad.records)], { type: "txt" }), `black_hat_ghost_${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`);
        }
    }
    close() {
        this.track = null;

        window.removeEventListener("resize", this.adjust.bind(this.canvas));

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