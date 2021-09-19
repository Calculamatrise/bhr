import Track from "./track/Track.js";
import Player from "./Player.js";
import MTB from "./bike/MTB.js";
import BMX from "./bike/BMX.js";

const bike = {
    MTB: MTB,
    BMX: BMX
}

export default class {
    constructor(t) {
        this.track = new Track(t);
        this.track.players.push(this.track.firstPlayer = new bike[this.track.vehicle](this.track));
        this.track.cameraFocus = this.track.firstPlayer.head;
        this.update = [];
        this.render = [];
        this.update.push((t) => this.track.update(t));
        this.render.push(() => this.track.render());
        this.fps = 25;
        this.lastFrameTime = -1;
        this.animationFrame = null;
    }
    startTicker(time) {
        this.delta = time - this.lastFrameTime;
        if (this.delta < (1000 / this.fps)) {
            for (var a = this.render.length; a--;) {
                this.render[a]()
            }
            this.animationFrame = requestAnimationFrame(this.startTicker.bind(this));
            return;
        }
        for (var a = this.update.length; a--;) {
            this.update[a](this.delta)
        }
        for (var a = this.render.length; a--;) {
            this.render[a]()
        }
        this.lastFrameTime = time;
        this.animationFrame = requestAnimationFrame(this.startTicker.bind(this));
    }
    close() {
        cancelAnimationFrame(this.animationFrame);
    }
    static get Track() {
        return this.track;
    }
}