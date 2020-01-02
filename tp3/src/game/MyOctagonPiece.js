/**
 * MyTile class
 */
class MyOctagonPiece {
    /**
     * @constructor
     */
    constructor(orchestrator, player) {
        this.orchestrator = orchestrator;
        this.player = player;
    }

    /**
     * Display board.
     */
    display() {
        this.orchestrator.getScene().graph.templates['octagonPiece'][this.player].display();
    }
}