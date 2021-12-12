export const canvas = document.querySelector("#view");

import Game from "./class/Game.js";

export default window.game = new Game(document.querySelector("#view"));

localStorage.setItem("theme", localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

document.addEventListener("keydown", function(event) {
    event.preventDefault();
    
    switch(event.key.toLowerCase()) {
        case "backspace":
            window.game.track.removeCheckpoint();
            window.game.track.gotoCheckpoint();
            break;

        case "enter":
            window.game.track.gotoCheckpoint();
            break;

        case ".":
            window.game.track.removeCheckpointUndo();
            window.game.track.gotoCheckpoint();
            break;

        case "f":
        case "F11":
            document.fullscreenElement ? document.exitFullscreen() : window.game.container.requestFullscreen();
            break;

        case "-":
            window.game.track.zoomOut();
            break;

        case "+":
        case "=":
            window.game.track.zoomIn();
            break;

        case "z":
            if (!window.game.track.cameraFocus) {
                if (window.game.track.id === void 0) {
                    if (event.ctrlKey) {
                        window.game.track.undoManager.redo();

                        break;
                    }

                    window.game.track.undoManager.undo();
                }

                if (window.autoPause) {
                    window.game.track.paused = false, window.autoPause = false
                }
            }

            break;

        case " ":
            window.game.track.paused = window.autoPause ? true : !window.game.track.paused,
            window.game.container.querySelector("playpause")?.classList[window.game.track.paused ? "remove" : "add"]("playing"),
            window.autoPause = false;
            break;
    }

    if (window.game.track.editor) {
        if (window.game.track.firstPlayer) {
            window.game.track.cameraFocus = window.game.track.firstPlayer.vehicle.head;
        }

        switch(event.key) {
            case "a":
                if (window.game.track.toolHandler.selected !== "brush" || window.game.track.toolHandler.currentTool.scenery) {
                    window.game.track.toolHandler.setTool("brush");
                    window.game.track.toolHandler.currentTool.scenery = !1;
                    canvas.style.cursor = "none";
                } else if (!window.game.track.cameraLock) {
                    window.game.track.cameraLock = true;
                }

                break;

            case "s":
                if (window.game.track.toolHandler.selected !== "scenery brush" || !window.game.track.toolHandler.currentTool.scenery) {
                    window.game.track.toolHandler.setTool("brush");
                    window.game.track.toolHandler.currentTool.scenery = !0;
                    canvas.style.cursor = "none";
                } else if (!window.game.track.cameraLock) {
                    window.game.track.cameraLock = true;
                }

                break;

            case "q":
                if (window.game.track.toolHandler.selected !== "line" || window.game.track.toolHandler.currentTool.scenery) {
                    window.game.track.toolHandler.setTool("line");
                    window.game.track.toolHandler.currentTool.scenery = !1;
                    canvas.style.cursor = "none";
                } else if (!window.game.track.cameraLock) {
                    window.game.track.cameraLock = true;
                }

                break;

            case "w":
                if (window.game.track.toolHandler.selected !== "scenery line" || !window.game.track.toolHandler.currentTool.scenery) {
                    window.game.track.toolHandler.setTool("line");
                    window.game.track.toolHandler.currentTool.scenery = !0;
                    canvas.style.cursor = "none";
                } else if (!window.game.track.cameraLock) {
                    window.game.track.cameraLock = true;
                }

                break;

            case "e":
                window.game.track.toolHandler.setTool("eraser");
                canvas.style.cursor = "none";
                break;

            case "r":
                if (window.game.track.toolHandler.selected != "camera") {
                    window.game.track.toolHandler.setTool("camera");
                    canvas.style.cursor = "move";
                } else {
                    window.game.track.toggleCamera = true;
                }

                break;

            case "m":
                window.game.track.undoManager.undo();
                break;

            case "n":
                window.game.track.undoManager.redo();
                break;
        }
    }
});

document.addEventListener("keyup", function(event) {
    switch (event.key) {
        case "b":
            if (event.ctrlKey) {
                window.game.track.switchBike();
            }

            break;

        case "g":
            if (window.game.track.players.length <= 1) {
                window.game.track.gridSize = 11 - window.game.track.gridSize;
            }

            break;

        case "r":
            if (window.game.track.toggleCamera) {
                canvas.style.cursor = "none";
                window.game.track.toggleCamera = false;
            }

            break;

        case "F2":
            window.game.track.firstPlayer.pastCheckpoint = false;
            break;

        case "Escape":
            let overlay = window.game.container.querySelector("overlay");
            overlay.style.setProperty("display", overlay.style.display === "flex" ? (window.game.track.paused = !1, "none") : (window.game.track.paused = !0, "flex"));

            break;
    }
});