/**
 * MyOctagonTile class
 */
class MyOctagonTile {
    constructor(orchestrator, id, row, column) {
        this.orchestrator = orchestrator;
        this.id = id;
        this.column = column;
        this.row = row;
    }
    /**
     * Adds a piece to the tile
     * @param {*} piece piece to add
     */
    addPiece(piece) {
        this.piece = piece;
    }

    /**
     * Gets piece holded by the tile (null if none)
     */
    getPiece() {
        return this.piece;
    }

    /**
     * Removes piece from the tile
     */
    removePiece() {
        this.piece = null;
    }

    /**
     * Displays tile and piece it holds, if any.
     */
    display() {
        const scene = this.orchestrator.getScene();

        scene.pushMatrix();
        scene.translate(this.column, 0, this.row);

        if (this.piece) {
            scene.graph.templates['octagonTile'].display();
            this.piece.display();
        } else {
            scene.registerForPick(this.id, this);
            scene.graph.templates['octagonTile'].display();
            scene.clearPickRegistration();
        }

        scene.popMatrix();
    }
}