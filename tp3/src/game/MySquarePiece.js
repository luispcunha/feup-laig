/**
 * MySquarePiece class
 */
class MySquarePiece {
    /**
     * @constructor
     */
    constructor(orchestrator, player) {
        this.orchestrator = orchestrator;
        this.player = player;
    }

    /**
     * Display piece.
     */
    display() {
        this.orchestrator.getScene().graph.templates['squarePiece'][this.player].display();
    }
}