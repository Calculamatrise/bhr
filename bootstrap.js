import Game from "./class/Game.js";

window.game = new Game(document.querySelector('#view'));
window.game.on('cameraFocus', function(player) {
	let progress = document.querySelector('.replay-progress');
	progress && index === 0 ? progress.style.setProperty('display', 'none') : (progress.style.removeProperty('display'),
	progress.setAttribute('max', player.parent.parent.runTime ?? 100),
	progress.setAttribute('value', player.parent.parent.playbackTicks));
});

window.game.on('compiling', function() {
	'code' in window && (code.disabled = true);
});

window.game.on('currentToolChange', function(currentTool) {
	let selected = window.game.scene.toolHandler.selected;
	let powerups = document.querySelector('#powerups');
	powerups !== null && powerups.style.setProperty('display', /^(antigravity|bo(mb|ost)|checkpoint|g(oal|ravity)|slow-mo|teleporter)$/i.test(selected) ? 'contents' : 'none');

	let settings = document.querySelector('bhr-game-toolbar #tool-settings');
	settings !== null && (settings.style.setProperty('display', /^(brush|camera|circle|eraser)$/i.test(selected) ? 'contents' : 'none'),
	settings = settings.querySelector('div[data-id=eraser]'),
	settings.style.setProperty('display', selected == 'eraser' ? 'contents' : 'none'));

	let toolUIButton = document.querySelector(`.toolbar-item${currentTool.scenery ? '.scenery' : ''}.${selected} > input[type=radio]`);
	toolUIButton !== null && (toolUIButton.checked = true);
});

window.game.on('export', function(trackCode) {
	'code' in window && (code.disabled = false,
	code.value = trackCode);
	trackdialog.showModal();
});

window.game.on('gridStateChange', function(enabled) {
	let gridUIButton = document.querySelector('.grid > input')
	gridUIButton !== null && (gridUIButton.checked = enabled);
});

window.game.on('replayProgress', function(progress) {
	let progressElement = document.querySelector('.replay-progress');
	progressElement && progressElement.setAttribute('value', progress);
});

window.game.on('replayQueued', function(player) {
	let progress = document.querySelector('.replay-progress');
	progress && (progress.style.removeProperty('display'),
	progress.setAttribute('max', player.runTime ?? 100),
	progress.setAttribute('value', player.ticks));
});

window.game.on('sceneReset', function(scene) {
	let progress = document.querySelector('.replay-progress');
	progress && (scene.camera.focusPoint === scene.firstPlayer.vehicle.hitbox ? progress.style.setProperty('display', 'none') : (progress.style.removeProperty('display'),
	progress.setAttribute('max', scene.camera.focusPoint.parent.parent.runTime ?? 100),
	progress.setAttribute('value', scene.camera.focusPoint.parent.parent.ticks)));
});

window.game.on('settingsChange', settings => {
	let element;
	for (const setting in settings) {
		let value = settings[setting];
		switch (setting) {
		case 'autoSaveInterval':
		case 'brightness':
			(element = document.getElementById('game-settings.' + setting.replace(/([A-Z])/g, '-$1').toLowerCase())) && (element.value = value);
			break;
		case 'theme':
			let stylesheet = document.querySelector('#game-theme');
			let updateStylesheet = href => stylesheet && href !== stylesheet.href && stylesheet.setAttribute('href', href);
			(element = document.getElementById('game-settings.' + value)) && (element.checked = true);
			'system' === value && (value = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
			updateStylesheet(stylesheet.href.replace(/[^/]*(\.css)$/, `${value}$1`));
			break;
		default:
			if (typeof value != 'boolean') continue;
			(element = document.getElementById('game-settings.' + setting.replace(/([A-Z])/g, '-$1').toLowerCase())) && (element.checked = value);
		}
	}
});

window.game.on('stateChange', function(paused) {
	const playPauseButton = document.querySelector('.playpause > input');
	if (playPauseButton !== null) {
		playPauseButton.checked = !paused;
	}
});

window.game.on('trackComplete', async function(payload) {
	// check current leaderboard to compare the times
	// let leaderboard = document.querySelector('.track-leaderboard');
	// if (leaderboardTime > payload.time) {
	// 	let overwrite = confirm("You did not beat your best time. Would you like to overwrite your ghost anyway?");
	// 	if (!overwrite) {
	// 		return;
	// 	}

	// 	payload.overwrite = overwrite;
	// }

	const response = await fetch("/api/tracks/ghosts/save", {
		body: new URLSearchParams(payload),
		method: 'post'
	}).then(r => r.text());
	if (response == '1') {
		// update leaderboard
		alert("Ghost saved!");
	} else {
		alert("Something went wrong. Your ghost has not been saved. Keep this somewhere safe if you wish to keep your ghost!\n\n" + JSON.stringify(payload));
	}
});

'code' in window && code.addEventListener('paste', function(event) {
	const text = event.clipboardData.getData('text');
	if (!/^([\w\s,-]*#){2}[\w\s,-]*(#\w*)?$/.test(text)) return;
	if (text.length > 5e4) {
		event.preventDefault();
		confirm("Would you like to load the track you pasted? (" + Math.floor(text.length / 1e3) + "k)") && window.game.init({ code: text, write: true });
		'trackdialog' in window && trackdialog.close();
		const overlayCheckbox = document.querySelector('.bhr-game-overlay > input');
		overlayCheckbox !== null && (overlayCheckbox.checked = false);
		return;
	}
});

document.addEventListener('keyup', function(event) {
	switch(event.key.toLowerCase()) {
	case 'escape':
		event.preventDefault();
		const overlayCheckbox = document.querySelector('.bhr-game-overlay > input');
		overlayCheckbox !== null && (overlayCheckbox.checked = !overlayCheckbox.checked,
		window.game.scene.paused = overlayCheckbox.checked)
	}
});

// document.addEventListener('pointerlockchange', () => {
// 	if (!document.pointerLockElement) {
// 		const overlayCheckbox = document.querySelector('.bhr-game-overlay > input');
// 		overlayCheckbox !== null && (overlayCheckbox.checked = !overlayCheckbox.checked,
// 		window.game.scene.paused = overlayCheckbox.checked)
// 	}
// }, { passive: true });