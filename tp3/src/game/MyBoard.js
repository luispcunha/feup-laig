/**
 * MyBoard class
 */
class MyBoard extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene, width, height) {
        super(scene);

        this.width = width;
        this.height = height;

        this.nRows = 8;
        this.nColumns = 8;

        this.squaresScale = Math.tan(Math.PI / 8);

        this.widthScale = width / this.nRows;
        this.heightScale = height / this.nColumns;

        this.squareBoard = [
            [0, 1, 1, 1, 1, 1, 1, 1, 0],
            [2, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 2],
            [2, 0, 0, 0, 0, 0, 0, 0, 2],
            [0, 1, 1, 1, 1, 1, 1, 1, 0]
        ];

        this.octagonBoard = [
            [1, 2, 1, 2, 1, 2, 1, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0]
        ];
    }

    logPicking() {
        if (this.scene.pickMode == false) {
            if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
                for (var i = 0; i < this.scene.pickResults.length; i++) {
                    var obj = this.scene.pickResults[i][0];
                    if (obj) {
                        var customId = this.scene.pickResults[i][1];
                        console.log("Picked object: " + obj + ", with pick id " + customId);
                    }
                }
                this.scene.pickResults.splice(0, this.scene.pickResults.length);
            }
        }
    }

    /**
     * Display board.
     */
    display() {
        this.logPicking();

        this.scene.pushMatrix();
        this.scene.translate(- this.width / 2, 0, - this.height / 2);
        this.scene.scale(this.widthScale, 1, this.heightScale);
        this.scene.translate(0.5, 0, 0.5);

        for (let i = 0; i < this.nColumns; i++) {
            for (let j = 0; j < this.nRows; j++) {
                this.scene.pushMatrix();

                this.scene.translate(i, 0, j);

                this.displayOctagon(i, j);
                this.displaySquares(i, j);

                this.scene.popMatrix();
            }
        }

        this.scene.popMatrix();
    }

    displayOctagon(column, row) {
        switch (this.octagonBoard[row][column]) {
            case 0:
                this.scene.registerForPick((column + 1) * (this.nRows * row + 1), `(${column}, ${row})`);
                this.octagonTile.display();
                this.scene.clearPickRegistration();
                break;
            case 1:
                this.octagonPieceP1.display();
                break;
            case 2:
                this.octagonPieceP2.display();
                break;
        }
    }

    displaySquares(column, row) {

        if (! (column == 0 && row == 0)) {
            this.scene.pushMatrix();
            this.scene.translate(- 0.5, 0, - 0.5);
            this.scene.scale(this.squaresScale, 1, this.squaresScale);
            this.displaySquare(column, row);
            this.scene.popMatrix();
        }

        if (! (column == this.nColumns - 1 && row == 0)) {
            this.scene.pushMatrix();
            this.scene.translate(0.5, 0, - 0.5);
            this.scene.scale(this.squaresScale, 1, this.squaresScale);
            this.displaySquare(column + 1, row);
            this.scene.popMatrix();
        }

        if (row == this.nRows - 1) {
            if (column > 0) {
                this.scene.pushMatrix();
                this.scene.translate(- 0.5, 0, 0.5);
                this.scene.scale(this.squaresScale, 1, this.squaresScale);
                this.displaySquare(column, row + 1);
                this.scene.popMatrix();
            }

            if (column < this.nColumns - 1) {
                this.scene.pushMatrix();
                this.scene.translate(0.5, 0, 0.5);
                this.scene.scale(this.squaresScale, 1, this.squaresScale);
                this.displaySquare(column + 1, row + 1);
                this.scene.popMatrix();
            }
        }
    }

    displaySquare(column, row) {
        switch (this.squareBoard[row][column]) {
            case 0:
                this.squareTile.display();
                break;
            case 1:
                this.squarePieceP1.display();
                break;
            case 2:
                this.squarePieceP2.display();
                break;
        }
    }


    scaleTexCoords(ls, lt) {}
}