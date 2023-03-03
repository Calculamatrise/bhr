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

export default class {
	cache = new Map();
	old = 'camera';
	selected = 'camera';
	constructor(parent) {
		this.scene = parent;
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
		this.cache.set('trianglepowerup', new TrianglePowerup(this));
	}

	get currentTool() {
		if (['antigravity', 'bomb', 'boost', 'checkpoint', 'goal', 'gravity', 'slow-mo', 'teleporter'].includes(this.selected)) {
			if (['boost', 'gravity'].includes(this.selected)) {
				return this.cache.get('trianglepowerup');
			}

			return this.cache.get('powerup');
		}

		return this.cache.get(this.selected);
	}

	get ctx() {
		return this.scene.parent.ctx;
	}

	setTool(name, style = null) {
		this.old = this.selected;
		this.selected = name;
		if (style !== null) {
			this.currentTool.scenery = style;
		}

		let settings = this.scene.parent.container.querySelector('bhr-game-toolbar')?.querySelector(".left .tool-settings");
		settings !== null && settings.style.setProperty('display', ['brush', 'circle', 'eraser'].includes(this.selected) ? 'block' : 'none');
		settings = settings.querySelector('div[data-id=eraser]');
		settings !== null && settings.style.setProperty('display', this.selected == 'eraser' ? 'block' : 'none');

		this.scene.parent.canvas.style.setProperty('cursor', name == 'camera' ? 'move' : 'none');
	}

	scroll(event) {
		this.currentTool.scroll(event);
	}

	press(event) {
		this.currentTool.press(event);
	}

	stroke(event) {
		this.currentTool.stroke(event);
	}

	clip(event) {
		this.currentTool.clip(event);
	}

	update() {
		this.currentTool.update();
	}

	draw(ctx) {
		this.currentTool.draw(ctx);
	}
}