import ClientPlayer from "../player/ClientPlayer.js";
import GhostPlayer from "../player/GhostPlayer.js";
import Grid from "../grid/Grid.js";
import CameraHandler from "../handler/Camera.js";
import ToolHandler from "../handler/Tool.js";
import Track from "./track/Track.js";
import Coordinates from "../Coordinates.js";

// implement Track class w/ draw/move/scale/flip methods etc..
export default class {
	camera = new CameraHandler(this);
	currentTime = 0;
	discreteEvents = new Set();
	frozen = false;
	ghosts = [];
	grid = new Grid(this);
	paused = false;
	pictureMode = false;
	players = [];
	state = 'readonly'; // playable? ready?
	toolHandler = new ToolHandler(this);
	track = new Track(this);
	constructor(parent) {
		Object.defineProperty(this, 'parent', { value: parent || null });
		Object.defineProperty(this, 'firstPlayer', { value: null, writable: true });
	}

	#transformMode = false;
	get transformMode() { return this.#transformMode }
	set transformMode(value) {
		this.#transformMode = value;
		if (!value) {
			const cameraTool = this.toolHandler.cache.get('camera');
			cameraTool.trackOffset.length > 0 && this.moveTrack(cameraTool.trackOffset);
		} else {
			this.toolHandler.setTool('camera');
			this.reset()
		}
	}

	get timeText() {
		let t = (this.ghostInFocus ? this.ghostInFocus.playbackTicks : (this.currentTime / this.parent.max)) / .03;
		return Math.floor(t / 6e4) + ':' + String((t % 6e4 / 1e3).toFixed(2)).padStart(5, '0')
	}

	get ghostInFocus() {
		return this.ghosts.find(({ hitbox }) => hitbox == this.camera.focusPoint)
	}

	init(options = {}) {
		options = Object.assign({ vehicle: 'BMX' }, arguments[0]);
		if (!/^bmx|mtb$/i.test(options.vehicle)) {
			throw new TypeError("Invalid vehicle type.");
		}

		'id' in options && (this.id = options.id);
		this.grid.rows.clear();
		this.track.clear();
		this.ghosts.splice(0);
		this.firstPlayer && this.firstPlayer.gamepad.close();
		this.players.splice(0);
		this.players.push(new ClientPlayer(this, { vehicle: options.vehicle }));
		this.track.writable = options.write ?? this.track.writable;
		this.toolHandler.setTool(this.track.writable ? 'line' : 'camera');
		this.reset()
	}

	calculateRemainingDistance(player) {
		const targets = this.track.powerupTypes['T'];
		const nearestTargets = targets.sort((a, b) => a.position.distanceTo(player.hitbox.position) - b.position.distanceTo(player.hitbox.position));
		const consumedTargets = nearestTargets.filter(item => player.consumablesUsed.has(item.id));
		const lastConsumedTargetId = player.consumablesUsed.size > 0 && player.consumablesUsed.values().toArray().filter(itemId => targets.find(({ id }) => id === itemId)).at(-1);
		const lastConsumedTarget = lastConsumedTargetId && consumedTargets.find(({ id }) => id === lastConsumedTargetId) || { position: new Coordinates(0, 0) };
		const unusedTargets = nearestTargets.filter(item => !consumedTargets.includes(item));
		const nearestTarget = unusedTargets.length > 0 && unusedTargets[0];
		const goal = nearestTarget && lastConsumedTarget.position.distanceTo(nearestTarget.position);
		const progress = nearestTarget && player.hitbox.position.distanceTo(nearestTarget.position);
		return progress / goal
	}

	checkpoint() {
		this.paused = false;
		this.parent.emit('stateChange', this.paused);
		this.parent.settings.autoPause && (this.frozen = true);
		this.camera.focusPoint = this.firstPlayer.hitbox;
		this.camera.set(this.camera.focusPoint.position)
	}

	returnToCheckpoint(noemit) {
		let checkpointExists = this.firstPlayer.gotoCheckpoint();
		if (checkpointExists) {
			for (const playerGhost of this.ghosts) {
				playerGhost.gotoCheckpoint();
			}
		} else {
			this.reset();
		}

		this.checkpoint();
		noemit || this.parent.emit('checkpoint')
	}

	removeCheckpoint() {
		this.firstPlayer.removeCheckpoint();
		for (const playerGhost of this.ghosts) {
			playerGhost.removeCheckpoint();
		}

		this.returnToCheckpoint(true);
		this.parent.emit('removeCheckpoint')
	}

	restoreCheckpoint() {
		this.firstPlayer.restoreCheckpoint();
		for (const playerGhost of this.ghosts) {
			playerGhost.restoreCheckpoint();
		}

		this.returnToCheckpoint(true);
		this.parent.emit('restoreCheckpoint')
	}

	watchGhost(data, { id, vehicle = 'BMX' } = {}) {
		let parts = data.trim().split(/\s*,\s*/g);
		let v = parts.pop();
		let time = parts.at(-1);
		/^(BMX|MTB)$/i.test(v) && (vehicle = v);
		let records = parts.map(item => item.split(/\s+/g).reduce((newArr, arr) => isNaN(arr) ? arr : newArr.add(parseInt(arr)), new Set()));
		let player = id && this.ghosts.find(player => player.id == id);
		if (!id || !player) {
			player = new GhostPlayer(this, {
				records,
				time,
				vehicle
			});
			player.id = id;
			this.ghosts.push(player);
		}

		this.reset();
		this.camera.focusPoint = player.hitbox;
		this.camera.set(this.camera.focusPoint.position);
		this.frozen = false;
		this.paused = false;
		this.parent.emit('replayQueued', player, ...arguments)
	}

	fixedUpdate() {
		this.parent.settings.autoPause && this.firstPlayer.gamepad.downKeys.size > 0 && (this.frozen = false);
		if (!this.paused && !this.track.processing && !this.frozen) {
			for (const player of this.players) {
				player.fixedUpdate();
			}

			for (const playerGhost of this.ghosts.filter(ghostPlayer => ghostPlayer.targetsCollected !== this.track.targets)) {
				playerGhost.playbackIterator.next();
				// playerGhost.fixedUpdate();
			}

			this.currentTime += this.parent.max;
			// this.currentTime++
		}

		for (const event of this.discreteEvents) {
			switch (event) {
			case 'PAUSE':
				this.paused = true;
				this.parent.emit('stateChange', this.paused);
				break;
			case 'UNPAUSE':
				this.paused = false;
				this.frozen = false;
				this.parent.emit('stateChange', this.paused)
			}

			this.discreteEvents.delete(event)
		}
	}

	update(progress, delta) {
		if (!this.paused && !this.track.processing && !this.frozen) {
			for (const player of this.players.filter(player => player.targetsCollected !== this.track.targets)) {
				player.update(...arguments);
			}

			for (const playerGhost of this.ghosts.filter(ghostPlayer => ghostPlayer.targetsCollected !== this.track.targets)) {
				playerGhost.update(...arguments);
			}
		}

		this.camera.focusPoint && this.camera.add(this.camera.focusPoint.position.difference(this.camera).scale(delta / 100));
	}

	nativeUpdate(delta) {
		this.parent.settings.autoPause && this.firstPlayer.gamepad.downKeys.size > 0 && (this.frozen = false);
		if (!this.paused && !this.track.processing && !this.frozen) {
			for (const player of this.players) {
				player.nativeUpdate();
			}

			for (const playerGhost of this.ghosts.filter(ghostPlayer => ghostPlayer.targetsCollected !== this.track.targets)) {
				playerGhost.playbackIterator.next();
			}

			this.currentTime += this.parent.max;
			// this.currentTime++
		}

		this.camera.focusPoint && this.camera.add(this.camera.focusPoint.position.difference(this.camera).scale(delta / 125))
	}

	render(ctx) {
		this.draw(ctx);
		if (!this.transformMode) {
			for (const playerGhost of this.ghosts) {
				playerGhost.draw(ctx);
			}

			for (let i = this.players.length - 1; i >= 0; i--) {
				this.players[i].draw(ctx);
			}
		}

		this.camera.focusPoint || this.toolHandler.draw(ctx)
	}

	draw(ctx) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		this.track.draw(ctx);
		if (this.pictureMode) {
			const imageData = ctx.getImageData(ctx.canvas.width / 2 - this.pictureMode.width / 2, ctx.canvas.height / 2 - this.pictureMode.height / 2, this.pictureMode.width, this.pictureMode.height);
			ctx.save();
			ctx.fillStyle = 'hsla(0, 0%, 0%, 0.4)';
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			ctx.lineWidth = 2;
			ctx.strokeRect(ctx.canvas.width / 2 - this.pictureMode.width / 2 - ctx.lineWidth / 2, ctx.canvas.height / 2 - this.pictureMode.height / 2 - ctx.lineWidth / 2, this.pictureMode.width + ctx.lineWidth, this.pictureMode.height + ctx.lineWidth);
			ctx.putImageData(imageData, ctx.canvas.width / 2 - this.pictureMode.width / 2, ctx.canvas.height / 2 - this.pictureMode.height / 2);
			ctx.fillStyle = 'red';
			let fontSize = Math.max(12, Math.min(16, Math.min(ctx.canvas.width, ctx.canvas.height) * (4 / 100)));
			ctx.font = fontSize + 'px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'top';
			ctx.fillText('Use your mouse to drag & fit an interesting part of your track in the thumbnail', ctx.canvas.width / 2, ctx.canvas.height * (2 / 100));
			ctx.restore();
		} else if (!this.transformMode) {
			// // centered timer
			// ctx.save()
			// // ctx.font = '16px Arial';
			// ctx.textAlign = 'center';
			// ctx.fillText(this.timeText, ctx.canvas.width / 2, 10);
			// ctx.restore()

			// replace with message display system
			let i = this.timeText;
			if (this.track.processing) {
				i = "Loading, please wait... " + Math.floor((this.track.physicsProgress + this.track.sceneryProgress) / 2);
			} else if (this.paused) {
				i += " - Game paused";
			} else if (this.firstPlayer && this.firstPlayer.dead && this.camera.focusPoint == this.firstPlayer.hitbox) {
				i = "Press ENTER to restart";
				if (this.firstPlayer.snapshots.length > 1) {
					i += " or BACKSPACE to cancel Checkpoint"
				}
			} else if (this.track.writable) {
				i += " - " + this.toolHandler.selected.replace(/^\w/, char => char.toUpperCase());
				if (this.toolHandler.selected === 'brush') {
					i += " ( size " + this.toolHandler.currentTool.length + " )";
				}
			}

			let text = ctx.measureText(i)
			const goalRadius = (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 2;
			const left = 12;
			const rectPadding = 5;
			ctx.beginPath()
			ctx.roundRect(left - goalRadius / 2, 12 - goalRadius / 2 - rectPadding, text.width + rectPadding * 2, goalRadius + rectPadding * 2, 40);
			ctx.save()
			ctx.fillStyle = 'hsl(0deg 0% 50% / 50%)'
			ctx.fill()
			ctx.restore()
			ctx.fillText(i, left + rectPadding / 2, 12)
			ctx.save()

			// add target progress bar
			const progressHeight = 4;
			const progressWidth = Math.max(150, ctx.canvas.width / 10);
			ctx.beginPath();
			ctx.roundRect(ctx.canvas.width / 2 - progressWidth / 2, 12 - rectPadding, progressWidth, progressHeight + rectPadding * 2, 40);
			ctx.save();
			ctx.fillStyle = 'hsl(0deg 0% 50% / 50%)';
			ctx.fill();
			const playerInFocus = this.camera.focusPoint === this.firstPlayer.hitbox ? this.firstPlayer : this.ghostInFocus;
			if (playerInFocus) {
				const maxWidth = progressWidth - 4;
				const valueWidth = maxWidth * (this.firstPlayer.targetsCollected / this.track.targets);
				const targets = this.track.powerupTypes['T'];
				const quadrantWidth = maxWidth / targets.length;
				const calculatedDistanceRemaining = targets.length > 0 && playerInFocus && this.calculateRemainingDistance(playerInFocus);
				const predictedAdditionalValueWidth = calculatedDistanceRemaining && Math.max(0, Math.min(quadrantWidth, quadrantWidth - calculatedDistanceRemaining * quadrantWidth));
				ctx.beginPath();
				ctx.roundRect(ctx.canvas.width / 2 - progressWidth / 2 + rectPadding / 2, 14 - rectPadding, valueWidth + predictedAdditionalValueWidth, progressHeight - 4 + rectPadding * 2, 40);
				ctx.fillStyle = 'hsl(40deg 50% 50% / 50%)';
				ctx.fill();
			}

			ctx.restore();
			const targetProgress = this.firstPlayer.targetsCollected + ' / ' + this.track.targets;
			const targetProgressText = ctx.measureText(targetProgress);
			ctx.fillText(this.firstPlayer.targetsCollected + ' / ' + this.track.targets, ctx.canvas.width / 2 - targetProgressText.width / 2, 14);

			if (this.ghosts.length > 0) {
				ctx.save();
				ctx.textAlign = 'right';
				for (const index in this.ghosts) {
					let playerGhost = this.ghosts[index];
					i = (playerGhost.name || 'Ghost') + (playerGhost.targetsCollected === this.track.targets ? " finished!" : ": " + playerGhost.targetsCollected + " / " + this.track.targets);
					text = ctx.measureText(i)
					let textHeight = text.actualBoundingBoxAscent + text.actualBoundingBoxDescent;
					let rectPadding = 5;
					ctx.beginPath()
					ctx.roundRect(ctx.canvas.width - 12 - text.width - rectPadding, 12 + textHeight * index + index * 12 - textHeight / 2 - rectPadding, text.width + rectPadding * 2, (text.fontBoundingBoxAscent + text.fontBoundingBoxDescent) / 2 + rectPadding * 2, 40);
					ctx.save()
					ctx.fillStyle = 'hsl(0deg 0% 50% / 50%)' // if ghost is in focus, make it apparent
					ctx.fill()
					ctx.restore()
					ctx.fillText(i, ctx.canvas.width - 12, 12 + textHeight * index + index * 12)
				}

				ctx.restore()
			}
		}
	}

	reset() {
		this.currentTime = 0;
		for (const player of this.players) {
			player.reset(...arguments);
		}

		for (const playerGhost of this.ghosts) {
			playerGhost.reset();
		}

		this.camera.focusPoint = this.firstPlayer.hitbox;
		this.camera.set(this.camera.focusPoint.position);
		this.paused = false;
		this.parent.settings.autoPause && (this.frozen = true);
		this.parent.emit('sceneReset', this)
	}
}