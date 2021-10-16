import Shard from "./Shard.js";

import BodyPart from "../bike/part/Entity.js";

export default class Explosion {
    constructor(parent, part) {
        this.parent = parent;
        this.position = part.position.clone();
        this.motor = 30 + 20 * Math.random();

        this.head = new BodyPart(this.position, this);
        this.head.velocity.x = 20;
        this.shards = [
            new Shard(this.parent, this.position),
            new Shard(this.parent, this.position),
            new Shard(this.parent, this.position),
            new Shard(this.parent, this.position),
            new Shard(this.parent, this.position)
        ]
    }
    draw(ctx) {
        var a, b;
        if (0 < this.motor) {
            this.motor -= 10;
            b = this.position.toPixel();
            var e = b.x + this.motor / 2 * Math.cos(Math.random() * 2 * Math.PI)
            , d = b.y + this.motor / 2 * Math.sin(Math.random() * 2 * Math.PI);
            ctx.save();
            ctx.fillStyle = "#ff0";
            ctx.beginPath(),
            ctx.moveTo(b.x + this.motor / 2 * Math.cos(Math.random() * 2 * Math.PI), d);
            for (a = 1; 16 > a; a++) {
                d = (this.motor + 30 * Math.random()) / 2,
                e = b.x + d * Math.cos(Math.random() * 2 * Math.PI + 2 * Math.PI * a / 16),
                d = b.y + d * Math.sin(Math.random() * 2 * Math.PI + 2 * Math.PI * a / 16),
                ctx.lineTo(e, d);
            }
            ctx.fill();
            ctx.restore();
        }
        a = 0;
        for (const shard of this.shards) {
            shard.draw(ctx);
        }
    }
    update(delta) {
        for (const shard of this.shards) {
            shard.update(delta);
        }
    }
}