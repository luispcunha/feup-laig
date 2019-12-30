class MyGameOrchestrator {
    /**
     * @constructor
     */
    constructor() {

    }

    setBoard(gameboard) {
        this.gameboard = gameboard;
    }

    getBoard() {
        return this.gameboard;
    }

    update(t) {

    }

    display() {
        this.gameboard.display();
    }
}
