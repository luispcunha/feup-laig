class MyGameSequence {
    /**
     * @constructor
     */
    constructor() {
        this.states = [];
        this.moves = [];

        this.currentMovieIdx = 0;
    }

    reset() {
        this.states = [];
        this.moves = [];
    }

    addState(state) {
        this.states.push(state);
    }

    addSequence(state, move) {
        this.states.push(state);
        this.moves.push(move);
    }

    getCurrentState() {
        return this.states[this.states.length - 1];
    }

    undo() {
        if (this.states.length > 1) {
            this.states.pop();
        }

        if (this.moves.length > 1) {
            this.moves.pop();
        }
    }

    startMovie() {
        this.currentMovieIdx = 0;
    }

    getMovieSequence() {
        if (this.states[this.currentMovieIdx]) {
            return {
                state: this.states[this.currentMovieIdx],
                move: this.moves[this.currentMovieIdx++],
            }
        }
    }

    isMovieOver() {
        return this.currentMovieIdx >= this.states.length;
    }
}