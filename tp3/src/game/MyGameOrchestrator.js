const PlayerType = {
    human: 0,
    lvl1: 1,
    lvl2: 2
}

class MyGameOrchestrator {
    /**
     * @constructor
     */
    constructor() {
        this.gameSequence = new MyGameSequence();
        this.logic = new PrologLogicEngine();
        this.p1type = PlayerType.human;
        this.p2type = PlayerType.human;
    }

    async setBoard(board) {
        this.board = board;
    }

    getBoard() {
        return this.board;
    }

    update(t) {

    }

    display() {
        this.board.display();
    }

    async resetGameState() {
        const state = await this.logic.getInitialState(8, 8);

        this.board.fillBoards(state.boards);
        this.gameSequence.reset();
        this.gameSequence.addState(state);
    }

    async managePick(pickMode, pickResults) {
        if (pickMode == false) {
            if (pickResults != null && pickResults.length > 0) {

                for (let i = 0; i < pickResults.length; i++) {
                    const obj = pickResults[i][0];
                    if (obj) {
                        const uniqueID = pickResults[i][1];
                        await this.onObjectSelected(obj, uniqueID)
                    }
                }

                // clear results
                pickResults.splice(0, pickResults.length);
            }
        }
    }

    async updateGameState(move) {
        console.log(this.gameSequence.getCurrentState());

        const nextState = await this.logic.makeMove(this.gameSequence.getCurrentState(), move);
        const gameover = await this.logic.gameOver(nextState);

        console.log(gameover);

        this.gameSequence.addState(nextState);
        this.board.fillBoards(nextState.boards);
    }

    async onObjectSelected(object, id) {
        if (object instanceof MyOctagonTile) {
            this.updateGameState({ x: object.column, y: object.row });
        }
    }

    start() {
        this.resetGameState();
    }

    undo() {
        this.gameSequence.undo();
        this.board.fillBoards(this.gameSequence.getCurrentState().boards);
    }
}
