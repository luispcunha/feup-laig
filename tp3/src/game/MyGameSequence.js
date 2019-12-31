class MyGameSequence {
    /**
     * @constructor
     */
    constructor() {
        this.states = [];
    }

    reset() {
        this.states = [];
    }

    addState(state) {
        this.states.push(state);
    }

    getCurrentState() {
        return this.states[this.states.length - 1];
    }

    undo() {
        if (this.states.length > 1)
            this.states.pop();
    }
}