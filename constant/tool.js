import Vector from "../class/Vector.js";
import { canvas, ctx, track } from "../bootstrap.js";

export default self = {
    draw: {
        get left() {
            ctx.lineWidth = 1;
            ctx.lineCap = "round";
            ctx.globalAlpha = 1;
            for (var i = 0; i < 200; i += 25) {
                if (i == 75 || i == 125) continue;
                ctx.beginPath();
                ctx.moveTo(25, i);
                ctx.lineTo(25, i + 25);
                ctx.lineTo(0, i + 25);
                ctx.stroke();
                ctx.fillStyle = "#fff";
                ctx.fillRect(0, i, 25, 25);
                ctx.strokeStyle = ctx.fillStyle = "#000";
                switch (i / 25) {
                    case 0:
                        ctx.fillRect(7, 5, 4, 14);
                        ctx.fillRect(14, 5, 4, 14);
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
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(0, i, 25, 24);
                        ctx.fillStyle = "#000";
                        ctx.strokeStyle = "#777";
                        ctx.beginPath();
                        for (var s = 0; s < 360; s+=30) {
                            ctx.moveTo(12.5, i + 12.5);
                            ctx.lineTo(12.5 + 8 * Math.cos(s * Math.PI / 180), i + 12.5 + 8 * Math.sin(s * Math.PI / 180));
                        }
                        ctx.stroke();
                        ctx.strokeStyle = "#000";
                        ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        ctx.arc(12.5, i + 12.5, 8, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.lineWidth = 1;
                        break;
                    case 6:
                        ctx.beginPath();
                        ctx.moveTo(0, i);
                        ctx.lineTo(25, i);
                        ctx.stroke();
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(0, i, 25, 24);
                        ctx.fillStyle = "#000";
                        ctx.lineWidth = 2;
                        ctx.shadowColor = "#000";
                        ctx.shadowOffsetX = 1;
                        ctx.shadowOffsetY = 1;
                        ctx.shadowBlur = 3;
                        ctx.beginPath();
                        ctx.moveTo(6, i + 19);
                        ctx.lineTo(19, i + 6);
                        ctx.stroke();
                        ctx.shadowColor = "#ffffff00";
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
                }
            }
        },
        get right() {
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
            for (var i = 0; i < 450; i += 25) {
                if (i == 175 || i == 400) continue;
                ctx.beginPath();
                ctx.moveTo(canvas.width - 25, i);
                ctx.lineTo(canvas.width - 25, i + 25);
                ctx.lineTo(canvas.width, i + 25);
                ctx.stroke();
                ctx.fillStyle = "#fff";
                ctx.fillRect(canvas.width - 25, i, 25, 25);
                ctx.strokeStyle = ctx.fillStyle = "#000";
                switch (i / 25) {
                    case 0:
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(canvas.width, i + 1, 25, 24);
                        ctx.strokeStyle = ctx.fillStyle = "#000";
                        ctx.beginPath();
                        ctx.arc(canvas.width - 12.5, i + 12.5, 2, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 1:
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(canvas.width, i + 1, 25, 24);
                        ctx.fillStyle = ctx.strokeStyle = "#CCC"
                        ctx.beginPath();
                        ctx.arc(canvas.width - 12.5, i + 12.5, 2, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 2:
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(canvas.width, i + 1, 25, 24);
                        ctx.strokeStyle = ctx.fillStyle = "#000";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(canvas.width - 7, i + 8);
                        ctx.lineTo(canvas.width - 16, i + 17);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 3:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = ctx.strokeStyle = "#CCC";
                        ctx.beginPath();
                        ctx.moveTo(canvas.width - 7, i + 8);
                        ctx.lineTo(canvas.width - 16, i + 17);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 4:
                        ctx.strokeStyle = ctx.fillStyle = "#FFB6C1";
                        ctx.beginPath();
                        ctx.arc(canvas.width - 12.5, i + 12.5, 6, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 5:
                        ctx.fillRect(canvas.width - 13, i + 8, 2, 10);
                        ctx.fillRect(canvas.width - 17, i + 12, 10, 2);
                        ctx.beginPath();
                        ctx.moveTo(canvas.width - 16, i + 8);
                        ctx.lineTo(canvas.width - 8, i + 8);
                        ctx.lineTo(canvas.width - 12, i + 14 - 12 * Math.cos(Math.PI / 6));
                        ctx.moveTo(canvas.width - 16, i + 18);
                        ctx.lineTo(canvas.width - 8, i + 18);
                        ctx.lineTo(canvas.width - 12, i + 12 + 12 * Math.cos(Math.PI / 6));
                        ctx.moveTo(canvas.width - 17, i + 9);
                        ctx.lineTo(canvas.width - 17, i + 17);
                        ctx.lineTo(canvas.width - 11 - 12 * Math.cos(Math.PI / 6), i + 13);
                        ctx.moveTo(canvas.width - 7, i + 9);
                        ctx.lineTo(canvas.width - 7, i + 17);
                        ctx.lineTo(canvas.width - 13 + 12 * Math.cos(Math.PI / 6), i + 13);
                        ctx.fill();
                        break;
                    case 6:
                        ctx.strokeStyle = "#CCC";
                        ctx.beginPath();
                        ctx.moveTo(canvas.width - 17, i + 5);
                        ctx.lineTo(canvas.width - 17, i + 19);
                        ctx.moveTo(canvas.width - 12, i + 5);
                        ctx.lineTo(canvas.width - 12, i + 19);
                        ctx.moveTo(canvas.width - 7, i + 5);
                        ctx.lineTo(canvas.width - 7, i + 19);
                        ctx.moveTo(canvas.width - 4, i + 16);
                        ctx.lineTo(canvas.width - 20, i + 16);
                        ctx.moveTo(canvas.width - 4, i + 12);
                        ctx.lineTo(canvas.width - 20, i + 12);
                        ctx.moveTo(canvas.width - 4, i + 8);
                        ctx.lineTo(canvas.width - 20, i + 8);
                        ctx.stroke();
                        break;
                    case 8:
                        ctx.beginPath();
                        ctx.moveTo(canvas.width, i);
                        ctx.lineTo(canvas.width - 25, i);
                        ctx.stroke();
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(canvas.width - 25, i, 25, 25);
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#ff0";
                        ctx.beginPath();
                        ctx.arc(canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 9:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#00f";
                        ctx.beginPath();
                        ctx.arc(canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 10:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#ff0";
                        ctx.beginPath();
                        ctx.moveTo(canvas.width - 17, i + 10);
                        ctx.lineTo(canvas.width - 17, i + 16);
                        ctx.lineTo(canvas.width - 17 + 12 * Math.cos(Math.PI / 6), i + 13);
                        ctx.closePath();
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 11:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#0f0";
                        ctx.beginPath();
                        ctx.moveTo(canvas.width - 9, i + 8);
                        ctx.lineTo(canvas.width - 15, i + 8);
                        ctx.lineTo(canvas.width - 12, i + 17 + 1 * Math.cos(Math.PI / 6));
                        ctx.closePath();
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 12:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#f00";
                        ctx.beginPath();
                        ctx.arc(canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 13:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#eee";
                        ctx.beginPath();
                        ctx.arc(canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 14:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#0ff";
                        ctx.beginPath();
                        ctx.arc(canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 15:
                        ctx.lineWidth = 2;
                        ctx.fillStyle = "#f0f";
                        ctx.beginPath();
                        ctx.arc(canvas.width - 12.5, i + 12.5, 3, 0, 2 * Math.PI);
                        ctx.stroke();
                        ctx.fill();
                        break;
                    case 17:
                        ctx.beginPath();
                        ctx.moveTo(canvas.width, i);
                        ctx.lineTo(canvas.width - 25, i);
                        ctx.stroke();
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(canvas.width - 25, i, 25, 25);
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "#f90000";
                        ctx.beginPath();
                        ctx.moveTo(canvas.width - 8, i + 8);
                        ctx.lineTo(canvas.width - 18, i + 18);
                        ctx.moveTo(canvas.width - 18, i + 8);
                        ctx.lineTo(canvas.width - 8, i + 18);
                        ctx.stroke();
                        break;
                }
                ctx.fillStyle = ctx.strokeStyle = "#000";
                ctx.lineWidth = 1;
            }
        },
        get bottomLeft() {
            ctx.lineWidth = 1;
            ctx.globalAlpha = 1;
            ctx.fillStyle = "#fff";
            ctx.moveTo(0, 300);
            ctx.lineTo(25, 300);
            ctx.lineTo(25, 350);
            ctx.lineTo(0, 350);
            ctx.stroke();
            if (self.selected == "eraser") {
                ctx.moveTo(0, 375);
                ctx.lineTo(25, 375);
                ctx.lineTo(25, 450);
                ctx.lineTo(0, 450);
                ctx.stroke();
                ctx.fillRect(0, 375, 25, 75);
            }
            ctx.fillRect(0, 300, 25, 50);
            ctx.fillStyle = "#000";
            ctx.fillRect(11.5, 306, 2, 12.5);
            ctx.fillRect(6, 311.5, 12.5, 2);
            ctx.fillRect(6, 338, 12.5, 2);
            if (self.selected == "eraser") {
                ctx.beginPath();
                ctx.arc(12.5, 387.5, 3, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = ctx.strokeStyle = "#aaa";
                ctx.beginPath();
                ctx.arc(12.5, 412.5, 3, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#000";
                ctx.fillStyle = "#ff0";
                ctx.beginPath();
                ctx.arc(12.5, 437.5, 3, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fill();
                ctx.fillStyle = ctx.strokeStyle = "#000";
            }
        }
    },
    descriptions: {
        left: {
            0: "Pause ( SPACE )",
            1: "Restart ( ENTER )",
            2: "Cancel Checkpoint ( BACKSPACE )",
            4: "Switch Bike ( Ctrl + B - Arrows to control, Z to turn )",
            6: "Enable line shading",
            7: "Enable fullscreen ( F )",
            12: "Increase Size ( A + SCROLL )",
            13: "Decrease Size ( A + SCROLL )",
            get 15() {
                return "Erase Physics ( " + self.eraser.settings.physics + " )";
            },
            get 16() {
                return "Erase Scenery ( " + self.eraser.settings.scenery + " )";
            },
            get 17() {
                return "Erase Powerups ( " + self.eraser.settings.powerups + " )";
            }
        },
        right: {
            0: "Brush ( A - Hold to snap, hold & scroll to adjust size )",
            1: "Scenery brush ( S - Hold to snap, hold & scroll to adjust size )",
            2: "Lines ( backWheel - Hold to snap )",
            3: "Scenery lines ( W - Hold to snap )",
            4: "Eraser ( E - Hold & scroll to adjust size )",
            5: "Camera ( R - Release or press again to switch back, scroll to zoom )",
            6: "Enable grid snapping ( G )",
            8: "Goal",
            9: "Checkpoint",
            10: "Booster",
            11: "Gravity Modifier",
            12: "Bomb",
            13: "Slow-Mo",
            14: "Antigravity",
            15: "Teleporter",
            17: "Undo ( Z )"
        }
    },
    selected: "camera",
    selectedCache: "camera",
    toggleCamera: !1,
    eraser: {
        size: 15,
        settings: {
            physics: !0,
            scenery: !0,
            powerups: !0
        },
        draw() {
            ctx.fillStyle = "#ffb6c199";
            ctx.beginPath();
            ctx.arc(self.mouse.pos.toPixel().x, self.mouse.pos.toPixel().y, (this.size - 1) * track.zoom, 0, 2 * Math.PI, !0);
            ctx.fill();
        }
    },
    brush: {
        length: 20
    },
    grid: 1,
    powerups: 0,
    mouse: {
        pos: new Vector(0, 0),
        old: new Vector(40, 50)
    }
}