/**
 * MyTile class
 */
class MySquareTile extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene, row, column, scale) {
        super(scene);
        this.column = column;
        this.row = row;
        this.scale = scale;
    }

    setComponent(component) {
        this.component = component;
    }

    setPieceComponent(component, player) {
        if (this.piece)
            this.piece.setComponent(component, player);
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
     * Display board.
     */
    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.column - 0.5, 0, this.row - 0.5);
        this.scene.scale(this.scale, 1, this.scale);

        if (this.piece)
            this.piece.display();
        else {
            this.component.display();
        }

        this.scene.popMatrix();
    }
}