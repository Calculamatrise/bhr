import { ctx } from "../../bootstrap.js";

import Camera from "../tools/Camera.js";

export default class {
    constructor(parent) {
        this.track = parent;
    }
    old = "camera";
    selected = "camera";
    #tools = {
        camera: new Camera()
    }
    get currentTool() {
        return this.#tools[this.selected];
    }
    setTool(name) {
        this.selected = name;
    }
    draw() {
        for (let i = 0; i < 200; i += 25) {
            if (i == 75 || i == 125)
                continue;

            ctx.save();
            ctx.strokeStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
            ctx.lineWidth = 1;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(25, i);
            ctx.lineTo(25, i + 25);
            ctx.lineTo(0, i + 25);
            ctx.stroke();
            ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
            if (this.track.displayText && this.track.displayText[0] == 0 && this.track.displayText[1] == i / 25) {
                ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#DDDDDD";
            }
            ctx.fillRect(0, i, 25, 25);
            ctx.fillStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
            switch(i / 25) {
                case 0:
                    if (!this.track.paused) {
                        ctx.fillRect(7, 5, 4, 14);
                        ctx.fillRect(14, 5, 4, 14);
                    } else {
                        ctx.lineWidth = 2;
                        ctx.fillStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
                        ctx.beginPath();
                        ctx.moveTo(9, 7);
                        ctx.lineTo(9, 18);
                        ctx.lineTo(19 * Math.cos(Math.PI / 6), 12.5);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.fill();
                    }
                    break;

                case 1:
                    ctx.beginPath();
                    ctx.fillRect(7, i + 5, 2, 16);
                    ctx.moveTo(9, i + 12.5);
                    ctx.lineTo(18, i + 20);
                    ctx.lineTo(18, i + 5);
                    ctx.fill();
                    break;

                case 2:
                    ctx.beginPath();
                    ctx.fillRect(3, i + 5, 2, 16);
                    ctx.moveTo(5, i + 12.5);
                    ctx.lineTo(13, i + 20);
                    ctx.lineTo(13, i + 5);
                    ctx.moveTo(13, i + 12.5);
                    ctx.lineTo(21, i + 20);
                    ctx.lineTo(21, i + 5);
                    ctx.fill();
                    break;

                case 4:
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(25, i);
                    ctx.stroke();
                    ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
                    if (this.track.displayText && this.track.displayText[0] == 0 && this.track.displayText[1] == i / 25) {
                        ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#DDDDDD";
                    }
                    ctx.fillRect(0, i, 25, 24);
                    ctx.fillStyle = "#000000";
                    ctx.strokeStyle = "#777777";
                    ctx.beginPath();
                    for (var s = 0; s < 360; s+=30) {
                        ctx.moveTo(12.5, i + 12.5);
                        ctx.lineTo(12.5 + 8 * Math.cos(s * Math.PI / 180), i + 12.5 + 8 * Math.sin(s * Math.PI / 180));
                    }
                    ctx.stroke();
                    ctx.strokeStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.arc(12.5, i + 12.5, 8, 0, 2 * Math.PI);
                    ctx.stroke();
                    break;

                case 6:
                    ctx.beginPath();
                    ctx.moveTo(0, i);
                    ctx.lineTo(25, i);
                    ctx.stroke();
                    ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
                    if (this.track.displayText && this.track.displayText[0] == 0 && this.track.displayText[1] == i / 25) {
                        ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#DDDDDD";
                    }
                    ctx.fillRect(0, i, 25, 24);
                    ctx.fillStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
                    ctx.lineWidth = 2;
                    ctx.shadowColor = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
                    ctx.shadowOffsetX = 1;
                    ctx.shadowOffsetY = 1;
                    ctx.shadowBlur = 3;
                    ctx.beginPath();
                    ctx.moveTo(6, i + 19);
                    ctx.lineTo(19, i + 6);
                    ctx.stroke();
                    break;
                case 7:
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(6, i + 14.5);
                    ctx.lineTo(6, i + 19);
                    ctx.lineTo(9.5, i + 19);
                    ctx.moveTo(19, i + 14.5);
                    ctx.lineTo(19, i + 19);
                    ctx.lineTo(14.5, i + 19);
                    ctx.moveTo(19, i + 9.5);
                    ctx.lineTo(19, i + 6);
                    ctx.lineTo(14.5, i + 6);
                    ctx.moveTo(9.5, i + 6);
                    ctx.lineTo(6, i + 6);
                    ctx.lineTo(6, i + 9.5);
                    ctx.stroke();
                    break;
            }

            ctx.restore();
        }

        if (["brush", "eraser"].includes(this.selected)) {
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
            ctx.moveTo(0, 300);
            ctx.lineTo(25, 300);
            ctx.lineTo(25, 350);
            ctx.lineTo(0, 350);
            ctx.stroke();
            if (this.selected == "eraser") {
                ctx.moveTo(0, 375);
                ctx.lineTo(25, 375);
                ctx.lineTo(25, 450);
                ctx.lineTo(0, 450);
                ctx.stroke();
                ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
                if (this.track.displayText) {
                    if (this.track.displayText[0] == 0 && [15].includes(this.track.displayText[1])) {
                        ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#ddd";
                    }
                }
                ctx.fillRect(0, 375, 25, 25);
                ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
                if (this.track.displayText) {
                    if (this.track.displayText[0] == 0 && [16].includes(this.track.displayText[1])) {
                        ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#ddd";
                    }
                }
                ctx.fillRect(0, 400, 25, 25);
                ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
                if (this.track.displayText) {
                    if (this.track.displayText[0] == 0 && [17].includes(this.track.displayText[1])) {
                        ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#ddd";
                    }
                }
                ctx.fillRect(0, 425, 25, 25);
            }
            ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
            if (this.track.displayText) {
                if (this.track.displayText[0] == 0 && [12].includes(this.track.displayText[1])) {
                    ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#ddd";
                }
            }
            ctx.fillRect(0, 300, 25, 25);
            ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
            if (this.track.displayText) {
                if (this.track.displayText[0] == 0 && [13].includes(this.track.displayText[1])) {
                    ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#ddd";
                }
            }
            ctx.fillRect(0, 325, 25, 25);
            ctx.fillStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
            ctx.fillRect(11.5, 306, 2, 12.5);
            ctx.fillRect(6, 311.5, 12.5, 2);
            ctx.fillRect(6, 338, 12.5, 2);
            if (this.selected == "eraser") {
                ctx.save();
                ctx.beginPath();
                ctx.arc(12.5, 387.5, 3, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = ctx.strokeStyle = this.track.parent.theme.dark ? "#999999" : "#AAAAAA";
                ctx.beginPath();
                ctx.arc(12.5, 412.5, 3, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
                ctx.fillStyle = "#ff0";
                ctx.beginPath();
                ctx.arc(12.5, 437.5, 3, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();
                ctx.restore();
            }
        }

        if (this.track.editor) {
            for (let i = 0; i < 450; i += 25) {
                if (i == 175 || i == 400)
                    continue;

                ctx.save();
                ctx.lineWidth = 1;
                ctx.globalAlpha = 1;
                ctx.strokeStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000";
                ctx.beginPath();
                ctx.moveTo(this.track.parent.canvas.width - 25, i);
                ctx.lineTo(this.track.parent.canvas.width - 25, i + 25);
                ctx.lineTo(this.track.parent.canvas.width, i + 25);
                ctx.stroke();
                ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
                if (this.track.displayText && this.track.displayText[0] == 1 && this.track.displayText[1] == i / 25) {
                    ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#DDDDDD";
                }
                ctx.fillRect(this.track.parent.canvas.width - 25, i, 25, 25);
                ctx.fillStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000";
                switch (i / 25) {
                    case 0:
                        ctx.strokeStyle = ctx.fillStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
                        ctx.beginPath();
                        ctx.arc(this.track.parent.canvas.width - 12.5, i + 12.5, 2, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 1:
                        ctx.fillStyle = ctx.strokeStyle = this.track.parent.theme.dark ? "#999999" : "#AAAAAA"
                        ctx.beginPath();
                        ctx.arc(this.track.parent.canvas.width - 12.5, i + 12.5, 2, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 2:
                        ctx.strokeStyle = ctx.fillStyle = this.track.parent.theme.dark ? "#FBFBFB" : "#000000";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(this.track.parent.canvas.width - 7, i + 8);
                        ctx.lineTo(this.track.parent.canvas.width - 16, i + 17);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 3:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = ctx.strokeStyle = this.track.parent.theme.dark ? "#999999" : "#AAAAAA";
                        ctx.beginPath();
                        ctx.moveTo(this.track.parent.canvas.width - 7, i + 8);
                        ctx.lineTo(this.track.parent.canvas.width - 16, i + 17);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 4:
                        ctx.strokeStyle = ctx.fillStyle = "#FFB6C1";
                        ctx.beginPath();
                        ctx.arc(this.track.parent.canvas.width - 12.5, i + 12.5, 6, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 5:
                        ctx.fillRect(this.track.parent.canvas.width - 13, i + 8, 2, 10);
                        ctx.fillRect(this.track.parent.canvas.width - 17, i + 12, 10, 2);
                        ctx.beginPath();
                        ctx.moveTo(this.track.parent.canvas.width - 16, i + 8);
                        ctx.lineTo(this.track.parent.canvas.width - 8, i + 8);
                        ctx.lineTo(this.track.parent.canvas.width - 12, i + 14 - 12 * Math.cos(Math.PI / 6));
                        ctx.moveTo(this.track.parent.canvas.width - 16, i + 18);
                        ctx.lineTo(this.track.parent.canvas.width - 8, i + 18);
                        ctx.lineTo(this.track.parent.canvas.width - 12, i + 12 + 12 * Math.cos(Math.PI / 6));
                        ctx.moveTo(this.track.parent.canvas.width - 17, i + 9);
                        ctx.lineTo(this.track.parent.canvas.width - 17, i + 17);
                        ctx.lineTo(this.track.parent.canvas.width - 11 - 12 * Math.cos(Math.PI / 6), i + 13);
                        ctx.moveTo(this.track.parent.canvas.width - 7, i + 9);
                        ctx.lineTo(this.track.parent.canvas.width - 7, i + 17);
                        ctx.lineTo(this.track.parent.canvas.width - 13 + 12 * Math.cos(Math.PI / 6), i + 13);
                        ctx.fill();
                        break;

                    case 6:
                        ctx.strokeStyle = "#CCC";
                        ctx.beginPath();
                        ctx.moveTo(this.track.parent.canvas.width - 17, i + 5);
                        ctx.lineTo(this.track.parent.canvas.width - 17, i + 19);
                        ctx.moveTo(this.track.parent.canvas.width - 12, i + 5);
                        ctx.lineTo(this.track.parent.canvas.width - 12, i + 19);
                        ctx.moveTo(this.track.parent.canvas.width - 7, i + 5);
                        ctx.lineTo(this.track.parent.canvas.width - 7, i + 19);
                        ctx.moveTo(this.track.parent.canvas.width - 4, i + 16);
                        ctx.lineTo(this.track.parent.canvas.width - 20, i + 16);
                        ctx.moveTo(this.track.parent.canvas.width - 4, i + 12);
                        ctx.lineTo(this.track.parent.canvas.width - 20, i + 12);
                        ctx.moveTo(this.track.parent.canvas.width - 4, i + 8);
                        ctx.lineTo(this.track.parent.canvas.width - 20, i + 8);
                        ctx.stroke();
                        break;

                    case 8:
                        ctx.beginPath();
                        ctx.moveTo(this.track.parent.canvas.width, i);
                        ctx.lineTo(this.track.parent.canvas.width - 25, i);
                        ctx.stroke();
                        ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
                        if (this.track.displayText && this.track.displayText[0] == 1 && this.track.displayText[1] == i / 25) {
                            ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#DDDDDD";
                        }
                        ctx.fillRect(this.track.parent.canvas.width - 25, i, 25, 25);
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#ff0";
                        ctx.beginPath();
                        ctx.arc(this.track.parent.canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 9:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#00f";
                        ctx.beginPath();
                        ctx.arc(this.track.parent.canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    
                    case 10:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#ff0";
                        ctx.beginPath();
                        ctx.moveTo(this.track.parent.canvas.width - 17, i + 10);
                        ctx.lineTo(this.track.parent.canvas.width - 17, i + 16);
                        ctx.lineTo(this.track.parent.canvas.width - 17 + 12 * Math.cos(Math.PI / 6), i + 13);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 11:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#0f0";
                        ctx.beginPath();
                        ctx.moveTo(this.track.parent.canvas.width - 9, i + 8);
                        ctx.lineTo(this.track.parent.canvas.width - 15, i + 8);
                        ctx.lineTo(this.track.parent.canvas.width - 12, i + 17 + 1 * Math.cos(Math.PI / 6));
                        ctx.closePath();
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 12:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#f00";
                        ctx.beginPath();
                        ctx.arc(this.track.parent.canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 13:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#eee";
                        ctx.beginPath();
                        ctx.arc(this.track.parent.canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 14:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#0ff";
                        ctx.beginPath();
                        ctx.arc(this.track.parent.canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 15:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#f0f";
                        ctx.beginPath();
                        ctx.arc(this.track.parent.canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;

                    case 17:
                        ctx.beginPath();
                        ctx.moveTo(this.track.parent.canvas.width, i);
                        ctx.lineTo(this.track.parent.canvas.width - 25, i);
                        ctx.stroke();
                        ctx.fillStyle = this.track.parent.theme.dark ? "#1B1B1B" : "#FFFFFF";
                        if (this.track.displayText && this.track.displayText[0] == 1 && this.track.displayText[1] == i / 25) {
                            ctx.fillStyle = this.track.parent.theme.dark ? "#333333" : "#DDDDDD";
                        }
                        ctx.fillRect(this.track.parent.canvas.width - 25, i, 25, 25);
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "#f90000";
                        ctx.beginPath();
                        ctx.moveTo(this.track.parent.canvas.width - 8, i + 8);
                        ctx.lineTo(this.track.parent.canvas.width - 18, i + 18);
                        ctx.moveTo(this.track.parent.canvas.width - 18, i + 8);
                        ctx.lineTo(this.track.parent.canvas.width - 8, i + 18);
                        ctx.stroke();
                        break;
                }
                
                ctx.restore();
            }
        }
    }
}