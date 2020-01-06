/**
 * Class containing both the sequence of moves and states of a game
 */
class MyGameSequence {
    constructor() {
        this.states = [];
        this.moves = [];

        this.currentMovieIdx = 0;
    }

    /**
     * Resets game sequence
     */
    reset() {
        this.states = [];
        this.moves = [];
    }

    /**
     * Adds a new state
     * @param {} state new state
     */
    addState(state) {
        this.states.push(state);
    }

    /**
     * Adds a new state and a new move to the sequence
     * @param {*} state new state
     * @param {*} move new move
     */
    addSequence(state, move) {
        this.states.push(state);
        this.moves.push(move);
    }

    /**
     * Gets current state
     */
    getCurrentState() {
        return this.states[this.states.length - 1];
    }

    /**
     * Gets next player to play
     */
    getNextPlayer() {
        return this.getCurrentState().nextPlay.player;
    }

    /**
     * Undos last moves, until the last time a human move was made
     * @param {*} playerTypes
     */
    undo(playerTypes) {
        if (this.onlyBotPlays(playerTypes)) {
            return;
        }

        this.pop();

        let level = playerTypes[this.getNextPlayer()];
        while (level != PlayerType.human) {
            this.pop();
            level = playerTypes[this.getNextPlayer()];
        }
    }

    onlyBotPlays(playerTypes) {
        let humanPlays = 0;

        for (let i = 0; i < this.states.length - 1; i++) {
            const player = this.states[i].nextPlay.player;
            const type = playerTypes[player];

            if (type == PlayerType.human)
                humanPlays++;
        }

        return humanPlays == 0;
    }

    /**
     * Removes the last state and move from the stacks
     */
    pop() {
        if (this.states.length > 1) {
            this.states.pop();
        }

        if (this.moves.length > 1) {
            this.moves.pop();
        }
    }

    /**
     * Gets number of states
     */
    numStates() {
        return this.states.length;
    }

    /**
     * Starts a movie
     */
    startMovie() {
        this.currentMovieIdx = 0;
    }

    /**
     * Gets current movie sequence
     */
    getMovieSequence() {
        if (this.states[this.currentMovieIdx]) {
            return {
                state: this.states[this.currentMovieIdx],
                move: this.moves[this.currentMovieIdx++],
            }
        }
    }

    /**
     * Checks if movie is over
     */
    isMovieOver() {
        return this.currentMovieIdx >= this.states.length;
    }
}