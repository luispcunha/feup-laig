/**
 * Class representing an octagon piece and the player it belongs
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
     * Display octagon piece
     */
    display() {
        this.orchestrator.getScene().graph.templates['octagonPiece'][this.player].display();
    }
}