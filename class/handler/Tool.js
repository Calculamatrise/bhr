import Line from "../tools/Line.js";
import Brush from "../tools/Brush.js";
import Camera from "../tools/Camera.js";
import Circle from "../tools/Circle.js";
import Curve from "../tools/Curve.js";
import Ellipse from "../tools/Ellipse.js";
import Eraser from "../tools/Eraser.js";
import Powerup from "../tools/Powerup.js";
import Rectangle from "../tools/Rectangle.js";
import Select from "../tools/Select.js";
import TrianglePowerup from "../tools/TrianglePowerup.js";
import Teleporter from "../tools/Teleporter.js";

export default class {
	cache = new Map();
	old = 'camera';
	selected = 'camera';
	constructor(parent) {
		Object.defineProperty(this, 'scene', { value: parent, writable: true });
		this.cache.set('brush', new Brush(this));
		this.cache.set('camera', new Camera(this));
		this.cache.set('circle', new Circle(this));
		this.cache.set('curve', new Curve(this));
		this.cache.set('ellipse', new Ellipse(this));
		this.cache.set('eraser', new Eraser(this));
		this.cache.set('line', new Line(this));
		this.cache.set('powerup', new Powerup(this));
		this.cache.set('rectangle', new Rectangle(this));
		this.cache.set('select', new Select(this));
		this.cache.set('teleporter', new Teleporter(this));
		this.cache.set('trianglepowerup', new TrianglePowerup(this));
	}

	get currentTool() {
		if (['antigravity', 'bomb', 'boost', 'checkpoint', 'goal', 'gravity', 'slow-mo'].includes(this.selected)) {
			if (['boost', 'gravity'].includes(this.selected)) {
				return this.cache.get('trianglepowerup');
			}

			return this.cache.get('powerup');
		}

		return this.cache.get(this.selected);
	}

	_handleEvent(event) {
		if (this.scene.track.processing && event.type !== 'pointermove') return;
		switch(event.type.toLowerCase()) {
		case 'pointerdown':
			this.currentTool.press(event);
			break;
		case 'pointermove':
			this.currentTool.stroke(event);
			break;
		case 'pointerup':
			this.currentTool.clip(event);
			break;
		case 'wheel':
			this.currentTool.scroll(event)
		}
	}

	draw(ctx) {
		this.currentTool.draw(ctx);
		if (this.scene.parent.mouse.active && /^(brush|circle|curve|ellipse|line|rectangle|select)$/i.test(this.selected)) {
			let position = this.scene.parent.mouse.rawPosition;
			ctx.beginPath();
			ctx.moveTo(position.x - 10 * window.devicePixelRatio, position.y);
			ctx.lineTo(position.x + 10 * window.devicePixelRatio, position.y);
			ctx.moveTo(position.x, position.y + 10 * window.devicePixelRatio);
			ctx.lineTo(position.x, position.y - 10 * window.devicePixelRatio);
			ctx.save();
			this.scene.track.processing && (ctx.globalAlpha /= 2);
			ctx.lineWidth = 2 * window.devicePixelRatio;
			ctx.stroke();
			ctx.restore()
		}
	}

	setTool(name, style = null) {
		this.old = this.selected;
		this.selected = name;
		if (style !== null) {
			this.currentTool.scenery = style;
		}

		this.currentTool.update();
		this.scene.parent.canvas.style.setProperty('cursor', name == 'camera' ? 'move' : 'none');
		this.scene.parent.emit('currentToolChange', this.currentTool)
	}

	update() {
		this.currentTool.update();
	}
}