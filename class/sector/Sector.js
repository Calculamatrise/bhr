export default class Sector {
    constructor(parent, row, column) {
        this.parent = parent;
        this.row = row;
        this.column = column;
    }

    physics = []
    scenery = []
    powerups = []
    render(parent, x, y) {
        const canvas = document.createElement("canvas");
        canvas.width = parent.scale * parent.zoom;
        canvas.height = parent.scale * parent.zoom;

        const context = canvas.getContext("2d");
        context.lineCap = "round";
        context.lineWidth = Math.max(2 * parent.zoom, 0.5);
        context.strokeStyle = parent.parent.theme === "dark" ? "#999" : "#aaa";
        for (const line of this.scenery) {
            line.draw(context, x * parent.scale * parent.zoom, y * parent.scale * parent.zoom);
        }

        context.strokeStyle = parent.parent.theme === "dark" ? "#fff" : "#000";
        for (const line of this.physics) {
            line.draw(context, x * parent.scale * parent.zoom, y * parent.scale * parent.zoom);
        }

        return canvas;
    }

    fix() {
        for (const line of this.physics) {
            line.collided = false;
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

    search(vector, type) {
        for (const line of type === "scenery" ? this.scenery : this.physics) {
            if (line.a.x === vector.x && line.a.y === vector.y) {
                return line;
            }
        }
    }

    delete() {
        if (!this.parent.rows.has(this.row)) {
            return true;
        }

        return this.parent.rows.get(this.row).delete(this.column);
    }
}