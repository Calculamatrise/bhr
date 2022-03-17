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
    players = [];
    progress = 0;
    sprogress = 0;
    editor = false;
    paused = false;
    currentTime = 0;
    processing = true;
    collectables = [];
    freezeFrame = true;
    cameraLock = false;
    cameraFocus = null;
    pictureMode = false;
    grid = new Grid(this);
    camera = new Vector();
    zoom = .6 * window.devicePixelRatio;
    toolHandler = new ToolHandler(this);
    history = new UndoManager();
    get targets() {
        return this.collectables.filter(item => item.type === "T").length;
    }

    get firstPlayer() {
        return this.players[0];
    }

    init(vehicle = "BMX") {
        this.players.push(new Player(this, {
            vehicle: vehicle
        }));

        this.cameraFocus = this.firstPlayer.head;
    }

    zoomIn() {
        this.zoom = Math.min(Math.round(10 * this.zoom + window.devicePixelRatio * 2) / 10, window.devicePixelRatio * 4);
        for (const sector of this.grid.sectors) {
            sector.rendered = false;
        }
    }

    zoomOut() {
        this.zoom = Math.max(Math.round(10 * this.zoom - window.devicePixelRatio * 2) / 10, window.devicePixelRatio / 5);
        for (const sector of this.grid.sectors) {
            sector.rendered = false;
        }
    }

    switchBike() {
        this.firstPlayer.vehicle.name = this.firstPlayer.vehicle.name === "BMX" ? "MTB" : "BMX";
        this.reset();
        this.cameraFocus = this.firstPlayer.vehicle.head;
    }

    gotoCheckpoint() {
        this.removeCollectedItems();

        this.paused = this.parent.settings.ap;
        this.parent.container.querySelector("playpause")?.classList[this.paused ? "remove" : "add"]("playing");
        if (this.firstPlayer.snapshots.length > 0) {
            for (const player of this.players) {
                player.restore(player.snapshots[player.snapshots.length - 1]);
            }

            this.freezeFrame = this.parent.settings.ap;
            this.collectItems(this.firstPlayer.snapshots[this.firstPlayer.snapshots.length - 1].itemsCollected);
        } else {
            this.reset();
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
            if (items.has(powerup.id)) {
                powerup.used = true;
            }
        }
    }

    removeCollectedItems() {
        for (const powerup of this.collectables) {
            powerup.used = false;
        }
    }

    watchGhost(data, { id, vehicle = "BMX" } = {}) {
        let records = data.split(/\s?\u002C\s?/g).map(item => new Set(item.split(/\s+/g).filter(item => item).map(item => isNaN(+item) ? item : +item)));
        let v = Array.from(records[records.length - 1])[0];
        if (["BMX", "MTB"].includes(v.toUpperCase())) {
            vehicle = v;
        }

        this.reset();
        let player = id && this.players.find(player => player.id === +id);
        if (!player) {
            this.players.push(new Player(this, {
                records,
                vehicle
            }));

            player = this.players[this.players.length - 1];
            player.id = +id;
        }

        this.cameraFocus = player.vehicle.head;
        this.paused = false;
    }

    collide(part) {
        let x = Math.floor(part.position.x / this.grid.scale - .5);
        let y = Math.floor(part.position.y / this.grid.scale - .5);

        this.grid.sector(x, y).fix();
        this.grid.sector(x, y + 1).fix();
        this.grid.sector(x + 1, y).fix();
        this.grid.sector(x + 1, y + 1).fix();

        this.grid.sector(x, y).collide(part);
        this.grid.sector(x + 1, y).collide(part);
        this.grid.sector(x + 1, y + 1).collide(part);
        this.grid.sector(x, y + 1).collide(part);
    }

    update() {
        if (this.freezeFrame && this.parent.settings.ap && this.firstPlayer.gamepad.downKeys.size > 0) {
            this.freezeFrame = false;
            this.paused = false;
            this.parent.container.querySelector("playpause")?.classList[this.paused ? "remove" : "add"]("playing");
        }

        if (!this.paused && !this.processing) {
            for (const player of this.players) {
                player.update();
            }

            this.currentTime += this.parent.max;
        }

        if (this.cameraFocus) {
            this.camera.add(this.cameraFocus.position.difference(this.camera).scale(.3));
        }
    }

    render(ctx) {
        this.draw(ctx);
        for (const player of this.players) {
            player.draw(ctx);
        }

        if (!this.cameraFocus) {
            ctx.save();
            ctx.strokeStyle = this.parent.theme === "dark" ? "#fff" : "#000";
            this.toolHandler.draw(ctx);
            ctx.restore();
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);
        ctx.lineWidth = Math.max(2 * this.zoom, 0.5);
        ctx.lineCap = "round";

        let min = Vector.from().toCanvas(this.parent.canvas).oppositeScale(this.grid.scale).map((value) => Math.floor(value));
        let max = new Vector(this.parent.canvas.width, this.parent.canvas.height).toCanvas(this.parent.canvas).oppositeScale(this.grid.scale).map((value) => Math.floor(value));
        for (const sector of this.grid.range(min, max)) {
            if (sector.physics.length > 0 || sector.scenery.length > 0) {
                if (!sector.rendered) {
                    sector.render();
                }

                ctx.drawImage(sector.canvas, Math.floor(this.parent.canvas.width / 2 - this.camera.x * this.zoom + sector.row * this.grid.scale * this.zoom), Math.floor(this.parent.canvas.height / 2 - this.camera.y * this.zoom + sector.column * this.grid.scale * this.zoom));
            }
        }

        for (const sector of this.grid.range(min, max)) {
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
        let i = "";
        10 > e && (e = "0" + e);
        10 > h && (h = "0" + h);
        i = e + ":" + h + "." + c;
        if (this.paused && !this.parent.settings.ap) {
            i += " - Game paused";
        } else if (this.firstPlayer && this.firstPlayer.dead) {
            i = "Press ENTER to restart";
            if (this.firstPlayer.snapshots.length > 1) {
                i += " or BACKSPACE to cancel Checkpoint"
            }
        } else if (this.id === void 0) {
            if (this.grid.size === 10 && new Set(["line", "brush"]).has(this.toolHandler.selected)) {
                i += " - Grid ";
            }

            i += " - " + this.toolHandler.selected;
            if (this.toolHandler.selected === "brush") {
                i += " ( size " + this.toolHandler.currentTool.length + " )";
            }
        }

        if (this.processing) {
            i = "Loading, please wait... " + Math.floor((this.progress + this.sprogress) / 2);
        }

        ctx.strokeText(i = ": " + this.firstPlayer.targetsCollected + " / " + this.targets + "  -  " + i, 55, 16);
        ctx.fillText(i, 55, 16);
        if (this.players.length > 1) {
            for (let p = 1; p < this.players.length; p++) {
                ctx.textAlign = "right",
                ctx.fillStyle = this.parent.theme === "dark" ? "#999" : "#aaa",
                ctx.strokeText(i = (this.players[p].name || "Ghost") + (this.players[p].targetsCollected === this.targets ? " finished!" : ": " + this.players[p].targetsCollected + " / " + this.targets), this.parent.canvas.width - 7, 16 * p + (p * 4));
                ctx.fillText(i, this.parent.canvas.width - 7, 16 * p + (p * 4)),
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
        let x = Math.floor(vector.x / this.grid.scale - 0.5);
        let y = Math.floor(vector.y / this.grid.scale - 0.5);
        let cache = [];

        cache.push(...this.grid.sector(x, y).erase(vector));
        cache.push(...this.grid.sector(x, y + 1).erase(vector));
        cache.push(...this.grid.sector(x + 1, y).erase(vector));
        cache.push(...this.grid.sector(x + 1, y + 1).erase(vector));

        return cache;
    }
    
    addLine(start, end, type) {
        const line = new (type ? SceneryLine : PhysicsLine)(start.x, start.y, end.x, end.y, this);
        if (line.len >= 2 && line.len < 1e5) {
            this.addLineInternal(line);
            if (new Set(["line", "brush"]).has(this.toolHandler.selected)) {
                this.parent.mouse.old.set(this.parent.mouse.position);
            }
        }

        this.history.push({
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

    // Fix this garbage.
    read(a = "-18 1i 18 1i###BMX") {
        this.parent.ctx.fillText("Loading track... Please wait.", 36, 16);
        
        a = a.split("#");
        this.processLines(a[0].split(","));
        this.processLines(a[1].split(","), 1);
        for (let powerup of a[2].split(",")) {
            powerup = powerup.split(/\s+/g);
            let x = parseInt(powerup[1], 32);
            let y = parseInt(powerup[2], 32);
            let a = parseInt(powerup[3], 32);
            let b = parseInt(powerup[4], 32);
            switch(powerup[0]) {
                case "T":
                    powerup = new Target(this, x, y);
                    this.collectables.push(powerup);
                    break;

                case "C":
                    powerup = new Checkpoint(this, x, y);
                    this.collectables.push(powerup);
                    break;

                case "B":
                    powerup = new Boost(this, x, y, a + 180);
                    break;

                case "G":
                    powerup = new Gravity(this, x, y, a + 180);
                    break;

                case "O":
                    powerup = new Bomb(this, x, y);
                    break;

                case "S":
                    powerup = new Slowmo(this, x, y);
                    break;

                case "A":
                    powerup = new Antigravity(this, x, y);
                    break;

                case "W":
                    powerup = new Teleporter(this, x, y);
                    powerup.createAlt(a, b);
                    this.collectables.push(powerup);
                    break;
            }

            if (powerup) {
                x = Math.floor(x / this.grid.scale);
                y = Math.floor(y / this.grid.scale);
                this.grid.sector(x, y, true).powerups.push(powerup);
            }
        }
    }

    // This breaks ghosts (order of lines matter.)
    processLines(array, scenery = false) {
        let index = 0;
        function processChunk() {
            let chunk = 100;
            while (chunk-- && index < array.length) {
                let line = array[index].split(/\s+/g);
                if (line.length < 4) {
                    return;
                }

                for (let o = 0; o < line.length - 2; o += 2) {
                    let a = parseInt(line[o], 32),
                        h = parseInt(line[o + 1], 32),
                        l = parseInt(line[o + 2], 32),
                        c = parseInt(line[o + 3], 32),
                        u = a + h + l + c;
                    isNaN(u) || this.addLine({ x: a, y: h }, { x: l, y: c }, scenery)
                }
                ++index;
            }

            if (index < array.length) {
                this.processing = true;
                this[(scenery ? "s" : "") + "progress"] = index * 100 / array.length
                setTimeout(() => processChunk.call(this), 0);
                return;
            }

            this.processing = false;
        }

        processChunk.call(this);
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
        this.removeCollectedItems();
        for (const sector of this.grid.sectors) {
            sector.fix();
        }

        for (const player of this.players) {
            player.reset();
        }

        if (this.parent.settings.ap) {
            this.freezeFrame = true;
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