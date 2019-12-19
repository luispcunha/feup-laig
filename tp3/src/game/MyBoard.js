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

        this.width = 8;
        this.height = 8;

        this.lines = 8;
        this.columns = 8;
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
    }

    displaySquareTiles(column, line) {
        const octagonSide = Math.tan(Math.PI / 8);
        const squareApothem = octagonSide;

        if (! (column == 0 && line == 0)) {
            this.scene.pushMatrix();
            this.scene.translate(- 0.5, 0, - 0.5);
            this.scene.scale(squareApothem, 1, squareApothem);
            this.squareTile.process(new CGFappearance(this.scene), null, 1, 1);
            this.scene.popMatrix();
        }

        if (! (column == this.columns - 1 && line == 0)) {
            this.scene.pushMatrix();
            this.scene.translate(0.5, 0, - 0.5);
            this.scene.scale(squareApothem, 1, squareApothem);
            this.squareTile.process(new CGFappearance(this.scene), null, 1, 1);
            this.scene.popMatrix();
        }

        if (line == this.lines - 1) {
            if (column > 0) {
                this.scene.pushMatrix();
                this.scene.translate(- 0.5, 0, 0.5);
                this.scene.scale(squareApothem, 0, squareApothem);
                this.squareTile.process(new CGFappearance(this.scene), null, 1, 1);
                this.scene.popMatrix();
            }

            if (column < this.columns - 1) {
                this.scene.pushMatrix();
                this.scene.translate(0.5, 0, 0.5);
                this.scene.scale(squareApothem, 0, squareApothem);
                this.squareTile.process(new CGFappearance(this.scene), null, 1, 1);
                this.scene.popMatrix();
            }
        }
    }
}