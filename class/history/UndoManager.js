export default class UndoManager {
    constructor() {
        this.undoStack = [];
        this.undoPosition = 0
    }
    push(a) {
        this.undoStack.length = Math.min(this.undoStack.length, this.undoPosition + 1);
        this.undoPosition = this.undoStack.push(a) - 1;
        return this
    }
    undo() {
        if (this.undoPosition >= 0) {
            var a = this.undoStack[this.undoPosition--].undo;
            if (typeof a == "function") {
                a(this);
            }
        }
        return this
    }
    redo() {
        if (this.undoPosition < this.undoStack.length - 1) {
            var a = this.undoStack[++this.undoPosition].redo;
            if (typeof a == "function") {
                a(this);
            }
        }
        return this
    }
}