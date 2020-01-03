const PlayerType = {
    human: 0,
    lvl1: 1,
    lvl2: 2
};

const GameStates = {
    menu: 0,
    humanPlaying: 1,
    botPlaying: 2,
    moveAnimation: 3,
    movie: 4,
    movieAnimation: 5
};

class MyGameOrchestrator {
    /**
     * @constructor
     */
    constructor(scene) {
        this.scene = scene;

        this.nColumns = 8;
        this.nRows = 8;

        this.gameSequence = new MyGameSequence();
        this.logic = new PrologLogicEngine();
        this.animator = new MyAnimator(this);
        this.board = new MyGameBoard(this, this.nColumns, this.nRows);

        this.p1Type = PlayerType.human;
        this.p2Type = PlayerType.human;

        this.state = GameStates.menu;
        this.timer = new MyTimer(this);
    }

    onSceneInited() {
        this.timer.init();
    }

    display() {
        if (this.timer)
            this.timer.display();
    }

    getScene() {
        return this.scene;
    }

    getBoard() {
        return this.board;
    }

    changeBoardSize() {
        if (this.state == GameStates.menu) {
            this.board.setSize(this.nColumns, this.nRows);
        }
    }

    update(t) {
        switch (this.state) {
            case GameStates.moveAnimation:
                this.animator.update(t);

                if (! this.animator.isAnimating()) {
                    this.resumeGame();
                }

                break;
            case GameStates.movieAnimation:
                this.animator.update(t);

                if (! this.animator.isAnimating()) {
                    this.resumeMovie();
                }

                break;
            default:
                break;
        }

        this.timer.update(t);
    }

    async resetGameState() {
        const state = await this.logic.getInitialState(this.board.nColumns, this.board.nRows);

        this.gameSequence.reset();
        this.gameSequence.addState(state);
    }

    managePick(pickMode, pickResults) {
        if (pickMode == false) {
            if (pickResults != null && pickResults.length > 0) {

                for (let i = 0; i < pickResults.length; i++) {
                    const obj = pickResults[i][0];
                    if (obj) {
                        const uniqueID = pickResults[i][1];
                        this.onObjectSelected(obj, uniqueID)
                    }
                }

                // clear results
                pickResults.splice(0, pickResults.length);
            }
        }
    }

    async executeMove(move) {

        const player = this.gameSequence.getCurrentState().nextPlay.player;

        const nextState = await this.logic.makeMove(this.gameSequence.getCurrentState(), move);

        this.gameSequence.addSequence(nextState, move);

        this.animator.animateMove(player, move);
        this.state = GameStates.moveAnimation;
    }

    onObjectSelected(object, id) {
        if (object instanceof MyOctagonTile && this.state == GameStates.humanPlaying) {
            this.executeMove({ col: object.column, row: object.row });
        }
    }

    start() {
        this.resetGameState().then(() => {
            this.timer.start();
            this.resumeGame();
        });
    }

    undo() {
        this.gameSequence.undo();
        this.board.fillBoards(this.gameSequence.getCurrentState().boards);
        this.scene.setPlayerCamera(this.gameSequence.getCurrentState().nextPlay.player);
    }

    async resumeGame() {
        this.board.fillBoards(this.gameSequence.getCurrentState().boards);

        const gameover = await this.logic.gameOver(this.gameSequence.getCurrentState());
        if (gameover != -1) {
            this.state = GameStates.menu;
            console.log("player " + gameover + " won");
            return;
        }

        const nextPlayer = this.gameSequence.getCurrentState().nextPlay.player;

        let level;

        if (nextPlayer == 1)
            level = this.p1Type;
        else if (nextPlayer == 2)
            level = this.p2Type;

        if (level == PlayerType.human) {
            this.state = GameStates.humanPlaying;
            this.scene.setPlayerCamera(nextPlayer);
            return;
        }

        this.state = GameStates.botPlaying;
        this.botTurn(level);
    }

    botTurn(level) {
        let p;

        if (level == 1)
            p = this.logic.getRandomMove(this.gameSequence.getCurrentState());
        else if (level == 2)
            p = this.logic.getGreedyMove(this.gameSequence.getCurrentState());

        p.then((move) => {
            this.executeMove(move);
        });
    }

    movie() {
        this.gameSequence.startMovie();
        this.state = GameStates.movie;
        this.resumeMovie();
    }

    resumeMovie() {
        const movieSequence = this.gameSequence.getMovieSequence();
        const player = movieSequence.state.nextPlay.player;

        this.board.fillBoards(movieSequence.state.boards);

        if (this.gameSequence.isMovieOver()) {
            this.state = GameStates.playing;
            return;
        }

        this.animator.animateMove(player, movieSequence.move);

        this.state = GameStates.movieAnimation;
    }
}
