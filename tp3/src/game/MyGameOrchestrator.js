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
        this.animator = new MyAnimator(this);
        this.scene = scene;

        this.p1Type = PlayerType.human;
        this.p2Type = PlayerType.human;
    }

    getScene() {
        return this.scene;
    }

    async setBoard(board) {
        this.board = board;
    }

    getBoard() {
        return this.board;
    }

    update(t) {
        this.animator.update(t);
    }

    display() {
        // this.animator.display();
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

        this.animator.animateMove(1, move);

        const nextState = await this.logic.makeMove(this.gameSequence.getCurrentState(), move);

        this.gameSequence.addState(nextState);
        this.board.fillBoards(nextState.boards);

        const gameover = await this.logic.gameOver(nextState);

        if (gameover != -1) {
            console.log("GAME ENDED: " + gameover + " won");
            return;
        }

        this.nextTurn();
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

        if (level == PlayerType.human)
            return;

        this.botTurn(level);
    }

    async botTurn(level) {
        let move;

        if (level == 1)
            move = await this.logic.getRandomMove(this.gameSequence.getCurrentState());
        else if (level == 2)
            move = await this.logic.getGreedyMove(this.gameSequence.getCurrentState());

        this.updateGameState(move);
    }
}
