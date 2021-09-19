export default self = {
    descriptions: {
        left: {
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
            2: "Lines ( Q - Hold to snap )",
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
        }
    },
    brush: {
        length: 20
    },
    grid: 1,
    powerups: 0
}