export const canvas = document.querySelector("#view");

import tool from "./constant/tool.js";
import Game from "./class/Game.js";

export default window.game = new Game(document.querySelector("#view"));

localStorage.setItem("theme", localStorage.getItem("theme") || window.matchMedia("(prefers-color-scheme: dark)").matches);

document.querySelector("#upload")?.addEventListener("click", () => {
    function ja(){
        function a(a){
            e.push(a);
            d && (c = a(c));
            return f.Ib
        }
        function b(a){
            d = true;
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
    let a = window.game.track.toString();
    if (0 < a.length && window.game.track.targets > 0) {
        window.game.track.paused = true;
        tool = "camera";
        window.game.track.Ab = true;
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
            value: "Save window.game.track"
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
        n.innerHTML = "Use your mouse to drag & fit an interesting part of your window.game.track in the thumbnail";
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
            a.addEventListener("blur", game.attach)
        }
        jc(b);
        b.addEventListener("keypress", function(a){
            a.stopPropagation()
        }, false);
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
            window.game.track.zoom *= 2;
            l = window.game.track.sectors;
            window.game.track.sectors = {};
            window.game.track.Ab = false;
            window.game.track.draw();
            e.getContext("2d").drawImage(canvas, (canvas.width - 500) / 2, (canvas.height - 300) / 2, 500, 300, 0, 0, 500, 300);
            window.game.track.zoom /= 2;
            window.game.track.sectors = l;
            e = e.toDataURL("image/png");
            if("asdf" === e)
                return alert("The thumbnail is blank!\nDrag & fit an interesting part of your window.game.track inside."),
                false;
            if(4 > b.value.length)
                return alert("The window.game.track name is too short!"),
                false;
            d.disabled = true;
            for(let fc in f.children){
                if(f.children[fc].className == 'active')
                    h = f.children[fc].innerText.slice(1)
            }
            l = new XMLHttpRequest;
            l.open("POST", "/draw/upload", false);
            l.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            l.send("n=" + encodeURIComponent(b.value) + "&c=" + encodeURIComponent(a) + "&d=" + encodeURIComponent(c.value) + "&f=" + encodeURIComponent(h) + "&t=" + encodeURIComponent(e) + "&s=" + encodeURIComponent(window.game.track.targets));
            location.href = "/"
        })
    } else {
        if (window.game.track.targets < 1) {
            alert("Sorry, but your window.game.track must have at least 1 target!")
        } else
            alert("Sorry, but your window.game.track must be bigger or more detailed.")
    }
});

document.addEventListener("keydown", function(event) {
    event.preventDefault();
    switch (event.keyCode) {
        case 8:
            window.game.track.removeCheckpoint();
            window.game.track.gotoCheckpoint();
            break;
        case 13:
            window.game.track.gotoCheckpoint();
            break;
        case 190:
            window.game.track.removeCheckpointUndo();
            window.game.track.gotoCheckpoint();
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
            window.game.track.zoomOut();
            break;
        case 107:
        case 187:
            window.game.track.zoomIn();
            break;
        case 90:
            if (!window.game.track.cameraFocus) {
                if (window.game.track.id === void 0) {
                    window.game.track.undo();
                }
                if (window.autoPause) {
                    window.game.track.paused = false, window.autoPause = false
                }
            }
            break;
        case 32:
            window.game.track.paused = window.autoPause ? true : !window.game.track.paused,
            window.autoPause = false
    }
    if (window.game.track.editor && window.game.track.firstPlayer) {
        window.game.track.cameraFocus = window.game.track.firstPlayer.vehicle.head;
    }
    if (window.game.track.id == void 0) {
        switch (event.keyCode) {
            case 65:
                if (tool.selected !== "brush") {
                    tool.selected = "brush";
                    canvas.style.cursor = "none";
                } else if (!window.game.track.cameraLock) {
                    window.game.track.cameraLock = true;
                }
                break;
            case 83:
                if (tool.selected !== "scenery brush") {
                    tool.selected = "scenery brush";
                    canvas.style.cursor = "none";
                } else if (!window.game.track.cameraLock) {
                    window.game.track.cameraLock = true;
                }
                break;
            case 81:
                if (tool.selected !== "line") {
                    tool.selected = "line";
                    canvas.style.cursor = "none";
                } else if (!window.game.track.cameraLock) {
                    window.game.track.cameraLock = true;
                }
                break;
            case 87:
                if (tool.selected !== "scenery line") {
                    tool.selected = "scenery line";
                    canvas.style.cursor = "none";
                } else if (!window.game.track.cameraLock) {
                    window.game.track.cameraLock = true;
                }
                break;
            case 69:
                tool.selected = "eraser";
                canvas.style.cursor = "none";
                break;
            case 82:
                if (tool.selected != "camera") {
                    tool.selectedCache = tool.selected;
                    tool.selected = "camera";
                    canvas.style.cursor = "move";
                } else {
                    tool.toggleCamera = true
                }
                break;
            case 77:
                window.game.track.undoManager.undo();
                break;
            case 78:
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
                tool.grid = 11 - tool.grid,
                tool.descriptions.right[6] = (1 === tool.grid ? "En" : "Dis") + "able grid snapping ( G )";
            }

            break;

        case "r":
            if (tool.toggleCamera) {
                tool.selected = tool.selectedCache;
                canvas.style.cursor = "none";
                tool.toggleCamera = false;
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