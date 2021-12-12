import Player from "../Player.js";

import ToolHandler from "../handler/Tool.js";
import UndoManager from "../managers/Undo.js";

import Vector from "../Vector.js";
import Sector from "../sector/Sector.js";
import PhysicsLine from "../sector/PhysicsLine.js";
import SceneryLine from "../sector/SceneryLine.js";

import Target from "../item/Target.js";
import Checkpoint from "../item/Checkpoint.js";
import Bomb from "../item/Bomb.js";
import Boost from "../item/Boost.js";
import Gravity from "../item/Gravity.js";
import Antigravity from "../item/Antigravity.js";
import Slowmo from "../item/Slowmo.js";
import Teleporter from "../item/Teleporter.js";

import tool from "../../constant/tool.js";

export default class Track {
    constructor(parent, { id, code } = { id: null, code: "-18 1i 18 1i###BMX" }) {
        this.parent = parent;

        if (id)
            this.id = id;

        this.editor = !this.id;
        if (this.editor) {
            this.toolHandler.selected = "line";
        }

        this.code = code;
        this.read(this.code);

        this.parent.watchGhost = this.watchGhost;
    }
    code = null;
    scale = 100;
    targets = 0;
    grid = {}
    sectors = {}
    players = []
    physics = []
    scenery = []
    powerups = []
    editor = false;
    paused = false;
    currentTime = 0;
    pictureMode = false;
    displayText = false;
    lineShading = false;
    camera = new Vector(0, 0);
    cameraLock = false;
    cameraFocus = null;
    zoom = 0.6;
    toolHandler = new ToolHandler(this);
    undoManager = new UndoManager();
    get firstPlayer() {
        return this.players[0];
    }
    zoomIn() {
        if (4 > this.zoom) {
            this.zoom = Math.round(10 * this.zoom + 2) / 10;
            this.sectors = {}
        }
    }
    zoomOut() {
        if (0.2 < this.zoom) {
            this.zoom = Math.round(10 * this.zoom + 2 * -1) / 10;
            this.sectors = {}
        }
    }
    switchBike() {
        this.firstPlayer.vehicle.name = this.firstPlayer.vehicle.name === "BMX" ? "MTB" : "BMX"
        this.reset();
        this.cameraFocus = this.firstPlayer.vehicle.head;
    }
    gotoCheckpoint() {
        this.paused = false; // JSON.parse(localStorage.pauseOnEnter) ? true : false;
        this.removeCollectedItems();
        if (this.firstPlayer.snapshots.length > 0) {
            var c = this.firstPlayer.snapshots.pop();
            this.firstPlayer.restore(c);
            this.currentTime = c.time;
        } else {
            for (const player of this.players)
                player.reset();

            this.currentTime = 0;
        }

        this.cameraFocus = this.firstPlayer.vehicle.head,
        this.camera = this.firstPlayer.vehicle.head.position.clone();
    }
    removeCheckpoint() {
        for (var i in this.players) {
            if (this.players[i].snapshots.length > 0) {
                if (this.players[i].snapshots.cache !== void 0) {
                    this.players[i].snapshots.cache.push(this.players[i].snapshots[this.players[i].snapshots.length - 1]);
                }
                this.players[i].snapshots.pop()
            }
        }
    }
    removeCheckpointUndo() {
        for (var i in this.players) {
            if (this.players[i].snapshots.cache.length > 0) {
                if (this.players[i].snapshots !== void 0) {
                    snapshots.push(snapshots.cache[snapshots.cache.length - 1]);
                    this.players[i].snapshots.push(this.players[i].snapshots.cache[this.players[i].snapshots.cache.length - 1]);
                }
                this.players[i].snapshots.cache.pop()
            }
        }
    }
    removeCollectedItems() {
        var a, b, c, d, e;
        for (a in this.grid) {
            if (this.grid.hasOwnProperty(a)) {
                for (b in this.grid[a]) {
                    if (this.grid[a].hasOwnProperty(b)) {
                        e = this.grid[a][b];
                        c = 0;
                        for (d = e.powerups.length; c < d; c++) {
                            if (e.powerups[c].used !== void 0) {
                                e.powerups[c].used = false
                            }
                        }
                    }
                }
            }
        }
    }
    watchGhost(a) {
        if (typeof a === "string")
            a = JSON.parse(a);

        this.reset();
        this.cameraFocus = this.players[0].vehicle.head;
        this.players.push(new Player(this, {
            vehicle: a.vehicle,
            ghost: a
        }));
        this.paused = false;
    }
    collide(a) {
        let x = Math.floor(a.position.x / this.scale - 0.5);
        let y = Math.floor(a.position.y / this.scale - 0.5);
        if (this.grid[x] !== void 0) {
            if (this.grid[x][y] !== void 0) {
                this.grid[x][y].za()
            }
            if (this.grid[x][y + 1] !== void 0) {
                this.grid[x][y + 1].za()
            }
        }

        if (this.grid[x + 1] !== void 0) {
            if (this.grid[x + 1][y] !== void 0) {
                this.grid[x + 1][y].za()
            }
            if (this.grid[x + 1][y + 1] !== void 0) {
                this.grid[x + 1][y + 1].za()
            }
        }

        if (this.grid[x] !== void 0 && this.grid[x][y] !== void 0) {
            this.grid[x][y].collide(a)
        }

        if (this.grid[x + 1] !== void 0) {
            if (this.grid[x + 1][y] !== void 0) {
                this.grid[x + 1][y].collide(a)
            }
            if (this.grid[x + 1][y + 1] !== void 0) {
                this.grid[x + 1][y + 1].collide(a)
            }
        }

        if (this.grid[x] !== void 0 && this.grid[x][y + 1] !== void 0) {
            this.grid[x][y + 1].collide(a)
        }

        return this;
    }
    fixedUpdate() {
        if (!this.paused) {
            for (const player of this.players)
                player.fixedUpdate();

            this.currentTime += 1000 / 25;
        }

        if (this.cameraFocus)
            this.camera.addToSelf(this.cameraFocus.position.sub(this.camera).scale(0.3));

        return this;
    }
    update(delta) {
        if (!this.paused) {
            for (const player of this.players)
                player.update(delta);

            this.currentTime += 1000 / 25;
        }

        if (this.cameraFocus)
            this.camera.addToSelf(this.cameraFocus.position.sub(this.camera).scale(0.3));

        return this;
    }
    render(ctx) {
        this.draw(ctx);
        for (const player of this.players)
            player.draw(ctx);

        this.toolHandler.draw();
    }
    draw(ctx) {
        ctx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);
        ctx.lineWidth = Math.max(2 * this.zoom, 0.5);

        let position = this.parent.mouse.position.toPixel();
        let old = this.parent.mouse.old.toPixel();
        if (this.cameraLock && ["line", "scenery line", "brush", "scenery brush", "teleporter"].includes(this.toolHandler.selected)) {
            if (position.x < 50) {
                this.camera.x -= 4 / this.zoom;
                this.parent.mouse.position.x -= 4 / this.zoom;
            } else if (position.x > this.parent.canvas.width - 50) {
                this.camera.x += 4 / this.zoom;
                this.parent.mouse.position.x += 4 / this.zoom;
            }

            if (position.y < 50) {
                this.camera.y -= 4 / this.zoom;
                this.parent.mouse.position.y -= 4 / this.zoom;
            } else if (position.y > this.parent.canvas.height - 50) {
                this.camera.y += 4 / this.zoom;
                this.parent.mouse.position.y += 4 / this.zoom;
            }

            position = this.parent.mouse.position.toPixel();
            old = this.parent.mouse.old.toPixel();
            
            ctx.save();
            ctx.strokeStyle = "#f00";
            ctx.beginPath(),
            ctx.moveTo(old.x, old.y),
            ctx.lineTo(position.x, position.y),
            ctx.stroke();
            ctx.restore();
        }

        let i = new Vector().toCanvas(this.parent.canvas)
        , l = new Vector(this.parent.canvas.width, this.parent.canvas.height).toCanvas(this.parent.canvas);
        i.x = Math.floor(i.x / this.scale);
        i.y = Math.floor(i.y / this.scale);
        l.x = Math.floor(l.x / this.scale);
        l.y = Math.floor(l.y / this.scale);
        var m = [], n, x, w, y, C;
        for (w = i.x; w <= l.x; w++) {
            for (y = i.y; y <= l.y; y++) {
                if (this.grid[w] !== void 0 && this.grid[w][y] !== void 0) {
                    if (0 < this.grid[w][y].physics.length || 0 < this.grid[w][y].scenery.length) {
                        m[C = w + "_" + y] = 1;
                        if (this.sectors[C] === void 0) {
                            n = this.sectors[C] = document.createElement("canvas");
                            n.width = this.scale * this.zoom;
                            n.height = this.scale * this.zoom;
                            var M = n.getContext("2d");
                            M.lineCap = "round";
                            M.lineWidth = Math.max(2 * this.zoom, 0.5);
                            M.strokeStyle = this.parent.theme.dark ? "#999999" : "#AAAAAA";
                            n = 0;
                            for (x = this.grid[w][y].scenery.length; n < x; n++)
                                this.grid[w][y].scenery[n].draw(M, w * this.scale * this.zoom, y * this.scale * this.zoom);
                            
                            M.strokeStyle = this.parent.theme.dark ? "#FFFFFF" : "#000000";
                            this.lineShading && (M.shadowOffsetX = M.shadowOffsetY = 2,
                            M.shadowBlur = Math.max(2, 10 * this.zoom),
                            M.shadowColor = this.parent.theme.dark ? "#FFFFFF" : "#000000");
                            n = 0;
                            for (x = this.grid[w][y].physics.length; n < x; n++)
                                this.grid[w][y].physics[n].draw(M, w * this.scale * this.zoom, y * this.scale * this.zoom)
                        }
                        ctx.drawImage(this.sectors[C], Math.floor(this.parent.canvas.width / 2 - this.camera.x * this.zoom + w * this.scale * this.zoom), Math.floor(this.parent.canvas.height / 2 - this.camera.y * this.zoom + y * this.scale * this.zoom))
                    }
                    ctx.strokeStyle = "#000";
                    n = 0;
                    for (x = this.grid[w][y].powerups.length; n < x; n++) {
                        this.grid[w][y].powerups[n].draw();
                    }
                }
            }
        }

        for (var X in this.sectors)
            m[X] === void 0 && delete this.sectors[X];

        if (this.toolHandler.selected !== "camera" && !this.cameraFocus) {
            ctx.save();
            switch (this.toolHandler.selected) {
                case "line":
                case "scenery line":
                case "brush":
                case "scenery brush":
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = this.parent.theme.dark ? "#FBFBFB" : "#000000";
                    ctx.beginPath(),
                    ctx.moveTo(position.x - 10, position.y),
                    ctx.lineTo(position.x + 10, position.y),
                    ctx.moveTo(position.x, position.y + 10),
                    ctx.lineTo(position.x, position.y - 10),
                    ctx.stroke();
                break;

                case "eraser":
                    ctx.fillStyle = "#ffb6c199";
                    ctx.beginPath();
                    ctx.arc(position.x, position.y, (tool.eraser.size - 1) * this.zoom, 0, Math.PI * 2, true);
                    ctx.fill();
                break;

                case "goal":
                case "checkpoint":
                case "bomb":
                case "slow-mo":
                case "antigravity":
                case "teleporter":
                    ctx.fillStyle = this.toolHandler.selected == "goal" ? "#ff0" : this.toolHandler.selected == "checkpoint" ? "#00f" : this.toolHandler.selected == "bomb" ? "#f00" : this.toolHandler.selected == "slow-mo" ? "#eee" : this.toolHandler.selected == "antigravity" ? "#0ff" : "#f0f";
                    ctx.beginPath(),
                    ctx.arc(position.x, position.y, 7 * this.zoom, 0, 2 * Math.PI, true),
                    ctx.fill(),
                    ctx.stroke();
                break;

                case "boost":
                case "gravity":
                    ctx.beginPath(),
                    ctx.fillStyle = this.toolHandler.selected == "boost" ? "#ff0" : "#0f0";
                    if (this.cameraLock) {
                        ctx.translate(old.x, old.y),
                        ctx.rotate(Math.atan2(-(this.parent.mouse.position.x - this.parent.mouse.old.x), this.parent.mouse.position.y - this.parent.mouse.old.y));
                    } else {
                        ctx.translate(position.x, position.y);
                    }

                    ctx.moveTo(-7 * this.zoom, -10 * this.zoom),
                    ctx.lineTo(0, 10 * this.zoom),
                    ctx.lineTo(7 * this.zoom, -10 * this.zoom),
                    ctx.lineTo(-7 * this.zoom, -10 * this.zoom),
                    ctx.fill(),
                    ctx.stroke();
                break;
            }

            ctx.restore();
        }
        
        ctx.beginPath();
        ctx.fillStyle = "#ff0";
        ctx.lineWidth = 1;
        ctx.arc(40, 12, 3.5, 0, 2 * Math.PI, true),
        ctx.fill(),
        ctx.stroke(),
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.strokeStyle = this.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
        ctx.fillStyle = this.parent.theme.dark ? "#FBFBFB" : "#000000";

        let e = Math.floor(this.currentTime / 6E4);
        let h = Math.floor(this.currentTime % 6E4 / 1E3);
        let c = Math.floor((this.currentTime - 6E4 * e - 1E3 * h) / 100);

        i = "";
        10 > e && (e = "0" + e);
        10 > h && (h = "0" + h);
        i = e + ":" + h + "." + c;
        if (this.paused && !window.autoPause) {
            i += " - Game paused";
        } else if (this.firstPlayer && this.firstPlayer.dead) {
            i = "Press ENTER to restart";
            if (this.firstPlayer.snapshots.length > 1) {
                i += " or BACKSPACE to cancel Checkpoint"
            }
        } else if (this.id === void 0) {
            if (tool.grid === 10 && "line\\scenery line\\brush\\scenery brush".split(/\\/).includes(this.toolHandler.selected)) {
                i += " - Grid ";
            }
            i += " - " + this.toolHandler.selected;
            if ("brush\\scenery brush".split(/\\/).includes(this.toolHandler.selected)) {
                i += " ( size " + tool.brush.length + " )";
            }
        }
        if (this.displayText) {
            if (!this.displayText[0] && !this.displayText[1]) {
                i += " - " + (this.paused ? "Unp" : "P") + "ause ( SPACE )";
            }
        }
        ctx.strokeText(i = ": " + this.firstPlayer.targetsCollected + " / " + this.targets + "  -  " + i, 50, 16);
        ctx.fillText(i, 50, 16);
        if (this.players.length > 1) {
            for (i = 1; i < this.players.length; i++) {
                ctx.fillStyle = this.parent.theme.dark ? "#999999" : "#AAAAAA";
                ctx.textAlign = "right";
                ctx.strokeText(i = (this.players[i].name || "Ghost") + (this.players[i].targetsCollected === this.targets ? " finished!" : ": " + this.players[i].targetsCollected + " / " + this.targets), this.parent.canvas.width - 7, 16);
                ctx.fillText(i, this.parent.canvas.width - 7, 16);
                ctx.textAlign = "left";
                ctx.fillStyle = this.parent.theme.dark ? "#FBFBFB" : "#000000";
            }
        }

        if (this.displayText) {
            if (this.displayText[2] !== void 0) {
                if (this.displayText[0]) {
                    ctx.textAlign = "right";
                    if (document.documentElement.offsetHeight <= window.innerHeight) {
                        ctx.strokeText(this.displayText[2], this.parent.canvas.width - 36, 15 + 25 * this.displayText[1]);
                        ctx.fillText(this.displayText[2], this.parent.canvas.width - 36, 15 + 25 * this.displayText[1]);
                    } else {
                        ctx.strokeText(this.displayText[2], this.parent.canvas.width - 51, 15 + 25 * this.displayText[1]);
                        ctx.fillText(this.displayText[2], this.parent.canvas.width - 51, 15 + 25 * this.displayText[1]);
                    }
                    ctx.textAlign = "left";
                } else {
                    ctx.strokeText(this.displayText[2], 36, 15 + 25 * this.displayText[1]);
                    ctx.fillText(this.displayText[2], 36, 15 + 25 * this.displayText[1]);
                }
            }
        }

        if (this.pictureMode) {
            let b = (this.parent.canvas.width - 250) / 2;
            c = (this.parent.canvas.height - 150) / 2;

            ctx.lineWidth = 1;
            ctx.strokeStyle = this.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(0, 0, this.parent.canvas.width, c);
            ctx.fillRect(0, c + 150, this.parent.canvas.width, c);
            ctx.fillRect(0, c, b, 150);
            ctx.fillRect(b + 250, c, b, 150);
            ctx.strokeRect(b, c, 250, 150);
        }

    }
    erase(a) {
        function b(b) {
            (b = b.erase(a)) && l.push(b)
        }
        var c = Math.floor(a.x / this.scale - 0.5), d = Math.floor(a.y / this.scale - 0.5), e = this.grid[c], c = this.grid[c + 1], f, h, i, l = [];
        if (e !== void 0) {
            f = e[d];
            h = e[d + 1];
            if (f !== void 0) {
                if (tool.eraser.settings.physics) {
                    for (e = 0, i = f.physics.length; e < i; e++) {
                        f.physics[e] && b(f.physics[e]);
                    }
                }
                if (tool.eraser.settings.scenery) {
                    for (e = 0, i = f.scenery.length; e < i; e++) {
                        f.scenery[e] && b(f.scenery[e]);
                    }
                }
                if (tool.eraser.settings.powerups) {
                    for (e = 0, i = f.powerups.length; e < i; e++) {
                        f.powerups[e] && b(f.powerups[e]);
                    }
                }
            }
            if (h !== void 0) {
                if (tool.eraser.settings.physics) {
                    for (e = 0, i = h.physics.length; e < i; e++) {
                        h.physics[e] && b(h.physics[e]);
                    }
                }
                if (tool.eraser.settings.scenery) {
                    for (e = 0, i = h.scenery.length; e < i; e++) {
                        h.scenery[e] && b(h.scenery[e]);
                    }
                }
                if (tool.eraser.settings.powerups) {
                    for (e = 0, i = h.powerups.length; e < i; e++) {
                        h.powerups[e] && b(h.powerups[e])
                    }
                }
            }
        }
        if (c !== void 0) {
            f = c[d];
            d = c[d + 1];
            if (f !== void 0) {
                if (tool.eraser.settings.physics) {
                    for (e = 0, i = f.physics.length; e < i; e++) {
                        f.physics[e] && b(f.physics[e]);
                    }
                }
                if (tool.eraser.settings.scenery) {
                    for (e = 0, i = f.scenery.length; e < i; e++) {
                        f.scenery[e] && b(f.scenery[e]);
                    }
                }
                if (tool.eraser.settings.powerups) {
                    for (e = 0, i = f.powerups.length; e < i; e++) {
                        f.powerups[e] && b(f.powerups[e])
                    }
                }
            }
            if (d !== void 0) {
                if (tool.eraser.settings.physics) {
                    for (e = 0, i = d.physics.length; e < i; e++) {
                        d.physics[e] && b(d.physics[e]);
                    }
                }
                if (tool.eraser.settings.scenery) {
                    for (e = 0, i = d.scenery.length; e < i; e++) {
                        d.scenery[e] && b(d.scenery[e]);
                    }
                }
                if (tool.eraser.settings.powerups) {
                    for (i = d.powerups.length; e < i; e++) {
                        d.powerups[e] && b(d.powerups[e]);
                    }
                }
            }
        }
        e = 0;
        for (i = this.powerups.length; e < i; e++) {
            this.powerups[e] && this.powerups[e].removed !== void 0 && l.push(this.powerups.splice(e--, 1)[0]);
        }
        return l
    }
    addLine(a, b, c) {
        a = new (c ? SceneryLine : PhysicsLine)(a.x, a.y, b.x, b.y,this);
        if (2 <= a.len && 1E5 > a.len && (this.addLineInternal(a), "line\\scenery line\\brush\\scenery brush".split(/\\/).includes(this.toolHandler.selected))) {
            if (["line", "scenery line", "brush", "scenery brush"].includes(this.toolHandler.selected)) {
                this.parent.mouse.old.copy(this.parent.mouse.position);
            }
        }

        return a
    }
    addLineInternal(a) {
        this[a.type].push(a);
        var b = function(a, b, c) {
            var zb = {};
            zb[c] || (zb[c] = {});
            var d = a + ";" + b;
            if (zb[c][d]) {
                return zb[c][d];
            }
            var d = zb[c][d] = []
            , e = new Vector(a.x,a.y)
            , f = (b.y - a.y) / (b.x - a.x)
            , h = new Vector(a.x < b.x ? 1 : -1,a.y < b.y ? 1 : -1)
            , i = 0;
            for (d.push(a); 5E3 > i && !(Math.floor(e.x / c) === Math.floor(b.x / c) && Math.floor(e.y / c) === Math.floor(b.y / c));) {
                var l = new Vector(0 > h.x ? Math.round(Math.ceil((e.x + 1) / c + h.x) * c) - 1 : Math.round(Math.floor(e.x / c + h.x) * c),0);
                l.y = Math.round(a.y + (l.x - a.x) * f);
                var m = new Vector(0,0 > h.y ? Math.round(Math.ceil((e.y + 1) / c + h.y) * c) - 1 : Math.round(Math.floor(e.y / c + h.y) * c));
                m.x = Math.round(a.x + (m.y - a.y) / f);
                if (Math.pow(l.x - a.x, 2) + Math.pow(l.y - a.y, 2) < Math.pow(m.x - a.x, 2) + Math.pow(m.y - a.y, 2)) {
                    e = l;
                    d.push(l);
                } else {
                    e = m;
                    d.push(m);
                }
                i++
            }
            return d
        }(a.a, a.b, this.scale), c, d, e, f;
        e = 0;
        for (f = b.length; e < f; e++)
            c = Math.floor(b[e].x / this.scale),
            d = Math.floor(b[e].y / this.scale),
            this.grid[c] === void 0 && (this.grid[c] = {}),
            this.grid[c][d] === void 0 && (this.grid[c][d] = new Sector),
            a.hb ? this.grid[c][d].scenery.push(a) : this.grid[c][d].physics.push(a),
            delete this.sectors[c + "_" + d]
    }
    read(a = "-18 1i 18 1i###BMX") {
        this.parent.ctx.fillText("Loading track... Please wait.", 36, 16);
        var e = a.split("#")
          , i = e[0].split(",")
          , s = []
          , n = [];
        if (e.length > 2)
            var s = e[1].split(",")
              , n = e[2].split(",");
        else if (e.length > 1)
            var n = e[1].split(",");
        this.addLines(i, this.addLine),
        this.addLines(s, this.addLine, true);
        for (var t in n) {
            e = n[t].split(/\s+/g);
            var i, b = parseInt(e[1], 32);
            var d = parseInt(e[2], 32);
            switch (e[0]) {
                case "T":
                    i = new Target(b, d, this);
                    this.targets++;
                    this.powerups.push(i);
                    break;

                case "C":
                    i = new Checkpoint(b,d,this);
                    this.powerups.push(i);
                    break;

                case "B":
                    i = new Boost(b, d, parseInt(e[3], 32) + 180,this);
                    break;

                case "G":
                    i = new Gravity(b, d, parseInt(e[3], 32) + 180,this);
                    break;

                case "O":
                    i = new Bomb(b, d, this);
                    break;

                case "S":
                    i = new Slowmo(b, d, this);
                    break;

                case "A":
                    i = new Antigravity(b, d, this);
                    break;

                case "W":
                    i = new Teleporter(b, d, this);
                    i.tpb(parseInt(e[3], 32), parseInt(e[4], 32));
                    this.powerups.push(i);
                    break;
            }
            if (i) {
                b = Math.floor(b / this.scale);
                d = Math.floor(d / this.scale);
                if (this.grid[b] === void 0) this.grid[b] = {};
                if (this.grid[b][d] === void 0) this.grid[b][d] = new Sector;
                this.grid[b][d].powerups.push(i);
            }
        }
    }
    addLines(t, e, scenery = false) {
        for (var i = t.length, s = 0; i > s; s++) {
            var n = t[s].split(" ")
              , r = n.length;
            if (r > 3) {
                for (var o = 0; r - 2 > o; o += 2) {
                    var a = parseInt(n[o], 32)
                      , h = parseInt(n[o + 1], 32)
                      , l = parseInt(n[o + 2], 32)
                      , c = parseInt(n[o + 3], 32)
                      , u = a + h + l + c;
                    isNaN(u) || e.call(this, { x: a, y: h }, { x: l, y: c }, scenery)
                }
            }
        }
    }
    addToSelf(a, b) {
        for (var i = 0, d = a.length; i < d; i++) {
            if (a[i].type) {
                a[i] = new a[i].type(a[i].x,a[i].y,this)
            }
            if (b) {
                this.addLineInternal(a[i])
            } else {
                this.addLine(a[i].a, a[i].b, a[i].hb)
            }
        }
    }
    remove(a, b) {
        b === void 0 && (b = a);
        for (var c = function(a, b, c) {
            var zb = {};
            zb[c] || (zb[c] = {});
            var d = a + ";" + b;
            if (zb[c][d])
                return zb[c][d];
            var d = zb[c][d] = []
            , e = new Vector(a.x,a.y)
            , f = (b.y - a.y) / (b.x - a.x)
            , h = new Vector(a.x < b.x ? 1 : -1,a.y < b.y ? 1 : -1)
            , i = 0;
            for (d.push(a); 5E3 > i && !(Math.floor(e.x / c) === Math.floor(b.x / c) && Math.floor(e.y / c) === Math.floor(b.y / c)); ) {
                var l = new Vector(0 > h.x ? Math.round(Math.ceil((e.x + 1) / c + h.x) * c) - 1 : Math.round(Math.floor(e.x / c + h.x) * c),0);
                l.y = Math.round(a.y + (l.x - a.x) * f);
                var m = new Vector(0,0 > h.y ? Math.round(Math.ceil((e.y + 1) / c + h.y) * c) - 1 : Math.round(Math.floor(e.y / c + h.y) * c));
                m.x = Math.round(a.x + (m.y - a.y) / f);
                Math.pow(l.x - a.x, 2) + Math.pow(l.y - a.y, 2) < Math.pow(m.x - a.x, 2) + Math.pow(m.y - a.y, 2) ? (e = l,
                d.push(l)) : (e = m,
                d.push(m));
                i++
            }
            return d
        }(a, b, this.scale), d = [], e = 0, f = c.length; e < f; e++) {
            var h = Math.floor(c[e].x / this.scale),
                i = Math.floor(c[e].y / this.scale),
                d = d.concat(this.grid[h][i].remove());
            delete this.sectors[h + "_" + i]
        }
        e = 0;
    }
    toString() {
        let a = "", b = "", c = "";
        for (const line of this.physics)
            a += `${line.toString()},`;

        for (const line of this.scenery)
            b += `${line.toString()},`;

        for (const item of this.powerups)
            c += `${item.toString()},`;

        return a.substr(0, a.length - 1) + "#" + b.substr(0, b.length - 1) + "#" + c.substr(0, c.length - 1) + "#" + this.firstPlayer.vehicle.name;
    }
    reset() {
        this.currentTime = 0;
        for (const player of this.players)
            player.reset();
    }
}