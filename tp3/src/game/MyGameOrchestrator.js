/**
 * Possible player types
 */
const PlayerType = {
    human: 0,
    lvl1: 1,
    lvl2: 2
};

/**
 * Possible game states
 */
const GameStates = {
    menu: 0,
    humanPlaying: 1,
    botPlaying: 2,
    moveAnimation: 3,
    movie: 4,
    movieAnimation: 5,
    gameOver: 6
};

/**
 * MyGameOrchestrator class that controls every aspect of the execution of the game, as well as its features
 */
class MyGameOrchestrator {
    /**
     * @constructor
     */
    constructor(scene) {
        this.scene = scene;

        // dimensions of the board
        this.nColumns = 8;
        this.nRows = 8;

        // instances of helper classes
        this.gameSequence = new MyGameSequence();
        this.logic = new PrologLogicEngine();
        this.animator = new MyAnimator(this);
        this.board = new MyGameBoard(this, this.nColumns, this.nRows);

        // types of the players
        this.p1Type = PlayerType.human;
        this.p2Type = PlayerType.human;

        // timer
        this.timer = new MyTimer(this);
    }

    /**
     * Do initial configuration that after scene is initializes
     */
    onSceneInited() {
        this.numberTextures = [];
        this.gameOverTextures = [];

        // load textures necessary for timer and gameover display

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

    /**
     * Changes current state, updating the interface
     */
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

    /**
     * Displays timer and gameover modal, if in the correct state
     */
    display() {
        if (this.timer)
            this.timer.display();

        if (this.state == GameStates.gameOver) {
            this.gameOver.display();
        }
    }

    /**
     * Returns orchestrator's scene instance
     */
    getScene() {
        return this.scene;
    }

    /**
     * Returns board
     */
    getBoard() {
        return this.board;
    }

    /**
     * Changes board dimensions
     */
    changeBoardSize() {
        if (this.state == GameStates.menu) {
            this.board.setSize(this.nColumns, this.nRows);
        }
    }

    /**
     * Updates game
     *
     * @param {*} t elapsed time since last update
     */
    update(t) {
        switch (this.state) {
            // if in animation states, updates animator
            case GameStates.moveAnimation:
                this.animator.update(t);

                // if animation of move is complete, resumes game
                if (! this.animator.isAnimating()) {
                    this.resumeGame();
                }

                break;
            case GameStates.movieAnimation:
                this.animator.update(t);

                // if animation of move in a movie is complete, resumes movie
                if (! this.animator.isAnimating()) {
                    this.resumeMovie();
                }

                break;
            default:
                break;
        }

        // updates time
        this.timer.update(t);
    }

    /**
     * Resets game state, by getting initial state from server and updates game sequence accordingly
     */
    async resetGameState() {
        const state = await this.logic.getInitialState(this.board.nColumns, this.board.nRows);

        this.gameSequence.reset();
        this.gameSequence.addState(state);
    }

    /**
     * Manages picking
     */
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

    /**
     * Executes a move
     * @param {*} move move to be executed
     */
    async executeMove(move) {
        // gets current player
        const player = this.gameSequence.getNextPlayer();

        // requests prolog to update game state by executing the move
        const nextState = await this.logic.makeMove(this.gameSequence.getCurrentState(), move);

        // updates game sequence
        this.gameSequence.addSequence(nextState, move);

        // asks animator to animate executed move
        this.animator.animateMove(player, move);
        this.changeState(GameStates.moveAnimation);
    }

    // picking selection handler
    onObjectSelected(object, id) {
        if (object instanceof MyOctagonTile && this.state == GameStates.humanPlaying) {
            this.executeMove({ col: object.column, row: object.row });
        }
    }

    /**
     * Quits current game and returns to menu state
     */
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

    /**
     * Starts game
     */
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

    /**
     * Undo previous play
     */
    undo() {
        if (this.state == GameStates.humanPlaying) {

            this.gameSequence.undo({ 1: this.p1Type, 2: this.p2Type });
            this.board.fillBoards(this.gameSequence.getCurrentState().boards);
            this.scene.setPlayerCamera(this.gameSequence.getNextPlayer());
        }
    }

    /**
     * Get type of the next player
     */
    getNextPlayerType() {
        const nextPlayer = this.gameSequence.getNextPlayer();

        if (nextPlayer == 1)
            return this.p1Type;
        else if (nextPlayer == 2)
            return this.p2Type;
    }

    /**
     * Resumes game, checking if it is over
     */
    async resumeGame() {
        // updates board, so it is correctly displayed
        this.board.fillBoards(this.gameSequence.getCurrentState().boards);

        // change state according to next player type
        const level = this.getNextPlayerType();
        if (level == PlayerType.human) {
            this.changeState(GameStates.humanPlaying);
        } else {
            this.changeState(GameStates.botPlaying);
        }

        // checks if game is over
        const gameover = await this.logic.gameOver(this.gameSequence.getCurrentState());
        if (gameover != -1) {
            // if so, changes state, stops timer and sets corresponding texture to the gameover modal
            this.changeState(GameStates.gameOver);
            this.timer.stop();
            this.scene.setPlayerCamera();
            this.gameOver.setTexture(this.gameOverTextures[gameover]);
            return;
        }

        // execute next turn
        this.nextTurn(level);
    }

    /**
     * Executes next turn
     * @param {*} level type of the player who will play the next turn
     */
    nextTurn(level) {
        const nextPlayer = this.gameSequence.getNextPlayer();
        let p;

        // if player is human, updates camera, and returns, waiting for it to choose a move
        // else, if next player is a bot, request server for a move
        if (level == PlayerType.human) {
            this.scene.setPlayerCamera(nextPlayer);
            return;
        }
        else if (level == PlayerType.lvl1)
            p = this.logic.getRandomMove(this.gameSequence.getCurrentState());
        else if (level == PlayerType.lvl2)
            p = this.logic.getGreedyMove(this.gameSequence.getCurrentState());

        // set move to callback execute move when move is loaded
        p.then((move) => {
            this.executeMove(move);
        });
    }

    /**
     * Starts movie if in an allowed state
     */
    movie() {
        if (this.state == GameStates.humanPlaying || this.state == GameStates.menu || this.state == GameStates.gameOver) {
            this.gameSequence.startMovie();
            this.timer.stop();
            this.previousState = this.state;
            this.changeState(GameStates.movie);
            this.resumeMovie();
        }
    }

    /**
     * Resumes movie
     */
    resumeMovie() {
        const movieSequence = this.gameSequence.getMovieSequence();
        const player = movieSequence.state.nextPlay.player;

        this.board.fillBoards(movieSequence.state.boards);

        // if movie is over, start timer again and return to the previous state
        if (this.gameSequence.isMovieOver()) {
            this.changeState(this.previousState);
            this.timer.start();
            return;
        }

        this.animator.animateMove(player, movieSequence.move);

        this.changeState(GameStates.movieAnimation);
    }
}
