const PlayerType = {
    human: 0,
    lvl1: 1,
    lvl2: 2
}

class MyGameOrchestrator {
    /**
     * @constructor
     */
    constructor(scene) {
        this.gameSequence = new MyGameSequence();
        this.logic = new PrologLogicEngine();
        this.p1type = PlayerType.human;
        this.p2type = PlayerType.human;
        this.scene = scene;
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
        const nextState = await this.logic.makeMove(this.gameSequence.getCurrentState(), move);

        this.gameSequence.addState(nextState);
        this.board.fillBoards(nextState.boards);

        const gameover = await this.logic.gameOver(nextState);

        if (gameover != -1) {
            console.log("GAME ENDED: " + gameover + " won");
            return;
        }

        this.nextTurn();
        //this.scene.setPlayerCamera(nextState.nextPlay.player);
    }

    async onObjectSelected(object, id) {
        if (object instanceof MyOctagonTile) {
            this.updateGameState({ x: object.column, y: object.row });
        }
    }

    start() {
        const p = this.resetGameState();

        p.then(() => { this.nextTurn() });
    }

    undo() {
        this.gameSequence.undo();
        this.board.fillBoards(this.gameSequence.getCurrentState().boards);
    }

    nextTurn() {
        const nextPlayer = this.gameSequence.getCurrentState().nextPlay.player;

        let level;

        if (nextPlayer == 1)
            level = this.p1Type;
        else if (nextPlayer == 2)
            level = this.p2Type;

        if (level == PlayerType.human) {
            this.scene.setPlayerCamera(nextPlayer);
            return;
        }

        this.botTurn(level);
    }

    async botTurn(level) {
        let move;


        if (level == 1)
            move = await this.logic.getRandomMove(this.gameSequence.getCurrentState());
        else if (level == 2)
            move = await this.logic.getGreedyMove(this.gameSequence.getCurrentState());

        console.log(move);

        this.updateGameState(move);
    }
}
