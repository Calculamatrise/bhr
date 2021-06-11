export const ctx = canvas.getContext("2d");

import Game from "./class/Game.js";
import Vector from "./class/Vector.js";
import Sector from "./class/track/Sector.js";
import tool from "./constant/tool.js";
import Target from "./class/tool/item/Target.js";
import Checkpoint from "./class/tool/item/Checkpoint.js";
import Bomb from "./class/tool/item/Bomb.js";
import Boost from "./class/tool/item/Boost.js";
import Gravity from "./class/tool/item/Gravity.js";
import Antigravity from "./class/tool/item/Antigravity.js";
import Slowmo from "./class/tool/item/Slowmo.js";
import Teleporter from "./class/tool/item/Teleporter.js";
import { Hb } from "./constant/var.js";
import { clear, load, save, upload, code, charCount } from "./constant/buttons.js";

let loop = null;
let Z = !1;

export default window.Game = {
    defaults: {
        keydown: document.onkeydown,
        keypress: document.onkeypress,
        keyup: document.onkeyup
    },
    ride: function(t) {
        loop = new Game(t);
        this.track = track = loop.track;
        loop.startTicker();
    },
    newRide: function() {
        if (confirm("Do you really want to start a new track?")) {
            loop.close();
            loop.update.pop();
            loop.render.pop();
            this.ride();
            charCount.innerHTML = "Trackcode";
            code.value = null;
            loop.track.reset()
        }
    },
    loadRide: function() {
        canvas.style.display = "block";
        document.getElementById("track_menu").style.display = "none";
        if (code.value.includes("#")) {
            let t = loop.track.editor;
            loop.close();
            loop.update.pop();
            loop.render.pop();
            this.ride(code.value);
            charCount.innerHTML = "Trackcode";
            code.value = null;
            loop.track.reset();
            loop.track.editor = t;
        } else {
            alert("No trackcode to load!");
            canvas.style.display = "none";
            document.getElementById("track_menu").style.display = "block";
        }
    },
    saveRide: function() {
        if (loop.track.id === void 0) {
            let a = new Date();
            !function(t, e) {
                if (typeof navigator.msSaveBlob == "function") return navigator.msSaveBlob(t, e);
                let saver = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                saver.href = URL.createObjectURL(t);
                saver.download = e;
                document.body.appendChild(saver);
                saver.dispatchEvent(new MouseEvent("click"));
                document.body.removeChild(saver);
                URL.revokeObjectURL(saver.href);
            }(new Blob([loop.track.toString()], {type: "txt"}), "black_hat_rider_" + a.getDate() + "-" + a.getMonth() + "-" + a.getFullYear());
        }
    },
    saveGhost: function() {
        if (loop.track.id === void 0) {
            let a = new Date();
            !function(t, e) {
                if (typeof navigator.msSaveBlob == "function") return navigator.msSaveBlob(t, e);
                let saver = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                saver.href = URL.createObjectURL(t);
                saver.download = e;
                document.body.appendChild(saver);
                saver.dispatchEvent(new MouseEvent("click"));
                document.body.removeChild(saver);
                URL.revokeObjectURL(saver.href);
            }(new Blob([records.map(Object.keys)], {type: "txt"}), "black_hat_ghost_" + a.getDate() + "-" + a.getMonth() + "-" + a.getFullYear());
        }
    },
    attach: function() {
        if (this.defaults) {
            document.onkeydown = this.defaults.keydown,
            document.onkeypress = this.defaults.keypress,
            document.onkeyup = this.defaults.keyup,
            this.defaults = !1
        }
    }
}

export let track = Game.track;

if (!!clear && !!load && !!save && !!upload) {
    clear.onclick = () => Game.newRide();
    load.onclick = () => Game.loadRide();
    save.onclick = () => Game.saveRide();
    upload.onclick = () => {
        function ja(){
            function a(a){
                e.push(a);
                d && (c = a(c));
                return f.Ib
            }
            function b(a){
                d = !0;
                c = a;
                for(let b = 0, f = e.length; b < f; b++)
                    e[b](a)
            }
            let c, d, e = [], f = {
                ab: a,
                Va: b,
                Ib: {
                    ab: a
                },
                Wb: {
                    Va: b
                }
            };
            return f
        }
        function ka(a, b){
            let c = document.createElementNS(b, a.match(/^\w+/)[0]), d, e;
            if(d = a.match(/#([\w-]+)/))
                c.id = d[1];
            (e = a.match(/\.[\w-]+/g)) && c.setAttribute("class", e.join(" ").replace(/\./g, ""));
            return c
        }
        function createElement(a, b, c){
            let d = document, e, f;
            if(a && a.big)
                return d.getElementById(a);
            c = c || {};
            b = b || "http://www.w3.org/1999/xhtml";
            a[0].big && (a[0] = ka(a[0], b));
            for(e = 1; e < a.length; e++)
                if(a[e].big)
                    a[0].appendChild(d.createTextNode(a[e]));
                else if(a[e].pop)
                    a[e][0].big && (a[e][0] = ka(a[e][0], b)),
                    a[0].appendChild(a[e][0]),
                    createElement(a[e], b, c);
                else if(a[e].call)
                    a[e](a[0]);
                else
                    for(f in a[e])
                        a[0].setAttribute(f, a[e][f]);
            c[0] = a[0];
            return c[0]
        }
        let a = track.toString();
        if(0 < a.length && track.targets > 0){
            track.paused = !0;
            tool = "camera";
            track.Ab = !0;
            K.lineCap = "round";
            K.lineJoin = "round";
            document.getElementById("track_menu").style.display = "none";
            let b =createElement(["input#name.input-block-level", {
                type: "text",
                size: 18,
                Qb: 20,
                placeholder: "Name..."
            }])
                , c =createElement(["textarea.input-block-level", {
                rows: 4,
                placeholder: "Description..."
            }])
                , d =createElement(["input.btn.btn-primary.btn-block.btn-large", {
                type: "submit",
                value: "Save track"
            }])
                , e =createElement(["div.span3", "Visibility:"])
                , f =createElement(["div.btn-group.span9", {
                "data-toggle": "buttons-radio"
            }, ["button.btn#optPublic.active", ["i.icon-world"], " Public"], ["button.btn#optPrivate", ["i.icon-lock"], " Private"]])
                , h =createElement(["input.span12", {
                placeholder: "Partners...",
                type: "text"
            }])
                , i =createElement(["div.span5"])
                , l =createElement(["label.hide.row-fluid", ["div.span3", "Collaboration with: "], ["div.span4", [h]], [i]])
                , m =createElement(["div.row-fluid"])
                , n =createElement(["div"])
                , x =createElement(["div.well.row-fluid#track_menu"]);
            n.style.color = canvas.style.borderColor = "#f00";
            n.innerHTML = "Use your mouse to drag & fit an interesting part of your track in the thumbnail";
            l.style.lineHeight = e.style.lineHeight = "30px";
            let w = function(a){
                for(let b = [].slice.call(arguments, 1), c = 0, d = b.length; c < d; c++)
                    a.appendChild(b[c]);
                return a
            };
            w(x, b, c, w(m, e, f), d);
            Wb.insertBefore(x, canvas.nextSibling);
            Wb.insertBefore(n, canvas);
            for(let e = ja(), m = ja(), n = [e, m], x = function(a){
                return function(b){
                    X[a] = b;
                    0 < --M || y.Va(X);
                    return b
                }
            }, y = ja(), w = 0, C = n.length, M = C, X = Array(C); w < C; w++)
                n[w].ab(x(w));
            n = y;
            function jc(a){
                a.addEventListener("blur", Game.attach)
            }
            jc(b);
            b.addEventListener("keypress", function(a){
                a.stopPropagation()
            }, !1);
            b.focus();
            jc(h);
            jc(c);
            for(let fc in f.children)
                f.children[fc].onclick = c => {
                    c.target.className = 'active';
                    c.target.nextSibling != null ? c.target.nextSibling.className = 'inactive' : c.target.previousSibling.className = 'inactive';
                };
            d.addEventListener("click", function(){
                let e = document.createElement("canvas"), h, l;
                e.width = 500;
                e.height = 300;
                track.zoom *= 2;
                l = track.sectors;
                track.sectors = {};
                track.Ab = !1;
                track.draw();
                e.getContext("2d").drawImage(canvas, (canvas.width - 500) / 2, (canvas.height - 300) / 2, 500, 300, 0, 0, 500, 300);
                track.zoom /= 2;
                track.sectors = l;
                e = e.toDataURL("image/png");
                if("asdf" === e)
                    return alert("The thumbnail is blank!\nDrag & fit an interesting part of your track inside."),
                    !1;
                if(4 > b.value.length)
                    return alert("The track name is too short!"),
                    !1;
                d.disabled = !0;
                for(let fc in f.children){
                    if(f.children[fc].className == 'active')
                        h = f.children[fc].innerText.slice(1)
                }
                l = new XMLHttpRequest;
                l.open("POST", "/draw/upload", !1);
                l.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                l.send("n=" + encodeURIComponent(b.value) + "&c=" + encodeURIComponent(a) + "&d=" + encodeURIComponent(c.value) + "&f=" + encodeURIComponent(h) + "&t=" + encodeURIComponent(e) + "&s=" + encodeURIComponent(track.targets));
                location.href = "/"
            })
        } else {
            if(track.targets < 1){
                return alert("Sorry, but your track must have at least 1 target!")
            } else {
                return alert("Sorry, but your track must be bigger or more detailed.")
            }
        }
    }
}

if (!!code) {
    code.oninput = (t) => {
        if (t.target.value.startsWith("GHOST:")) {
            document.getElementById("track_menu").style.display = "none";
            document.getElementById("canvas_rider").style.display = "block";
            Game.watchGhost(t.target.value);
        } else {
            Game.loadRide(t.target.value);
        }
    }
}

window.onresize = function() {
    canvas.setAttribute('height', +getComputedStyle(canvas).getPropertyValue('height').slice(0, -2) * window.devicePixelRatio);
    canvas.setAttribute('width', +getComputedStyle(canvas).getPropertyValue('width').slice(0, -2) * window.devicePixelRatio);
};
window.onresize();

document.onkeydown = function(a) {
    a.preventDefault();
    switch (a.keyCode) {
        case 8:
            track.firstPlayer.removeCheckpoint();
            track.firstPlayer.gotoCheckpoint();
            break;
        case 13:
            track.firstPlayer.gotoCheckpoint();
            break;
        case 190:
            track.firstPlayer.removeCheckpointUndo();
            track.firstPlayer.gotoCheckpoint();
            break;
        case 37:
        case 38:
        case 39:
        case 40:
            if (track.firstPlayer) {
                track.cameraFocus = track.firstPlayer.vehicle.head;
                if (!track.firstPlayer.dead) {
                    track.firstPlayer.gamepad.setButtonDown(a.key.toLowerCase().slice(5));
                }
                if (window.autoPause) {
                    track.paused = false, window.autoPause = false
                }
                track.firstPlayer.statesCache = new Map();
                track.firstPlayer.checkpointsCache = 0;
            }
            break;
        case 70:
        case 122:
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                canvas.requestFullscreen();
            }
            break;
        case 109:
        case 189:
            track.zoomOut();
            break;
        case 107:
        case 187:
            track.zoomIn();
            break;
        case 90:
            if (!track.cameraFocus) {
                if (track.id === void 0) {
                    track.undo();
                }
                if (window.autoPause) {
                    track.paused = false, window.autoPause = false
                }
            } else {
                if (track.firstPlayer.swapped) {
                    !track.firstPlayer.dead && track.firstPlayer.gamepad.setButtonDown("z")
                }
            }
            break;
        case 32:
            track.paused = window.autoPause ? true : !track.paused,
            window.autoPause = false
    }
    if (track.editor && track.firstPlayer) {
        track.cameraFocus = track.firstPlayer.vehicle.head;
        track.firstPlayer.statesCache = new Map();
        track.firstPlayer.checkpointsCache = 0;
        if (track.firstPlayer.alive) {
            switch (a.keyCode) {
                case 65:
                case 68:
                case 87:
                case 83:
                    track.firstPlayer.gamepad.setButtonDown(a.key.toLowerCase().slice(5));
                break;
            }
        }
    }
    if (track.id == void 0) {
        switch (a.keyCode) {
            case 65:
                if (tool.selected !== "brush") {
                    tool.selected = "brush";
                    document.body.style.cursor = "none";
                    Z = !0;
                } else if (!track.cameraLock) {
                    track.cameraLock = !0;
                    tool.mouse.old.copy(Lb);
                    Z = !0;
                }
                break;
            case 83:
                if (tool.selected !== "scenery brush") {
                    tool.selected = "scenery brush";
                    document.body.style.cursor = "none";
                    Z = !0;
                } else if (!track.cameraLock) {
                    track.cameraLock = !0;
                    tool.mouse.old.copy(Mb);
                    Z = !0;
                }
                break;
            case 81:
                if (tool.selected !== "line") {
                    tool.selected = "line";
                    document.body.style.cursor = "none";
                } else if (!track.cameraLock) {
                    track.cameraLock = !0;
                    tool.mouse.old.copy(Lb);
                    Z = !0;
                }
                break;
            case 87:
                if (tool.selected !== "scenery line") {
                    tool.selected = "scenery line";
                    document.body.style.cursor = "none";
                } else if (!track.cameraLock) {
                    track.cameraLock = !0;
                    tool.mouse.old.copy(Mb);
                    Z = !0;
                }
                break;
            case 69:
                tool.selected = "eraser";
                document.body.style.cursor = "none";
                Z = !0;
                break;
            case 82:
                if (tool.selected != "camera") {
                    tool.selectedCache = tool.selected;
                    tool.selected = "camera";
                    document.body.style.cursor = "move";
                } else {
                    tool.toggleCamera = !0
                }
                break;
            case 77:
                track.undoManager.undo();
                break;
            case 78:
                track.undoManager.redo();
                break;
        }
    }
},
document.onkeyup = function(a) {
    switch (a.keyCode) {
        case 66:
            if (a.ctrlKey) {
                track.firstPlayer.switchBike();
            }
            break;
        case 37:
        case 38:
        case 39:
        case 40:
            if (!track.firstPlayer.dead) {
                track.firstPlayer.gamepad.setButtonUp(a.key.toLowerCase().slice(5))
            }
            break;
        case 90:
            track.firstPlayer.swapped = !0;
            break;
        case 71:
            if (track.players.length > 1) {
                track.cameraFocus = track.players[1].head === track.cameraFocus && track.firstPlayer ? track.firstPlayer.vehicle.head : track.players[1].head
            } else {
                tool.grid = 11 - tool.grid,
                tool.descriptions.right[6] = (1 === tool.grid ? "En" : "Dis") + "able grid snapping ( G )";
            }
            break;
        case 82:
            if (tool.toggleCamera) {
                tool.selected = tool.selectedCache;
                document.body.style.cursor = "none";
                tool.toggleCamera = !1;
            }
            break;
        case 81:
        case 87:
        case 69:
        case 83:
            track.players.length > 1 && (track.cameraFocus === track.players[1].head && (track.cameraFocus = track.firstPlayer.vehicle.head),
            track.players[1] = !1);
        case 65:
            if (Z) {
                track.cameraLock = Z = !1
            }
            break;
        case 113:
            track.firstPlayer.pastCheckpoint = !1;
            break;
    }
    if (track.editor) {
        switch (a.keyCode) {
            case 65:
                track.firstPlayer.gamepad.setButtonUp("left");
                break;
            case 68:
                track.firstPlayer.gamepad.setButtonUp("right");
                break;
            case 87:
                track.firstPlayer.gamepad.setButtonUp("up");
                break;
            case 83:
                track.firstPlayer.gamepad.setButtonUp("down");
                break;
        }
    }
},
canvas.onmousemove = (a, b) => {
    b = Math.floor((a.clientX - canvas.offsetLeft + window.pageXOffset) / 25);
    a = Math.floor((a.clientY - canvas.offsetTop + window.pageYOffset) / 25);
    if (b < 1) {
        if (a > 11) {
            if ("eraser\\brush\\scenery brush".split(/\\/).includes(tool.selected)) {
                if (a > 13) {
                    if (tool.selected == "eraser") {
                        track.displayText = [0, a, tool.descriptions.left[a]];
                    }
                } else {
                    track.displayText = [0, a, tool.descriptions.left[a]];
                }
            }
        } else {
            track.displayText = [0, a, tool.descriptions.left[a]];
        }
        if ([0, 1, 2, 4, 6, 7].includes(a) || tool.selected == "eraser" && [12, 13, 15, 16, 17].includes(a)) {
            document.body.style.cursor = "default";
        } else {
            document.body.style.cursor = tool.selected == "camera" ? "move" : "none";
        }
    } else if (track.editor && b > canvas.width / 25 - 1.367) {
        track.displayText = [1, a, tool.descriptions.right[a]];
        if (14 === a && ("scenery line" === tool.selected || "scenery brush" === tool.selected)) {
            track.displayText[2] = "Shorten last set of scenery lines ( Z )";
        }
        if ([0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17].includes(a)) {
            document.body.style.cursor = "default";
        } else {
            document.body.style.cursor = tool.selected == "camera" ? "move" : "none";
        }
    } else {
        track.displayText = !1;
        document.body.style.cursor = tool.selected == "camera" ? "move" : "none";
    }
},
canvas.onmouseover = canvas.onmouseenter = function() {
    track.displayText = !1;
    document.body.style.cursor = "camera" === tool.selected ? "move" : "none"
},
canvas.onmousedown = function(a) {
    a.preventDefault();
    track.cameraLock = !0;
    track.cameraFocus = !1;
    if (Math.floor((a.clientX - canvas.offsetLeft + window.pageXOffset) / 25) < 1 && [0, 1, 2, 4, 6, 7].includes(Math.floor((a.clientY - canvas.offsetTop + window.pageYOffset) / 25)) ||
    tool.selected == "eraser" && [12, 13, 15, 16, 17].includes(Math.floor((a.clientY - canvas.offsetTop + window.pageYOffset) / 25))) {
        track.cameraLock = !1;
        switch (Math.floor((a.clientY - canvas.offsetTop + window.pageYOffset) / 25) + 1) {
            case 1:
                track.paused = !track.paused;
                break;
            case 2:
                track.firstPlayer.gotoCheckpoint();
                break;
            case 3:
                track.firstPlayer.removeCheckpoint();
                break;
            case 5:
                track.firstPlayer.switchBike();
                break;
            case 7:
                track.lineShading ? (track.lineShading = !1,
                track.displayText[2] = tool.descriptions.left[6] = "Enable line shading") : (track.lineShading = !0,
                track.displayText[2] = tool.descriptions.left[6] = "Disable line shading");
                track.sectors = [];
                break;
            case 8:
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    canvas.requestFullscreen();
                }
                break;
            case 13:
                if (tool.selected == "eraser") {
                    if (tool.eraser.size < 500) {
                        tool.eraser.size += 5;
                    }
                } else if ("brush\\scenery brush".split(/\\/).includes(tool.selected)) {
                    if (tool.brush.length < 200) {
                        tool.brush.length += 8;
                    }
                }
                break;
            case 14:
                if (tool.selected == "eraser") {
                    if (tool.eraser.size > 10) {
                        tool.eraser.size -= 5;
                    }
                } else if ("brush\\scenery brush".split(/\\/).includes(tool.selected)) {
                    if (tool.brush.length > 4) {
                        tool.brush.length -= 8;
                    }
                }
                break;
            case 16:
                if (tool.selected == "eraser") {
                    tool.eraser.settings.physics = !tool.eraser.settings.physics;
                    track.displayText[2] = tool.descriptions.left[15];
                }
                break;
            case 17:
                if (tool.selected == "eraser") {
                    tool.eraser.settings.scenery = !tool.eraser.settings.scenery;
                    track.displayText[2] = tool.descriptions.left[16];
                }
                break;
            case 18:
                if (tool.selected == "eraser") {
                    tool.eraser.settings.powerups = !tool.eraser.settings.powerups;
                    track.displayText[2] = tool.descriptions.left[17];
                }
                break;
        }
    } else if (track.editor && Math.floor((a.clientX - canvas.offsetLeft + window.pageXOffset) / 25) > canvas.width / 25 - 1.367 &&
    [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 17].includes(Math.floor((a.clientY - canvas.offsetTop + window.pageYOffset) / 25))) {
        track.cameraLock = !1;
        switch (Math.floor((a.clientY - canvas.offsetTop + window.pageYOffset) / 25) + 1) {
            case 1:
                tool.selected = "brush";
                break;
            case 2:
                tool.selected = "scenery brush";
                break;
            case 3:
                tool.selected = "line";
                break;
            case 4:
                tool.selected = "scenery line";
                break;
            case 5:
                tool.selected = "eraser";
                break;
            case 6:
                tool.selected = "camera";
                break;
            case 7:
                if (tool.grid === 1) {
                    tool.grid = 10;
                    track.displayText[2] = tool.descriptions.right[6] = "Disable grid snapping ( G )";
                } else {
                    tool.grid = 1;
                    track.displayText[2] = tool.descriptions.right[6] = "Enable grid snapping ( G )";
                }
                break;
            case 9:
                tool.selected = "goal";
                break;
            case 10:
                tool.selected = "checkpoint";
                break;
            case 11:
                tool.selected = "boost";
                break;
            case 12:
                tool.selected = "gravity";
                break;
            case 13:
                tool.selected = "bomb";
                break;
            case 14:
                tool.selected = "slow-mo";
                break;
            case 15:
                tool.selected = "antigravity";
                break;
            case 16:
                tool.selected = "teleporter";
                break;
            case 18:
                track.undo()
            }
    } else if (a.button === 2 && tool.selected !== "camera") {
        let a = track.erase(tool.mouse.pos);
        a.length && track.pushUndo(() => {
            track.addToSelf(a, !0);
        }, () => {
            for (let b = 0, c = a.length; b < c; b++) {
                a[b].remove();
            }
        });
        Hb = !0;
    } else {
        let b;
        Z || tool.mouse.old.copy(tool.mouse.pos);
        switch (tool.selected) {
        case "boost":
        case "gravity":
            document.body.style.cursor = "crosshair";
            break;
        case "eraser":
            let a = track.erase(tool.mouse.pos);
            a.length && track.pushUndo(() => {
                track.addToSelf(a, !0);
            }, () => {
                for (let b = 0, c = a.length; b < c; b++) {
                    a[b].remove();
                }
            });
            break;
        case "goal":
            track.powerups.push(b = new Target(tool.mouse.old.x,tool.mouse.old.y,track));
            track.targets++;
            break;
        case "checkpoint":
            track.powerups.push(b = new Checkpoint(tool.mouse.old.x,tool.mouse.old.y,track));
            break;
        case "bomb":
            b = new Bomb(tool.mouse.old.x,tool.mouse.old.y,track);
            break;
        case "slow-mo":
            b = new Slowmo(tool.mouse.old.x,tool.mouse.old.y,track);
            break;
        case "antigravity":
            b = new Antigravity(tool.mouse.old.x,tool.mouse.old.y,track);
            break;
        case "teleporter":
            b = new Teleporter(tool.mouse.old.x,tool.mouse.old.y,track);
            track.teleporter = b;
            break;
        case "brush":
        case "scenery brush":
            Z && track.addLine(tool.mouse.old, tool.mouse.pos, "brush" !== tool.selected),
            Z = !1,
            track.cameraLock = !0
        }
        if (b !== void 0) {
            let c = Math.floor(b.pos.x / track.scale)
            , d = Math.floor(b.pos.y / track.scale);
            track.grid[c] === void 0 && (track.grid[c] = []);
            track.grid[c][d] === void 0 && (track.grid[c][d] = new Sector);
            track.grid[c][d].powerups.push(b);
            track.pushUndo(function() {
                b.remove()
            }, function() {
                b instanceof Target && ++track.targets;
                track.grid[c][d].powerups.push(b)
            })
        }
    }
},
document.onmousemove = function(a) {
    if (tool.selected !== "camera") {
        track.cameraFocus = !1;
    }
    tool.mouse.pos = (new Vector(a.clientX - canvas.offsetLeft,a.clientY - canvas.offsetTop + window.pageYOffset)).toCanvas();
    if (tool.selected !== "eraser") {
        if (a.button !== 2) {
            tool.mouse.pos.x = Math.round(tool.mouse.pos.x / tool.grid) * tool.grid;
            tool.mouse.pos.y = Math.round(tool.mouse.pos.y / tool.grid) * tool.grid;
        }
    }
    if (track.cameraLock) {
        if (tool.selected === "camera") {
            track.camera.addToSelf(tool.mouse.old.sub(tool.mouse.pos)),
            tool.mouse.pos.copy(tool.mouse.old);
        } else if (tool.selected === "eraser" || window.BHR_RCE_ENABLED && a.button === 2) {
            let a = track.erase(tool.mouse.pos);
            if (a.length) {
                track.pushUndo(() => {
                    track.addToSelf(a, !0);
                }, () => {
                    for (let b = 0, c = a.length; b < c; b++) {
                        a[b].remove();
                    }
                });
            }
        } else if (!Z && "brush\\scenery brush".split(/\\/).includes(tool.selected) && tool.mouse.old.distanceTo(tool.mouse.pos) >= tool.brush.length) {
            let b = track.addLine(tool.mouse.old, tool.mouse.pos, "brush" !== tool.selected);
            track.pushUndo(function() {
                b.remove()
            }, function() {
                b.xb()
            })
        }
    }
},
canvas.onmouseup = function() {
    let a, b, c, d;
    if (Hb)
        return Hb = !1;
    if (track.cameraLock)
        if ("line" === tool.selected || "scenery line" === tool.selected || "brush" === tool.selected || "scenery brush" === tool.selected) {
            let e = track.addLine(tool.mouse.old, tool.mouse.pos, "line" !== tool.selected && "brush" !== tool.selected);
            track.pushUndo(function() {
                e.remove()
            }, function() {
                e.xb()
            })
        } else if ("teleporter" === tool.selected) {
            tool.mouse.old.copy(tool.mouse.pos);
            track.teleporter.tpb(tool.mouse.old.x,tool.mouse.old.y);
            track.teleporter = undefined;
        } else if ("boost" === tool.selected || "gravity" === tool.selected)
            document.body.style.cursor = "none",
            d = Math.round(180 * Math.atan2(-(tool.mouse.pos.x - tool.mouse.old.x), tool.mouse.pos.y - tool.mouse.old.y) / Math.PI),
            c = "boost" === tool.selected ? new Boost(tool.mouse.old.x,tool.mouse.old.y,d,track) : new Gravity(tool.mouse.old.x,tool.mouse.old.y,d,track),
            a = Math.floor(c.pos.x / track.scale),
            b = Math.floor(c.pos.y / track.scale),
            track.grid[a] === void 0 && (track.grid[a] = []),
            track.grid[a][b] === void 0 && (track.grid[a][b] = new Sector),
            track.grid[a][b].powerups.push(c),
            track.pushUndo(function() {
                c.remove()
            }, function() {
                track.grid[a][b].powerups.push(c)
            })
},
document.onmouseup = () => Z || (track.cameraLock = !1),
canvas.oncontextmenu = (a) => a.preventDefault(),
canvas.onmouseout = canvas.onmouseleave = () => document.body.style.cursor = "default",
canvas.ondommousescroll = canvas.onmousewheel = (a) => {
    a.preventDefault();
    if (Z) {
        if ("eraser" === tool.selected) {
            if ((0 < a.detail || 0 > a.wheelDelta) && 5 < tool.eraser.size) {
                tool.eraser.size -= 5;
            } else {
                if ((0 > a.detail || 0 < a.wheelDelta) && 40 > tool.eraser.size) {
                    tool.eraser.size += 5
                }
            }
        } else {
            if ("brush" === tool.selected || "scenery brush" === tool.selected) {
                if ((0 < a.detail || 0 > a.wheelDelta) && 4 < tool.brush.length) {
                    tool.brush.length -= 8;
                } else if ((0 > a.detail || 0 < a.wheelDelta) && 200 > tool.brush.length) {
                    tool.brush.length += 8;
                }
            }
        }
    } else {
        if (0 < a.detail || 0 > a.wheelDelta) {
            track.zoomOut()
        } else if (0 > a.detail || 0 < a.wheelDelta) {
            track.zoomIn()
        };
    }
    a = (new Vector(a.clientX - canvas.offsetLeft,a.clientY - canvas.offsetTop + window.pageYOffset)).toCanvas();
    track.cameraFocus || track.camera.addToSelf(tool.mouse.pos.sub(a))
}