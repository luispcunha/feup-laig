/**
 * MySquareTile class, similar to MyOctagonTile class
 */
class MySquareTile {
    constructor(orchestrator, row, column, scale) {
        this.orchestrator = orchestrator;
        this.column = column;
        this.row = row;
        this.scale = scale;
    }

    getPiece(piece) {
        return piece;
    }

    addPiece(piece) {
        this.piece = piece;
    }

    removePiece() {
        this.piece = null;
    }

    /**
     * Displays tile.
     */
    display() {
        const scene = this.orchestrator.getScene();

        scene.pushMatrix();
        scene.translate(this.column - 0.5, 0, this.row - 0.5);
        scene.scale(this.scale, 1, this.scale);

        if (this.piece)
            this.piece.display();

        this.orchestrator.getScene().graph.templates['squareTile'].display();


        scene.popMatrix();
    }
}