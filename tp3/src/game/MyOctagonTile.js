/**
 * MyTile class
 */
class MyOctagonTile extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene, id, row, column) {
        super(scene);
        this.id = id;
        this.column = column;
        this.row = row;
    }

    setComponent(component) {
        this.component = component;
    }

    setPieceComponent(component, player) {
        if (this.piece)
            this.piece.setComponent(component, player);
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
        this.scene.pushMatrix();
        this.scene.translate(this.column, 0, this.row);

        if (this.piece) {
            this.piece.display();
        } else {
            this.scene.registerForPick(this.id, this);
            this.component.display();
            this.scene.clearPickRegistration();
        }

        this.scene.popMatrix();
    }
}