export default class Sector {
    constructor() {
        this.physics = [];
        this.scenery= [];
        this.powerups = []
    }
    collide(a) {
        for (var b = this.physics.length - 1; 0 <= b; b--) {
            this.physics[b].collide(a);
        }
        if (!a.parent.dead) {
            for (b = this.powerups.length - 1; 0 <= b; b--) {
                this.powerups[b].collide(a);
            }
        }
        return this;
    }
    za() {
        for (var a = 0, b = this.physics.length; a < b; a++) {
            this.physics[a].yb = !1;
        }
    }
    remove() {
        for (var a = [], b = 0, c = this.physics.length; b < c; b++) {
            this.physics[b] && this.physics[b].Remove && a.push(this.physics.splice(b--, 1)[0]);
        }
        b = 0;
        for (c = this.scenery.length; b < c; b++) {
            this.scenery[b] && this.scenery[b].Remove && a.push(this.scenery.splice(b--, 1)[0]);
        }
        b = 0;
        for (c = this.powerups.length; b < c; b++) {
            this.powerups[b] && this.powerups[b].Remove && a.push(this.powerups.splice(b--, 1)[0]);
        }
        return a
    }
    search(a, b) {
        var c = 0, d, e, f = "sline" === b ? this.scenery: this.physics;
        for (d = f.length; c < d; c++) {
            if ((e = f[c]) && e.a.x === a.x && e.a.y === a.y && !e.ma) {
                return e;
            }
        }
    } 
}