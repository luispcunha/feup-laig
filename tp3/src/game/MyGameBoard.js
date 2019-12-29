/**
 * MyBoard class
 */
class MyGameBoard extends CGFobject {
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

        this.widthScale = width / this.nRows;
        this.heightScale = height / this.nColumns;

        this.initOctagonTiles();
        this.initSquareTiles();
    }

    initOctagonTiles() {
        this.octagonTiles = [];

        let id = 1;
        for (let i = 0; i < this.nRows; i++) {
            let row = [];
            for (let j = 0; j < this.nColumns; j++) {
                row.push(new MyOctagonTile(this.scene, id, i, j));
                id++;
            }
            this.octagonTiles.push(row);
        }
    }

    initSquareTiles() {
        const scale = Math.tan(Math.PI / 8);

        this.squareTiles = [];

        let row = [];
        for (let j = 1; j < this.nColumns; j++) {
            row.push(new MySquareTile(this.scene, 0, j, scale));
        }
        this.squareTiles.push(row);

        for (let i = 1; i < this.nRows; i++) {
            row = [];
            for (let j = 0; j <= this.nColumns; j++) {
                row.push(new MySquareTile(this.scene, i, j, scale));
            }
            this.squareTiles.push(row);
        }

        row = [];
        for (let j = 1; j < this.nColumns; j++) {
            row.push(new MySquareTile(this.scene, this.nRows, j, scale));
        }
        this.squareTiles.push(row);
    }

    /**
     * Display board.
     */
    display() {
        this.scene.pushMatrix();

        // center and scale board
        this.scene.translate(- this.width / 2, 0, - this.height / 2);
        this.scene.scale(this.widthScale, 1, this.heightScale);
        this.scene.translate(0.5, 0, 0.5);

        // display octagon tiles
        this.octagonTiles.forEach(row => {
            row.forEach(tile => {
                tile.display();
            });
        });

        // display square tiles
        this.squareTiles.forEach(row => {
            row.forEach(tile => {
                tile.display();
            });
        });

        this.scene.popMatrix();
    }

    scaleTexCoords(ls, lt) {}

    setOctagonTileComponent(component) {
        this.octagonTiles.forEach(row => {
            row.forEach(tile => {
                tile.setComponent(component);
            });
        });
    }

    setSquareTileComponent(component) {
        this.squareTiles.forEach(row => {
            row.forEach(tile => {
                tile.setComponent(component);
            });
        });
    }
}