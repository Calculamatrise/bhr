import Game from "./class/Game.js";

window.game = new Game(document.querySelector("#view"));

localStorage.setItem("theme", localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));