/**
 * MyBoard class
 */
class MyGameBoard {
    /**
     * @constructor
     */
    constructor(orchestrator, nColumns, nRows) {
        this.orchestrator = orchestrator;

        this.nRows = nRows;
        this.nColumns = nColumns;

        this.initOctagonTiles();
        this.initSquareTiles();

        this.animatedPieces = [];
    }

    setSize(nColumns, nRows) {
        this.nColumns = nColumns;
        this.nRows = nRows;

        this.initOctagonTiles();
        this.initSquareTiles();
    }

    initOctagonTiles() {
        this.octagonTiles = [];

        let id = 1;
        for (let row = 0; row < this.nRows; row++) {
            let rowElems = [];
            for (let column = 0; column < this.nColumns; column++) {
                rowElems.push(new MyOctagonTile(this.orchestrator, id, row, column));
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
                rowElems.push(new MySquareTile(this.orchestrator, row, column, scale));
            }
            this.squareTiles.push(rowElems);
        }

        this.squareTiles[0][0].display = () => { };
        this.squareTiles[0][this.nColumns].display = () => { };
        this.squareTiles[this.nRows][0].display = () => { };
        this.squareTiles[this.nRows][this.nColumns].display = () => { };
    }

    getOctagonTile(row, column) {
        return this.octagonTiles[row][column];
    }

    getOctagonPiece(row, column) {
        return this.octagonTiles[row][column].piece;
    }

    /**
     * Display board.
     */
    display(width, height) {
        const scene = this.orchestrator.getScene();

        const widthScale = width / this.nColumns;
        const heightScale = height / this.nRows;

        scene.pushMatrix();

        // center and scale board
        scene.translate(- width / 2, 0, - height / 2);
        scene.scale(widthScale, 1, heightScale);
        scene.translate(0.5, 0, 0.5);

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

        this.animatedPieces.forEach(piece => {
            piece.display();
        });

        this.animatedPieces = this.animatedPieces.filter(piece => {
            return !piece.isAnimOver();
        });

        scene.popMatrix();
    }

    addPiece(column, row, player) {
        this.octagonTiles[column][row].addPiece(this.createOctagonPiece(player));
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
                            this.squareTiles[row][column].addPiece(this.createSquarePiece(elem));
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
                        this.octagonTiles[i][j].addPiece(this.createOctagonPiece(elem));
                        break;
                }
            }
        }
    }

    createAnimatedOctagonPiece(player) {
        return new MyAnimatedOctagonPiece(this.orchestrator, player);
    }

    createOctagonPiece(player) {
        return new MyOctagonPiece(this.orchestrator, player);
    }

    createSquarePiece(player) {
        return new MySquarePiece(this.orchestrator, player);
    }

    addAnimatedPiece(piece) {
        this.animatedPieces.push(piece);
    }
}