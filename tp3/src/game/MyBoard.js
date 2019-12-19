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

        this.lines = 8;
        this.columns = 8;

        this.squaresScale = Math.tan(Math.PI / 8);

        this.boardScale = width / this.lines;
    }

    scaleTexCoords(ls, lt) {}


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

        this.scene.pushMatrix();
        this.scene.scale(this.boardScale, 1, this.boardScale);

        for (let i = 0; i < this.columns; i++) {
            for (let j = 0; j < this.lines; j++) {
                this.scene.pushMatrix();

                this.scene.translate(0.5 * 2 * i, 0, 0.5 * 2 * j);

                this.scene.registerForPick((i + 1) * (j + 1), `(${i}, ${j})`);

                this.octagonTile.process(new CGFappearance(this.scene), null, 1, 1);

                this.scene.clearPickRegistration();

                this.displaySquareTiles(i, j);

                this.scene.popMatrix();
            }
        }

        this.scene.popMatrix();
    }

    displaySquareTiles(column, line) {

        if (! (column == 0 && line == 0)) {
            this.scene.pushMatrix();
            this.scene.translate(- 0.5, 0, - 0.5);
            this.scene.scale(this.squaresScale, 1, this.squaresScale);
            this.squareTile.process(new CGFappearance(this.scene), null, 1, 1);
            this.scene.popMatrix();
        }

        if (! (column == this.columns - 1 && line == 0)) {
            this.scene.pushMatrix();
            this.scene.translate(0.5, 0, - 0.5);
            this.scene.scale(this.squaresScale, 1, this.squaresScale);
            this.squareTile.process(new CGFappearance(this.scene), null, 1, 1);
            this.scene.popMatrix();
        }

        if (line == this.lines - 1) {
            if (column > 0) {
                this.scene.pushMatrix();
                this.scene.translate(- 0.5, 0, 0.5);
                this.scene.scale(this.squaresScale, 1, this.squaresScale);
                this.squareTile.process(new CGFappearance(this.scene), null, 1, 1);
                this.scene.popMatrix();
            }

            if (column < this.columns - 1) {
                this.scene.pushMatrix();
                this.scene.translate(0.5, 0, 0.5);
                this.scene.scale(this.squaresScale, 1, this.squaresScale);
                this.squareTile.process(new CGFappearance(this.scene), null, 1, 1);
                this.scene.popMatrix();
            }
        }
    }
}