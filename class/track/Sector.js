export default class Sector {
    constructor() {
        this.physics = [];
        this.scenery= [];
        this.powerups = []
    }
    collide(t) {
        for (const e of this.physics) {
            e.collide(t);
        }
        if (!t.parent.dead) {
            for (const e of this.powerups) {
                e.collide(t);
            }
        }
        return this;
    }
    za() {
        for (const t of this.physics) {
            t.yb = !1;
        }
    }
    remove() {
        const t = [];
        for (let e = 0; e < this.physics.length; e++) {
            this.physics[e] && this.physics[e].Remove && t.push(this.physics.splice(e--, 1)[0]);
        }
        for (let e = 0; e < this.scenery.length; e++) {
            this.scenery[e] && this.scenery[e].Remove && t.push(this.scenery.splice(e--, 1)[0]);
        }
        for (let e = 0; e < this.powerups.length; e++) {
            this.powerups[e] && this.powerups[e].Remove && t.push(this.powerups.splice(e--, 1)[0]);
        }
        return t;
    }
    search(a, b) {
        let e, f = b === "sline" ? this.scenery: this.physics;
        for (let c = 0; c < f.length; c++) {
            if ((e = f[c]) && e.a.x === a.x && e.a.y === a.y && !e.ma) {
                return e;
            }
        }
    } 
}