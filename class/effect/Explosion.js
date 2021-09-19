export default class Explosion {
    constructor(a, b, c, d, e = []) {
        this.dead = !0;
        this.track = d;
        this.checkpoints = e;
        this.motor = 30 + 20 * Math.random();
        this.Vb = 0;
        this.$a = [
            new Shard(a,this),
            new Shard(a,this),
            new Shard(a,this),
            new Shard(a,this),
            new Shard(a,this)
        ];
        this.pos = a.clone();
        this.gravity = b;
        this.time = c;
        this.head = new BodyPart(a, this);
        this.head.vel.x = 20
    }
    draw() {
        var a, b;
        if (0 < this.motor) {
            this.motor -= 10;
            b = this.pos.toPixel();
            var e = b.x + this.motor / 2 * Math.cos(Math.random() * 2 * Math.PI)
            , d = b.y + this.motor / 2 * Math.sin(Math.random() * 2 * Math.PI);
            ctx.fillStyle = "#ff0";
            ctx.beginPath(),ctx.moveTo(b.x + this.motor / 2 * Math.cos(Math.random() * 2 * Math.PI), d);
            for (a = 1; 16 > a; a++) {
                d = (this.motor + 30 * Math.random()) / 2,
                e = b.x + d * Math.cos(Math.random() * 2 * Math.PI + 2 * Math.PI * a / 16),
                d = b.y + d * Math.sin(Math.random() * 2 * Math.PI + 2 * Math.PI * a / 16),
                ctx.lineTo(e, d);
            }
            ctx.fill()
        }
        a = 0;
        for (b = this.$a.length; a < b; a++)
            this.$a[a].draw()
    }
    update() {
        for (var a = this.$a.length - 1; 0 <= a; a--)
            this.$a[a].update()
    }
}