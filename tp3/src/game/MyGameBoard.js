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

        this.squarePieceComponents = [];
        this.octagonPieceComponents = [];
    }

    initOctagonTiles() {
        this.octagonTiles = [];

        let id = 1;
        for (let row = 0; row < this.nRows; row++) {
            let rowElems = [];
            for (let column = 0; column < this.nColumns; column++) {
                rowElems.push(new MyOctagonTile(this.scene, id, row, column));
                id++;
            }
            this.octagonTiles.push(rowElems);
        }
    }

    initSquareTiles() {
        const scale = Math.tan(Math.PI / 8);

        this.squareTiles = [];

        for (let row = 0; row <= this.nRows; row++) {
            const rowElems = [];
            for (let column = 0; column <= this.nColumns; column++) {
                rowElems.push(new MySquareTile(this.scene, row, column, scale));
            }
            this.squareTiles.push(rowElems);
        }

        this.squareTiles[0][0].display = () => {};
        this.squareTiles[0][this.nColumns].display = () => {};
        this.squareTiles[this.nRows][0].display = () => {};
        this.squareTiles[this.nRows][this.nColumns].display = () => {};
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

    setSquarePieceComponent(component, player) {
        this.squarePieceComponents[player] = component;

        this.squareTiles.forEach(row => {
            row.forEach(tile => {
                tile.setPieceComponent(component, player);
            });
        });
    }

    setOctagonPieceComponent(component, player) {
        this.octagonPieceComponents[player] = component;

        this.octagonTiles.forEach(row => {
            row.forEach(tile => {
                tile.setPieceComponent(component, player);
            });
        });
    }

    addPiece(column, row, player) {
        this.octagonTiles[column][row].addPiece(this.octagonPieceComponents, player);
    }

    fillBoards(boards) {
        for (let row = 0; row < this.squareTiles.length; row++) {
            for (let column = 0; column < this.squareTiles[row].length; column++) {

                const tile = this.squareTiles[row][column];
                const elem = boards.squares[row][column];

                if (tile) {
                    switch (elem) {
                        case 0:
                            this.squareTiles[row][column].removePiece();
                            break;
                        default:
                            this.squareTiles[row][column].addPiece(this.squarePieceComponents, elem);
                            break;
                    }
                }
            }
        }

        for (let i = 0; i < boards.octagons.length; i++) {
            for (let j = 0; j < boards.octagons[i].length; j++) {
                const elem = boards.octagons[i][j];
                switch (elem) {
                    case 0:
                        this.octagonTiles[i][j].removePiece();
                        break;
                    default:
                        this.octagonTiles[i][j].addPiece(this.octagonPieceComponents, elem);
                        break;
                }
            }
        }
    }
}