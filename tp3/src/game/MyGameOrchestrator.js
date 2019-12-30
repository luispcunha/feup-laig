class MyGameOrchestrator {
    /**
     * @constructor
     */
    constructor() {
        this.gameSequence = new MyGameSequence();
        this.logic = new PrologLogicEngine();
    }

    async setBoard(gameboard) {
        this.gameboard = gameboard;


        const whatever = await this.logic.getInitialState(gameboard.nColumns, gameboard.nRows);
        console.log(whatever);

        const newstate = await this.logic.makeMove(whatever, {x:1, y:1});
        console.log(newstate);

        const response = await this.logic.gameOver(newstate);
        console.log(response);

        const move = await this.logic.getGreedyMove(newstate);
        console.log(move);
    }

    getBoard() {
        return this.gameboard;
    }

    update(t) {

    }

    display() {
        this.gameboard.display();
    }

    managePick(pickMode, pickResults) {
        if (pickMode == false) {
            if (pickResults != null && pickResults.length > 0) {

                for (let i = 0; i < pickResults.length; i++) {
                    const obj = pickResults[i][0];
                    if (obj) {
                        const customId = pickResults[i][1];
                        console.log("Picked object: " + obj + ", with pick id " + customId);

                        this.gameboard.addPiece(obj.column, obj.row, 1);
                    }
                }

                pickResults.splice(0, pickResults.length);
            }
        }
    }
}
