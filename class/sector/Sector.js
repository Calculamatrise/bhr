export default class Sector {
    physics = []
    scenery= []
    powerups = []
    fix() {
        for (const line of this.physics) {
            line.collided = !1;
        }
    }

    collide(part) {
        for (const line of this.physics) {
            line.collide(part);
        }

        if (!part.parent.dead) {
            for (const powerup of this.powerups) {
                powerup.collide(part);
            }
        }

        return this;
    }

    remove() {
        let a = []

        for (let b = 0; b < this.physics.length; b++) {
            this.physics[b] && this.physics[b].removed && a.push(this.physics.splice(b--, 1)[0]);
        }

        for (let b = 0; b < this.scenery.length; b++) {
            this.scenery[b] && this.scenery[b].removed && a.push(this.scenery.splice(b--, 1)[0]);
        }

        for (let b = 0; b < this.powerups.length; b++) {
            this.powerups[b] && this.powerups[b].removed && a.push(this.powerups.splice(b--, 1)[0]);
        }

        return a;
    }

    search(a, type) {
        for (const line of type === "scenery" ? this.scenery: this.physics) {
            if (line.a.x === a.x && line.a.y === a.y && !line.ma) {
                return line;
            }
        }
    } 
}