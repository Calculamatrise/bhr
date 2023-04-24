import Game from "./class/Game.js";

window.game = new Game(document.querySelector('#view'));

const upload = document.querySelector('#upload');
if (upload !== null) {
	upload.addEventListener('click', function () {
		const code = game.scene.toString();
		if (code.length < 1e3) {
			return alert("Sorry, but your track must be bigger or more detailed.");
		} else if (game.scene.targets < 1) {
			return alert("Sorry, but your track must have at least 1 target!");
		}

		// add 'collaborators' input
		game.scene.paused = true;
		game.scene.toolHandler.setTool('camera');
		game.scene.pictureMode = {width: 250, height: 150};
		game.scene.zoom = 0.6 * window.devicePixelRatio;
		game.scene.grid.sectors.forEach(sector => sector.rendered = false);
		document.getElementById('track_menu')?.style.setAttribute('display', 'none');
		this.replaceWith(createElement('div', {
			children: [
				createElement('input', {
					id: 'title',
					placeholder: 'Title',
					type: 'text',
					onkeydown: event => event.stopPropagation(),
					onkeypress: event => event.stopPropagation(),
					onkeyup: event => event.stopPropagation()
				}),
				createElement('textarea', {
					id: 'description',
					placeholder: 'Description',
					rows: 4,
					onkeydown: event => event.stopPropagation(),
					onkeypress: event => event.stopPropagation(),
					onkeyup: event => event.stopPropagation()
				}),
				createElement('select', {
					children: [
						createElement('option', {
							disabled: true,
							innerText: 'Visibility'
						}),
						createElement('option', {
							innerText: 'Public',
							value: 'public'
						}),
						createElement('option', {
							innerText: 'Private',
							value: 'private'
						})
					],
					id: 'visibility',
					style: {
						width: '-webkit-fill-available'
					}
				}),
				createElement('button', {
					innerText: 'Publish',
					onclick() {
						const title = document.querySelector('#track_menu #title');
						if (title.value.length < 4)
							return alert("The track name is too short!");

						const description = document.querySelector('#track_menu #description');
						if (description.value.length < 16)
							return alert("The track description is too short!");

						const visibility = document.querySelector('#track_menu #visibility');
						const canvas = document.createElement('canvas');
						canvas.width = 250;
						canvas.height = 150;
						const ctx = canvas.getContext('2d');
						ctx.fillStyle = game.canvas.computedStyleMap().get('background-color').toString();
						ctx.fillRect(0, 0, canvas.width, canvas.height);
						ctx.drawImage(game.canvas, game.canvas.width / 2 - canvas.width / 2, game.canvas.height / 2 - canvas.height / 2, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
						game.scene.pictureMode = false;
						this.disabled = true;
						fetch('/draw/upload', {
							method: 'post',
							body: new URLSearchParams({
								name: title.value,
								code,
								description: description.value,
								display: visibility.value,
								thumbnail: canvas.toDataURL('image/jpeg')
							})
						}).then(r => r.text()).then(r => {
							if (+r === 1) {
								location.href = '/';
							} else {
								this.disabled = false;
								document.write("Something went wrong!");
							}
						});
					}
				})
			],
			id: 'track_menu',
			style: {
				display: 'flex',
				flexDirection: 'column'
			}
		}));
	});

	function createElement(type, options) {
		const callback = arguments[arguments.length - 1];
		const element = document.createElement(type);
		if ('innerText' in options) {
			element.innerText = options.innerText;
			delete options.innerText;
		}

		for (const attribute in options) {
			if (typeof options[attribute] == 'object') {
				if (options[attribute] instanceof Array) {
					if (/^children$/i.test(attribute)) {
						element.append(...options[attribute]);
					} else if (/^on/i.test(attribute)) {
						for (const listener of options[attribute]) {
							element.addEventListener(attribute.slice(2), listener);
						}
					}
				} else if (/^style$/i.test(attribute)) {
					Object.assign(element[attribute.toLowerCase()], options[attribute]);
				}

				delete options[attribute];
			}
		}

		Object.assign(element, options);
		return typeof callback == 'function' && callback(element), element;
	}
}