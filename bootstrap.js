import Game from "./class/Game.js";

export default window.game = new Game(document.querySelector("#view"));

localStorage.setItem("theme", localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

document.addEventListener("keydown", function(event) {
    event.preventDefault();
    
    switch(event.key.toLowerCase()) {
        case "backspace":
            if (event.shiftKey) {
                window.game.scene.restoreCheckpoint();
                break;
            }

            window.game.scene.removeCheckpoint();
            break;

        case "enter":
            window.game.scene.gotoCheckpoint();
            break;

        case ".":
            window.game.scene.restoreCheckpoint();
            break;

        case "-":
            window.game.scene.zoomOut();
            break;

        case "+":
        case "=":
            window.game.scene.zoomIn();
            break;

        case "z":
            if (!window.game.scene.cameraFocus) {
                if (window.game.scene.id === void 0) {
                    if (event.ctrlKey) {
                        window.game.scene.undoManager.redo();

                        break;
                    }

                    window.game.scene.undoManager.undo();
                }

                if (window.autoPause) {
                    window.game.scene.paused = false, window.autoPause = false
                }
            }

            break;

        case "p":
        case " ":
            window.game.scene.paused = window.autoPause ? true : !window.game.scene.paused,
            window.game.container.querySelector("playpause")?.classList[window.game.scene.paused ? "remove" : "add"]("playing"),
            window.autoPause = false;
            break;
    }

    if (window.game.scene.editor) {
        if (window.game.scene.firstPlayer) {
            window.game.scene.cameraFocus = window.game.scene.firstPlayer.vehicle.head;
        }

        switch(event.key.toLowerCase()) {
            case "a":
                if (window.game.scene.toolHandler.selected !== "brush" || window.game.scene.toolHandler.currentTool.scenery) {
                    window.game.scene.toolHandler.setTool("brush");
                    window.game.scene.toolHandler.currentTool.scenery = !1;
                    canvas.style.cursor = "none";
                } else if (!window.game.scene.cameraLock) {
                    window.game.scene.cameraLock = true;
                }

                break;

            case "s":
                if (window.game.scene.toolHandler.selected !== "scenery brush" || !window.game.scene.toolHandler.currentTool.scenery) {
                    window.game.scene.toolHandler.setTool("brush");
                    window.game.scene.toolHandler.currentTool.scenery = !0;
                    canvas.style.cursor = "none";
                } else if (!window.game.scene.cameraLock) {
                    window.game.scene.cameraLock = true;
                }

                break;

            case "q":
                if (window.game.scene.toolHandler.selected !== "line" || window.game.scene.toolHandler.currentTool.scenery) {
                    window.game.scene.toolHandler.setTool("line");
                    window.game.scene.toolHandler.currentTool.scenery = !1;
                    canvas.style.cursor = "none";
                } else if (!window.game.scene.cameraLock) {
                    window.game.scene.cameraLock = true;
                }

                break;

            case "w":
                if (window.game.scene.toolHandler.selected !== "scenery line" || !window.game.scene.toolHandler.currentTool.scenery) {
                    window.game.scene.toolHandler.setTool("line");
                    window.game.scene.toolHandler.currentTool.scenery = !0;
                    canvas.style.cursor = "none";
                } else if (!window.game.scene.cameraLock) {
                    window.game.scene.cameraLock = true;
                }

                break;

            case "e":
                window.game.scene.toolHandler.setTool("eraser");
                canvas.style.cursor = "none";
                break;

            case "r":
                if (window.game.scene.toolHandler.selected != "camera") {
                    window.game.scene.toolHandler.setTool("camera");
                    canvas.style.cursor = "move";
                } else {
                    window.game.scene.toggleCamera = true;
                }

                break;

            case "m":
                window.game.scene.undoManager.undo();
                break;

            case "n":
                window.game.scene.undoManager.redo();
                break;
        }
    }
});

document.addEventListener("keyup", function(event) {
    switch (event.key.toLowerCase()) {
        case "b":
            if (event.ctrlKey) {
                window.game.scene.switchBike();
            }

            break;

        case "g":
            if (window.game.scene.players.length <= 1) {
                window.game.scene.gridSize = 11 - window.game.scene.gridSize;
            }

            break;

        case "r":
            if (window.game.scene.toggleCamera) {
                canvas.style.cursor = "none";
                window.game.scene.toggleCamera = false;
            }

            break;

        case "f":
        case "f11":
            document.fullscreenElement ? (document.exitFullscreen(), window.game.container.querySelector("fullscreen")?.classList.remove("active")) : (window.game.container.requestFullscreen(), window.game.container.querySelector("fullscreen")?.classList.add("active"));
            break;

        case "f2":
            window.game.scene.firstPlayer.pastCheckpoint = false;
            break;

        case "escape":
            let overlay = window.game.container.querySelector("game-overlay");
            overlay.style.setProperty("display", overlay.style.display === "flex" ? (window.game.scene.paused = !1, "none") : (window.game.scene.paused = !0, "flex"));

            break;
    }
});