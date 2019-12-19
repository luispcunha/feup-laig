/**
 * MyBoard class
 */
class MyBoard extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene, lines, columns) {
        super(scene);
        this.octagonTile = new MyOctagonalTile(scene);
        this.squareTile = new MySquareTile(scene);

        this.lines = lines;
        this.columns = columns;
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
     * Display security camera.
     */
    display() {
        this.logPicking();

        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.lines; j++) {
                this.scene.pushMatrix();

                this.scene.translate(this.octagonTile.octagon.apothem * 2 * i, 0, this.octagonTile.octagon.apothem * 2 * j);

                this.scene.registerForPick((i + 1) * (j + 1), `(${i}, ${j})`);
                this.octagonTile.display();
                this.scene.clearPickRegistration();

                this.displaySquareTiles(i, j);

                this.scene.popMatrix();
            }
        }
    }

    displaySquareTiles(column, line) {

        if (! (column == 0 && line == 0)) {
            this.scene.pushMatrix();
            this.scene.translate(- this.octagonTile.octagon.apothem, 0, - this.octagonTile.octagon.apothem);
            this.squareTile.display();
            this.scene.popMatrix();
        }

        if (! (column == this.columns - 1 && line == 0)) {
            this.scene.pushMatrix();
            this.scene.translate(this.octagonTile.octagon.apothem, 0, - this.octagonTile.octagon.apothem);
            this.squareTile.display();
            this.scene.popMatrix();
        }

        if (line == this.lines - 1) {
            if (column > 0) {
                this.scene.pushMatrix();
                this.scene.translate(- this.octagonTile.octagon.apothem, 0, this.octagonTile.octagon.apothem);
                this.squareTile.display();
                this.scene.popMatrix();
            }

            if (column < this.columns - 1) {
                this.scene.pushMatrix();
                this.scene.translate(this.octagonTile.octagon.apothem, 0, this.octagonTile.octagon.apothem);
                this.squareTile.display();
                this.scene.popMatrix();
            }
        }
    }
}