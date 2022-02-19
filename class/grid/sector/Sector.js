export default class {
    constructor(parent, row, column) {
        this.parent = parent;
        this.row = row;
        this.column = column;
    }
    physics = [];
    scenery = [];
    powerups = [];
    rendered = false;
    canvas = document.createElement("canvas");
    render() {
        this.canvas.width = this.parent.scale * this.parent.scene.zoom;
        this.canvas.height = this.parent.scale * this.parent.scene.zoom;

        const ctx = this.canvas.getContext("2d");
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(2 * this.parent.scene.zoom, 0.5);
        ctx.strokeStyle = this.parent.scene.parent.theme === "dark" ? "#999" : "#aaa";
        for (const line of this.scenery) {
            line.draw(ctx, this.row * this.parent.scale * this.parent.scene.zoom, this.column * this.parent.scale * this.parent.scene.zoom);
        }

        ctx.strokeStyle = this.parent.scene.parent.theme === "dark" ? "#fff" : "#000";
        for (const line of this.physics) {
            line.draw(ctx, this.row * this.parent.scale * this.parent.scene.zoom, this.column * this.parent.scale * this.parent.scene.zoom);
        }

        this.rendered = true;

        return this.canvas;
    }

    fix() {
        for (let line = 0; line < this.physics.length; line++) {
            this.physics[line].collided = false;
        }
    }

    collide(part) {
        for (let line = this.physics.length - 1; 0 <= line; line--) {
            this.physics[line].collide(part);
        }

        if (!part.parent.dead) {
            for (let powerup = this.powerups.length - 1; 0 <= powerup; powerup--) {
                this.powerups[powerup].collide(part);
            }
        }

        return this;
    }

    remove() {
        let a = []
        for (const line in this.physics) {
            this.physics[line].removed && a.push(this.physics.splice(line, 1)[0]);
        }

        for (const line in this.scenery) {
            this.scenery[line].removed && a.push(this.scenery.splice(line, 1)[0]);
        }

        for (const powerup in this.powerups) {
            this.powerups[powerup].removed && a.push(this.powerups.splice(powerup, 1)[0]);
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