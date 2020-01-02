/**
 * MyTile class
 */
class MyOctagonTile {
    /**
     * @constructor
     */
    constructor(orchestrator, id, row, column) {
        this.orchestrator = orchestrator;
        this.id = id;
        this.column = column;
        this.row = row;
    }

    addPiece(piece) {
        this.piece = piece;
    }

    getPiece() {
        return this.piece;
    }

    removePiece() {
        this.piece = null;
    }

    /**
     * Display board.
     */
    display() {
        const scene = this.orchestrator.getScene();

        scene.pushMatrix();
        scene.translate(this.column, 0, this.row);

        if (this.piece) {
            this.piece.display();
        } else {
            scene.registerForPick(this.id, this);
            scene.graph.templates['octagonTile'].display();
            scene.clearPickRegistration();
        }

        scene.popMatrix();
    }
}