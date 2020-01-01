/**
 * MyBoard class
 */
class MyGameBoard {
    /**
     * @constructor
     */
    constructor(orchestrator, width, height) {
        this.orchestrator = orchestrator;

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

        this.animatedPieces = [];
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

        this.squareTiles[0][0].display = () => {};
        this.squareTiles[0][this.nColumns].display = () => {};
        this.squareTiles[this.nRows][0].display = () => {};
        this.squareTiles[this.nRows][this.nColumns].display = () => {};
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
    display() {
        const scene = this.orchestrator.getScene();

        scene.pushMatrix();

        // center and scale board
        scene.translate(- this.width / 2, 0, - this.height / 2);
        scene.scale(this.widthScale, 1, this.heightScale);
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
            return ! piece.isAnimOver();
        });

        scene.popMatrix();
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
        return new MyAnimatedOctagonPiece(this.orchestrator, player, this.octagonPieceComponents[1], this.octagonPieceComponents[2]);
    }

    createOctagonPiece(player) {
        return new MyOctagonPiece(this.orchestrator, player, this.octagonPieceComponents[1], this.octagonPieceComponents[2]);
    }

    createSquarePiece(player) {
        return new MySquarePiece(this.orchestrator, player, this.squarePieceComponents[1], this.squarePieceComponents[2]);
    }

    addAnimatedPiece(piece) {
        this.animatedPieces.push(piece);
    }
}