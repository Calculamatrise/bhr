export default class UndoManager {
    stack = [];
    position = 0;
    push(a) {
        this.stack.length = Math.min(this.stack.length, this.position + 1);
        this.position = this.stack.push(a) - 1;

        return this;
    }
    undo() {
        if (this.position >= 0) {
            let undo = this.stack[this.position--].undo;
            if (typeof undo == "function") {
                undo(this);
            }
        }

        return this;
    }
    redo() {
        if (this.position < this.stack.length - 1) {
            let redo = this.stack[++this.position].redo;
            if (typeof redo == "function") {
                redo(this);
            }
        }

        return this;
    }
}