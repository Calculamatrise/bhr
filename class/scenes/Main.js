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
	camera = new Vector();
	cameraLock = false;
    cameraFocus = null;
    collectables = [];
	currentTime = 0;
    editor = false;
	freezeFrame = true;
	grid = new Grid(this);
	history = new UndoManager();
	parent = null;
	paused = false;
    pictureMode = false;
	players = [];
	processing = true;
	progress = 0;
    sprogress = 0;
	toolHandler = new ToolHandler(this);
    zoom = .6 * window.devicePixelRatio;
    constructor(parent, { id = null, code = "-18 1i 18 1i###BMX" } = {}) {
        this.parent = parent;
        this.id = id;
        this.editor = !this.id;
        if (this.editor) {
            this.toolHandler.setTool('line');
        }

        this.read(code);
    }

    get targets() {
        return this.collectables.filter(({ type }) => type === 'T').length;
    }

	get timeText() {
		let t = this.currentTime / this.parent.max / .03;
		return Math.floor(t / 6e4) + ':' + String((t % 6e4 / 1e3).toFixed(2)).padStart(5, '0');
	}

    get firstPlayer() {
        return this.players[0] ?? null;
    }

    init(vehicle = 'BMX') {
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
        this.firstPlayer.vehicle.name = this.firstPlayer.vehicle.name == 'BMX' ? 'MTB' : 'BMX';
        this.reset();
        this.cameraFocus = this.firstPlayer.vehicle.head;
    }

    gotoCheckpoint() {
        this.paused = this.parent.settings.ap;
        this.parent.container.querySelector('.playpause > input').checked = !this.paused;
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
                player.snapshots.cache.push(player.snapshots.pop());
            }
        }

        this.gotoCheckpoint();
    }

    restoreCheckpoint() {
        for (const player of this.players) {
            if (player.snapshots.cache.length > 0) {
                player.snapshots.push(player.snapshots.cache.pop());
            }
        }

        this.gotoCheckpoint();
    }

    collectItems(items) {
        for (const powerup of this.collectables) {
			powerup.used = items.has(powerup.id);
        }
    }

    removeCollectedItems() {
        for (const powerup of this.collectables) {
            powerup.used = false;
        }
    }

    watchGhost(data, { id, vehicle = 'BMX' } = {}) {
        const records = data.split(/\s*,\s*/g).map(item => item.split(/\s+/g).reduce((newArr, arr) => isNaN(arr) ? arr : newArr.add(parseInt(arr)), new Set()));
        const v = records.at(-1);
        if (['BMX', 'MTB'].includes(v.toUpperCase())) {
            vehicle = v;
        }

        this.reset();
        let player = id && this.players.find(player => player.id == id);
        if (!player) {
			player = new Player(this, {
                records,
                vehicle
            });
            player.id = id;
            this.players.push(player);
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
            this.parent.container.querySelector('.playpause > input').checked = !this.paused;
        }

        if (!this.paused && !this.processing) {
            for (const player of this.players) {
                player.update();
            }

            this.currentTime += this.parent.max;
			// this.currentTime++
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
            ctx.strokeStyle = this.parent.settings.theme === "dark" ? "#fff" : "#000";
			if (!this.processing) {
            	this.toolHandler.draw(ctx);
			}

            ctx.restore();
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.parent.canvas.width, this.parent.canvas.height);
        ctx.lineWidth = Math.max(2 * this.zoom, 0.5);
        ctx.lineCap = 'round';

        let min = new Vector().toCanvas(this.parent.canvas).oppositeScale(this.grid.scale).map(Math.floor);
        let max = new Vector(this.parent.canvas.width, this.parent.canvas.height).toCanvas(this.parent.canvas).oppositeScale(this.grid.scale).map(Math.floor);
        let sectors = this.grid.range(min, max);
		for (const sector of sectors) {
            if (sector.physics.length > 0 || sector.scenery.length > 0) {
                if (!sector.rendered) {
                    sector.render();
                }

                ctx.drawImage(sector.canvas, Math.floor(this.parent.canvas.width / 2 - this.camera.x * this.zoom + sector.row * this.grid.scale * this.zoom), Math.floor(this.parent.canvas.height / 2 - this.camera.y * this.zoom + sector.column * this.grid.scale * this.zoom));
            }
        }

        for (const sector of sectors) {
            for (const powerup of sector.powerups) {
                powerup.draw(ctx);
            }
        }

		ctx.textBaseline = 'middle',
        ctx.fillStyle = '#'.padEnd(7, this.parent.settings.theme == 'dark' ? 'fb' : '0'),
        ctx.strokeStyle = '#'.padEnd(7, this.parent.settings.theme == 'dark' ? '1b' : 'f');

        let i = this.timeText;
        if (this.paused && !this.parent.settings.ap) {
            i += " - Game paused";
        } else if (this.firstPlayer && this.firstPlayer.dead) {
            i = "Press ENTER to restart";
            if (this.firstPlayer.snapshots.length > 1) {
                i += " or BACKSPACE to cancel Checkpoint"
            }
        } else if (this.id === void 0) {
            if (this.grid.size === 10 && ['line', 'brush'].includes(this.toolHandler.selected)) {
                i += " - Grid ";
            }

            i += " - " + this.toolHandler.selected;
            if (this.toolHandler.selected === 'brush') {
                i += " ( size " + this.toolHandler.currentTool.length + " )";
            }
        }

        if (this.processing) {
            i = "Loading, please wait... " + Math.floor((this.progress + this.sprogress) / 2);
        }

		i = `${this.firstPlayer.targetsCollected} / ${this.targets}  -  ${i}`
		const text = ctx.measureText(i)
		const goalRadius = (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 2;
		const goalStrokeWidth = 1;
		ctx.save();
		let rect = roundedRect.call(ctx, 45 - goalRadius, 12 - goalRadius / 2, text.width + goalRadius + goalStrokeWidth / 2 + 10, goalRadius, 40, {
			padding: 5
		});
		ctx.clip(),
		ctx.filter = 'blur(10px)',
		ctx.drawImage(ctx.canvas, rect.x, rect.y, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height);
		ctx.filter = 'none',
		ctx.fillStyle = 'rgba(128,128,128,0.4)',
		ctx.fill(),
		ctx.restore();
        ctx.fillText(i, 55, 12);
		ctx.save(),
		ctx.beginPath(),
        ctx.lineWidth = goalStrokeWidth,
        ctx.fillStyle = '#ff0',
		ctx.strokeStyle = this.parent.settings.theme == 'dark' ? '#fbfbfb' : '#000';
        ctx.arc(45, 12, goalRadius / 1.5, 0, 2 * Math.PI),
        ctx.fill(),
        ctx.stroke(),
		ctx.restore();
        if (this.players.length > 1) {
            for (var p = 1, player = this.players[p]; p < this.players.length; player = this.players[++p]) {
				i = (player.name || 'Ghost') + (player.targetsCollected === this.targets ? " finished!" : ": " + player.targetsCollected + " / " + this.targets);
				const text = ctx.measureText(i)
				ctx.save();
				let rect = roundedRect.call(ctx, ctx.canvas.width - text.width - 40, 8 * (p - 1) + (p * 12) - (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 4, text.width, (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 2, 40, {
					padding: 5
				});
				ctx.clip(),
				ctx.filter = 'blur(10px)',
				ctx.drawImage(ctx.canvas, rect.x, rect.y, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height);
				ctx.filter = 'none',
				ctx.fillStyle = 'rgba(128,128,128,0.4)',
				ctx.fill(),
				ctx.restore();
				ctx.save(),
				ctx.textAlign = 'right';
				ctx.fillText(i, ctx.canvas.width - 40, 8 * (p - 1) + (p * 12));
				ctx.restore();
            }
        }

        if (this.pictureMode) {
            let b = (this.parent.canvas.width - 250) / 2;
            c = (this.parent.canvas.height - 150) / 2;
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.parent.settings.theme == 'dark' ? '#1b1b1b' : '#fff';
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
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
        return [
			...this.grid.sector(x, y).erase(vector),
			...this.grid.sector(x, y + 1).erase(vector),
			...this.grid.sector(x + 1, y).erase(vector),
			...this.grid.sector(x + 1, y + 1).erase(vector)
		]
    }

    addLine(start, end, type) {
        const line = new (type ? SceneryLine : PhysicsLine)(start.x, start.y, end.x, end.y, this);
        if (line.len >= 2 && line.len < 1e5) {
            this.addLineInternal(line);
            if (['line', 'brush'].includes(this.toolHandler.selected)) {
                this.parent.mouse.old.set(this.parent.mouse.position);
            }

			if (arguments[3] !== false) {
				this.history.push({
					undo: line.remove.bind(line),
					redo: () => this.addLineInternal(line)
				});
			}

			return line;
        }
    }

    addLineInternal(line) {
        for (const sector of this.grid.findTouchingSectors(line.a, line.b)) {
            sector[line.type].push(line);
            sector.rendered = false;
		}
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
                    isNaN(u) || this.addLine({ x: a, y: h }, { x: l, y: c }, scenery, false)
                }
                ++index;
            }

            if (index < array.length) {
                this.processing = true;
                this[(scenery ? 's' : '') + 'progress'] = index * 100 / array.length
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

function roundedRect(x, y, width, height, radius = 0, options = {}) {
	if ('padding' in options) {
		x -= options.padding;
		y -= options.padding;
		width += options.padding * 2;
		height += options.padding * 2;
	}

	radius = Math.min(width / 2, height / 2, radius);
	this.beginPath();
	this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.arcTo(x + width, y, x + width, y + radius, radius);
    this.lineTo(x + width, y + height - radius);
    this.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    this.lineTo(x + radius, y + height);
    this.arcTo(x, y + height, x, y + height - radius, radius);
    this.lineTo(x, y + radius, x, y, radius);
    this.arcTo(x, y, x + radius, y, radius);
	return { x, y, width, height }
}