import Game from "./class/Game.js";

window.game = new Game(document.querySelector("#view"));

upload: {
    const upload = document.querySelector("#upload");
    if (upload === null) {
        break upload;
    }

    upload.addEventListener("click", function() {
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
        
        let a = window.game.scene.toString();
        if (0 < a.length && window.game.scene.targets > 0) {
            window.game.scene.paused = !0;
            window.game.scene.toolHandler.setTool("camera");
            window.game.scene.pictureMode = !0;
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
            }, ["button.btn#optPublic.active", "Public"], ["button.btn#optPrivate", "Private"]])
                , h =createElement(["input.span12", {
                placeholder: "Partners...",
                type: "text"
            }])
                , i =createElement(["div.span5"])
                , l =createElement(["label.hide.row-fluid", ["div.span3", "Collaboration with: "], ["div.span4", [h]], [i]])
                , m =createElement(["div.row-fluid"])
                , n =createElement(["div"])
                , x =createElement(["div.well.row-fluid#track_menu"]);
            b.addEventListener("keydown", event => event.stopPropagation());
            c.addEventListener("keydown", event => event.stopPropagation());
            n.style.color = window.game.canvas.style.borderColor = "#f00";
            n.innerHTML = "Use your mouse to drag & fit an interesting part of your track in the thumbnail";
            l.style.lineHeight = e.style.lineHeight = "30px";
            let w = function(a){
                for(let b = [].slice.call(arguments, 1), c = 0, d = b.length; c < d; c++)
                    a.appendChild(b[c]);
                return a
            };
            w(x, b, c, w(m, e, f), d);
            const Wb = window.game.canvas;
            Wb.after(x, window.game.canvas.nextSibling);
            Wb.before(n);
            for(let e = ja(), m = ja(), n = [e, m], x = function(a){
                return function(b){
                    X[a] = b;
                    0 < --M || y.Va(X);
                    return b
                }
            }, y = ja(), w = 0, C = n.length, M = C, X = Array(C); w < C; w++)
                n[w].ab(x(w));
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
            for (let fc of f.children) {
                fc.addEventListener("click", function(c) {
                    c.target.className = 'active';
                    c.target.nextSibling != null ? c.target.nextSibling.className = 'inactive' : c.target.previousSibling.className = 'inactive';
                });
            }
            d.addEventListener("click", async function() {
                let e = document.createElement("canvas"), h, l;
                e.width = 500;
                e.height = 300;
                window.game.scene.zoom *= 2;
                window.game.scene.grid.sectors.forEach(sector => sector.rendered = false);
                window.game.scene.pictureMode = false;
                window.game.scene.draw(window.game.ctx);
                e.getContext("2d").drawImage(window.game.canvas, (window.game.canvas.width - 500) / 2, (window.game.canvas.height - 300) / 2, 500, 300, 0, 0, 500, 300);
                window.game.scene.zoom /= 2;
                e = e.toDataURL("image/png");
                if ("asdf" === e)
                    return alert("The thumbnail is blank!\nDrag & fit an interesting part of your track inside."),
                    !1;
                if (4 > b.value.length)
                    return alert("The track name is too short!"),
                    !1;
                d.disabled = !0;
                for (let fc in f.children) {
                    if (f.children[fc].className == 'active')
                        h = f.children[fc].innerText
                }

                await fetch("/draw/upload", {
                    method: "post",
                    body: new URLSearchParams({
                        name: b.value,
                        code: a,
                        description: c.value,
                        display: h,
                        thumbnail: e
                    })
                }).then(r => r.text()).then(r => {
                    if (+r === 1) {
                        location.href = "/";
                    } else {
                        document.write("Something went wrong!");
                    }
                });
            });
        } else {
            if (window.game.scene.targets < 1) {
                return alert("Sorry, but your track must have at least 1 target!");
            }

            return alert("Sorry, but your track must be bigger or more detailed.");
        }
    });
}

settings: {
    const autoPause = document.getElementById("auto-pause");
    if (autoPause === null) {
        break settings;
    }

    autoPause.checked = window.game.settings.ap;
    autoPause.addEventListener("input", function() {
        window.game.updateSettings({
            ap: this.checked
        });
    });
}