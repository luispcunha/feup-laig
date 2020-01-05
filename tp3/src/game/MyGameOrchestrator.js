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
    movieAnimation: 5,
    gameOver: 6
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

        this.timer = new MyTimer(this);
    }

    onSceneInited() {
        this.numberTextures = [];
        this.gameOverTextures = [];


        let path = "scenes/images/numbers/";

        for (let i = 0; i < 10; i++) {
            this.numberTextures[i] = new CGFtexture(this.getScene(), path + i + ".jpg");
        }

        this.colonTexture = new CGFtexture(this.getScene(), path + "colon.jpg");

        path = "scenes/images/gameover/";

        for (let i = 1; i <= 2; i++) {
            this.gameOverTextures[i] = new CGFtexture(this.getScene(), path + i + ".png");
        }


        this.gameOver = new MyOverlayElement(this.getScene(), -0.11, 0.11, 0.70, 0.85);


        this.changeState(GameStates.menu);
        this.timer.init();
    }

    changeState(newState) {
        if (newState == GameStates.gameOver) setTimeout(
            () => this.quit(),
            8000
        );
        this.state = newState;

        switch (newState) {
            case GameStates.menu:
                this.scene.interface.initGameControlsMenu();
                break;

            case GameStates.humanPlaying:
                this.scene.interface.initGameControlsHumanPlaying();
                break;

            case GameStates.gameOver:
                this.scene.interface.initGameControlsGameOver();
                break;

            default:
                this.scene.interface.initGameControlsOnlyQuit();
                break;
        }
    }

    display() {
        if (this.timer)
            this.timer.display();

        if (this.state == GameStates.gameOver) {
            this.gameOver.display();
        }
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
        this.changeState(GameStates.moveAnimation);
    }

    onObjectSelected(object, id) {
        if (object instanceof MyOctagonTile && this.state == GameStates.humanPlaying) {
            this.executeMove({ col: object.column, row: object.row });
        }
    }

    quit() {
        this.timer.reset();
        this.timer.hide();

        this.resetGameState().then(() => {
            this.scene.setPlayerCamera();
            this.changeState(GameStates.menu);
            this.board.removeAnimatedPieces();
            this.board.fillBoards(this.gameSequence.getCurrentState().boards);
        });
    }

    start() {
        if (this.state == GameStates.menu || this.state == GameStates.gameOver) {
            this.resetGameState().then(() => {
                this.timer.reset();
                this.timer.show();
                this.timer.start();
                this.resumeGame();
            });
        }
    }

    undo() {
        if (this.state == GameStates.humanPlaying) {

            this.gameSequence.undo({ 1: this.p1Type, 2: this.p2Type });
            this.board.fillBoards(this.gameSequence.getCurrentState().boards);
            this.scene.setPlayerCamera(this.gameSequence.getNextPlayer());
        }
    }

    getNextPlayerType() {
        const nextPlayer = this.gameSequence.getNextPlayer();

        if (nextPlayer == 1)
            return this.p1Type;
        else if (nextPlayer == 2)
            return this.p2Type;
    }

    async resumeGame() {
        this.board.fillBoards(this.gameSequence.getCurrentState().boards);

        const level = this.getNextPlayerType();

        if (level == PlayerType.human) {
            this.changeState(GameStates.humanPlaying);
        } else {
            this.changeState(GameStates.botPlaying);
        }

        const gameover = await this.logic.gameOver(this.gameSequence.getCurrentState());
        if (gameover != -1) {
            this.changeState(GameStates.gameOver);
            this.timer.stop();
            this.scene.setPlayerCamera();
            this.gameOver.setTexture(this.gameOverTextures[gameover]);
            return;
        }

        this.nextTurn(level);
    }

    nextTurn(level) {
        const nextPlayer = this.gameSequence.getNextPlayer();
        let p;

        if (level == PlayerType.human) {
            this.scene.setPlayerCamera(nextPlayer);
            return;
        }
        else if (level == PlayerType.lvl1)
            p = this.logic.getRandomMove(this.gameSequence.getCurrentState());
        else if (level == PlayerType.lvl2)
            p = this.logic.getGreedyMove(this.gameSequence.getCurrentState());

        p.then((move) => {
            this.executeMove(move);
        });
    }

    movie() {
        if (this.state == GameStates.humanPlaying || this.state == GameStates.menu || this.state == GameStates.gameOver) {
            this.gameSequence.startMovie();
            this.previousState = this.state;
            this.changeState(GameStates.movie);
            this.resumeMovie();
        }
    }

    resumeMovie() {
        const movieSequence = this.gameSequence.getMovieSequence();
        const player = movieSequence.state.nextPlay.player;

        this.board.fillBoards(movieSequence.state.boards);

        if (this.gameSequence.isMovieOver()) {
            this.changeState(this.previousState);
            return;
        }

        this.animator.animateMove(player, movieSequence.move);

        this.changeState(GameStates.movieAnimation);
    }
}
