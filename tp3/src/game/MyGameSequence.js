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

    getNextPlayer() {
        return this.getCurrentState().nextPlay.player;
    }

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

    pop() {
        if (this.states.length > 1) {
            this.states.pop();
        }

        if (this.moves.length > 1) {
            this.moves.pop();
        }
    }

    numStates() {
        return this.states.length;
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