import Player from "../Player.js";

import ToolHandler from "../handler/Tool.js";
import UndoManager from "../managers/Undo.js";

import Vector from "../Vector.js";
import PhysicsLine from "../grid/sector/PhysicsLine.js";
import SceneryLine from "../grid/sector/SceneryLine.js";

import Grid from "../grid/Grid.js";

import Target from "../item/Target.js";
import Checkpoint from "../item/Checkpoint.js";
import Bomb from "../item/Bomb.js";
import Boost from "../item/Boost.js";
import Gravity from "../item/Gravity.js";
import Antigravity from "../item/Antigravity.js";
import Slowmo from "../item/Slowmo.js";
import Teleporter from "../item/Teleporter.js";

export default class {
    constructor(parent, { id = null, code = "-18 1i 18 1i###BMX" }) {
        this.parent = parent;
        this.id = id;
        this.editor = !this.id;
        if (this.editor) {
            this.toolHandler.setTool("line");
        }

        this.read(code);
    }

    targets = 0;
    players = [];
    editor = false;
    currentTime = 0;
    collectables = [];
    pictureMode = false;
    cameraLock = false;
    cameraFocus = null;
    grid = new Grid(this);
    camera = new Vector();
    zoom = 0.6 * window.devicePixelRatio;
    toolHandler = new ToolHandler(this);
    undoManager = new UndoManager();
    get firstPlayer() {
        return this.players[0];
    }

    #paused = false;
    get paused() {
        return this.#paused;
    }

    set paused(value) {
        this.#paused = value;
        if (!value) {
            return;
        }

        this.firstPlayer.gamepad.record();
    }

    init(players = [{ vehicle: "BMX" }]) {
        for (const player of players) {
            this.players.push(new Player(this, {
                vehicle: player.vehicle
            }));
        }

        this.cameraFocus = this.firstPlayer.head;
    }

    zoomIn() {
        if (this.zoom < 4 * window.devicePixelRatio) {
            this.zoom = Math.round(10 * this.zoom + window.devicePixelRatio * 2) / 10;
            for (const sector of this.grid.sectors) {
                sector.rendered = false;
            }
        }
    }

    zoomOut() {
        if (this.zoom > .2 * window.devicePixelRatio) {
            this.zoom = Math.round(10 * this.zoom - window.devicePixelRatio * 2) / 10;
            for (const sector of this.grid.sectors) {
                sector.rendered = false;
            }
        }
    }
    
    switchBike() {
        this.firstPlayer.vehicle.name = this.firstPlayer.vehicle.name === "BMX" ? "MTB" : "BMX";
        this.reset();
        this.cameraFocus = this.firstPlayer.vehicle.head;
    }

    gotoCheckpoint() {
        this.removeCollectedItems();

        this.paused = false; // JSON.parse(localStorage.pauseOnEnter) ? true : false;
        this.parent.container.querySelector("playpause")?.classList[this.paused ? "remove" : "add"]("playing");
        if (this.firstPlayer.snapshots.length > 0) {
            let snapshot = this.firstPlayer.snapshots[this.firstPlayer.snapshots.length - 1];
            this.currentTime = snapshot.currentTime;

            this.firstPlayer.restore(snapshot);

            this.collectItems(snapshot.powerupsConsumed);
        } else {
            for (const player of this.players) {
                player.reset();
            }

            this.currentTime = 0;
        }

        this.cameraFocus = this.firstPlayer.vehicle.head,
        this.camera = this.firstPlayer.vehicle.head.position.clone();
    }

    removeCheckpoint() {
        for (const player of this.players) {
            if (player.snapshots.length > 0) {
                if (player.snapshots.cache !== void 0) {
                    player.snapshots.cache.push(player.snapshots[player.snapshots.length - 1]);
                }

                player.snapshots.pop();
            }
        }

        this.gotoCheckpoint();
    }

    restoreCheckpoint() {
        for (const player of this.players) {
            if (player.snapshots.cache.length > 0) {
                if (player.snapshots !== void 0) {
                    player.snapshots.push(player.snapshots.cache[player.snapshots.cache.length - 1]);
                }
                
                player.snapshots.cache.pop();
            }
        }

        this.gotoCheckpoint();
    }

    collectItems(items) {
        for (const powerup of this.collectables) {
            if (items.includes(powerup.id)) {
                powerup.used = true;
            }
        }
    }

    removeCollectedItems() {
        for (const powerup of this.collectables) {
            powerup.used = false;
        }
    }

    watchGhost(data, { vehicle = "BMX" } = {}) {
        data = data.split(/\u002C+/g).map(key => Object.fromEntries(key.split(/\s+/g).filter(keys => keys).map(input => [ input, 1 ])));

        let v = Object.keys(data[data.length - 1])[0];
        if (["BMX", "MTB"].includes(v.toUpperCase())) {
            vehicle = v;
        }

        this.reset();
        this.players.push(new Player(this, {
            ghost: data,
            vehicle
        }));
        this.cameraFocus = this.players[this.players.length - 1].vehicle.head;

        this.paused = false;
    }

    collide(part) {
        const x = Math.floor(part.position.x / this.grid.scale - .5);
        const y = Math.floor(part.position.y / this.grid.scale - .5);
        this.grid.sector(x, y).fix();
        this.grid.sector(x, y + 1).fix();
        this.grid.sector(x + 1, y).fix();
        this.grid.sector(x + 1, y + 1).fix();
        this.grid.sector(x, y).collide(part);
        this.grid.sector(x, y + 1).collide(part);
        this.grid.sector(x + 1, y).collide(part);
        this.grid.sector(x + 1, y + 1).collide(part);

        return this;
    }
    
    update(delta) {
        if (!this.paused) {
            for (const player of this.players) {
                player.update(delta);
            }

            this.currentTime += 1e3 / 25;
        }

        if (this.cameraFocus) {
            this.camera.addToSelf(this.cameraFocus.position.sub(this.camera).scale(.3));
        }

        return this;
    }

    render(ctx) {
        this.draw(ctx);
        for (const player of this.players) {
            player.draw(ctx);
        }
        
        if (!this.cameraFocus) {
            ctx.save();
            ctx.strokeStyle = this.parent.theme === "dark" ? "#fff" : "#000";
            this.toolHandler.currentTool && this.toolHandler.currentTool.draw(ctx);
            ctx.restore();
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);
        ctx.lineWidth = Math.max(2 * this.zoom, 0.5);

        let position = this.parent.mouse.position.toPixel();
        let old = this.parent.mouse.old.toPixel();
        if (this.cameraLock && ["line", "brush", "teleporter"].includes(this.toolHandler.selected)) {
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
            
            ctx.save(),
            ctx.beginPath(),
            ctx.strokeStyle = "#f00",
            ctx.moveTo(old.x, old.y),
            ctx.lineTo(position.x, position.y),
            ctx.stroke(),
            ctx.restore();
        }

        let i = new Vector().toCanvas(this.parent.canvas).oppositeScale(this.grid.scale).floor();
        let l = new Vector(this.parent.canvas.width, this.parent.canvas.height).toCanvas(this.parent.canvas).oppositeScale(this.grid.scale).floor();
        for (const sector of this.grid.range(i, l)) {
            if (sector.physics.length > 0 || sector.scenery.length > 0) {
                if (!sector.rendered) {
                    sector.render();
                }

                ctx.drawImage(sector.canvas, Math.floor(this.parent.canvas.width / 2 - this.camera.x * this.zoom + sector.row * this.grid.scale * this.zoom), Math.floor(this.parent.canvas.height / 2 - this.camera.y * this.zoom + sector.column * this.grid.scale * this.zoom));
            }

            for (const powerup of sector.powerups) {
                powerup.draw(ctx);
            }
        }
        
        ctx.beginPath(),
        ctx.lineWidth = 1,
        ctx.fillStyle = "#ff0",
        ctx.arc(45, 12, 3.5, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.stroke();

        ctx.beginPath(),
        ctx.lineWidth = 10,
        ctx.strokeStyle = this.parent.theme === "dark" ? "#1b1b1b" : "#fff",
        ctx.fillStyle = this.parent.theme === "dark" ? "#fbfbfb" : "#000";

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
            if (this.grid.size === 10 && ["line", "brush"].includes(this.toolHandler.selected)) {
                i += " - Grid ";
            }

            i += " - " + this.toolHandler.selected;
            if (this.toolHandler.selected === "brush") {
                i += " ( size " + this.toolHandler.currentTool.length + " )";
            }
        }

        ctx.strokeText(i = ": " + this.firstPlayer.targetsCollected + " / " + this.targets + "  -  " + i, 55, 16);
        ctx.fillText(i, 55, 16);
        if (this.players.length > 1) {
            for (i = 1; i < this.players.length; i++) {
                ctx.textAlign = "right",
                ctx.fillStyle = this.parent.theme === "dark" ? "#999" : "#aaa",
                ctx.strokeText(i = (this.players[i].name || "Ghost") + (this.players[i].targetsCollected === this.targets ? " finished!" : ": " + this.players[i].targetsCollected + " / " + this.targets), this.parent.canvas.width - 7, 16);
                ctx.fillText(i, this.parent.canvas.width - 7, 16),
                ctx.textAlign = "left",
                ctx.fillStyle = this.parent.theme === "dark" ? "#fbfbfb" : "#000";
            }
        }

        if (this.pictureMode) {
            let b = (this.parent.canvas.width - 250) / 2;
            c = (this.parent.canvas.height - 150) / 2;

            ctx.lineWidth = 1;
            ctx.strokeStyle = this.parent.theme === "dark" ? "#1b1b1b" : "#fff";
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(0, 0, this.parent.canvas.width, c);
            ctx.fillRect(0, c + 150, this.parent.canvas.width, c);
            ctx.fillRect(0, c, b, 150);
            ctx.fillRect(b + 250, c, b, 150);
            ctx.strokeRect(b, c, 250, 150);
        }

    }

    erase(vector) {
        let l = []
        let x = Math.floor(vector.x / this.grid.scale - 0.5);
        let y = Math.floor(vector.y / this.grid.scale - 0.5);
        let physics = []
        let scenery = []
        let powerups = []
        let sector1 = this.grid.sector(x, y);
        let sector2 = this.grid.sector(x, y + 1);
        let sector3 = this.grid.sector(x + 1, y);
        let sector4 = this.grid.sector(x + 1, y + 1);
        physics.push(...sector1.physics, ...sector2.physics, ...sector3.physics, ...sector4.physics);
        scenery.push(...sector1.scenery, ...sector2.scenery, ...sector3.scenery, ...sector4.scenery);
        powerups.push(...sector1.powerups, ...sector2.powerups, ...sector3.powerups, ...sector4.powerups);
        if (this.toolHandler.currentTool.settings.physics) {
            for (let line of physics) {
                (line = line.erase(vector)) && l.push(line);
            }
        }

        if (this.toolHandler.currentTool.settings.scenery) {
            for (let line of scenery) {
                (line = line.erase(vector)) && l.push(line);
            }
        }

        if (this.toolHandler.currentTool.settings.powerups) {
            for (let powerup of powerups) {
                (powerup = powerup.erase(vector)) && l.push(powerup);
            }
        }

        for (const powerup in this.collectables) {
            this.collectables[powerup].removed !== void 0 && l.push(...this.collectables.splice(powerup, 1));
        }

        return l;
    }
    
    addLine(start, end, type) {
        const line = new (type ? SceneryLine : PhysicsLine)(start.x, start.y, end.x, end.y, this);
        if (line.len >= 2 && line.len < 1e5) {
            this.addLineInternal(line);
            if (["line", "brush"].includes(this.toolHandler.selected)) {
                this.parent.mouse.old.copy(this.parent.mouse.position);
            }
        }

        this.undoManager.push({
            undo: line.remove.bind(line),
            redo: () =>  this.addLineInternal(line)
        });

        return line;
    }

    addLineInternal(line) {
        let b = function(a, b, c) {
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
            for (d.push(a); 5E3 > i && !(Math.floor(e.x / c) === Math.floor(b.x / c) && Math.floor(e.y / c) === Math.floor(b.y / c)); i++) {
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
            }
            return d
        }(line.a, line.b, this.grid.scale), c, d;
        for (let e = 0; e < b.length; e++)
            c = Math.floor(b[e].x / this.grid.scale),
            d = Math.floor(b[e].y / this.grid.scale),
            this.grid.sector(c, d, true)[line.type].push(line),
            this.grid.sector(c, d).rendered = false;
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
        this.addLines(s, this.addLine, 1);
        for (var t in n) {
            e = n[t].split(/\s+/g);
            var i, b = parseInt(e[1], 32);
            var d = parseInt(e[2], 32);
            switch (e[0]) {
                case "T":
                    i = new Target(this, b, d);
                    this.targets++;
                    this.collectables.push(i);
                    break;

                case "C":
                    i = new Checkpoint(this, b, d);
                    this.collectables.push(i);
                    break;

                case "B":
                    i = new Boost(this, b, d, parseInt(e[3], 32) + 180);
                    break;

                case "G":
                    i = new Gravity(this, b, d, parseInt(e[3], 32) + 180);
                    break;

                case "O":
                    i = new Bomb(this, b, d);
                    break;

                case "S":
                    i = new Slowmo(this, b, d);
                    break;

                case "A":
                    i = new Antigravity(this, b, d);
                    break;

                case "W":
                    i = new Teleporter(this, b, d);
                    i.createAlt(parseInt(e[3], 32), parseInt(e[4], 32));
                    this.collectables.push(i);
                    break;
            }

            if (i) {
                b = Math.floor(b / this.grid.scale);
                d = Math.floor(d / this.grid.scale);
                this.grid.sector(b, d, true).powerups.push(i);
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
            for (d.push(a); 5E3 > i && !(Math.floor(e.x / c) === Math.floor(b.x / c) && Math.floor(e.y / c) === Math.floor(b.y / c)); i++) {
                var l = new Vector(0 > h.x ? Math.round(Math.ceil((e.x + 1) / c + h.x) * c) - 1 : Math.round(Math.floor(e.x / c + h.x) * c),0);
                l.y = Math.round(a.y + (l.x - a.x) * f);
                var m = new Vector(0,0 > h.y ? Math.round(Math.ceil((e.y + 1) / c + h.y) * c) - 1 : Math.round(Math.floor(e.y / c + h.y) * c));
                m.x = Math.round(a.x + (m.y - a.y) / f);
                Math.pow(l.x - a.x, 2) + Math.pow(l.y - a.y, 2) < Math.pow(m.x - a.x, 2) + Math.pow(m.y - a.y, 2) ? (e = l,
                d.push(l)) : (e = m,
                d.push(m));
            }
            
            return d
        }(a, b, this.grid.scale), d = [], e = 0, f = c.length; e < f; e++) {
            var h = Math.floor(c[e].x / this.grid.scale),
                i = Math.floor(c[e].y / this.grid.scale),
                d = d.concat(this.grid.sector(h, i).remove());
            this.grid.sector(h, i).rendered = false;
        }
    }

    reset() {
        this.currentTime = 0;
        for (const sector of this.grid.sectors) {
            sector.fix();
        }

        for (const player of this.players) {
            player.reset();
        }
    }

    toString() {
        let physics = [];
        let scenery = [];
        let powerups = [];
        for (const sector of this.grid.sectors) {
            physics.push(...sector.physics);
            scenery.push(...sector.scenery);
            powerups.push(...sector.powerups);
        }

        return physics.map(line => line.toString()).join(",") + "#" + scenery.map(line => line.toString()).join(",") + "#" + powerups.map(powerup => powerup.toString()).join(",") + "#" + this.firstPlayer.vehicle.name;
    }
}