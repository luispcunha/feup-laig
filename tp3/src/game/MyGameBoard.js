/**
 * MyGameBoard class, used for the graphical representation of a board and what it contains. Displays tiles, which in order display the pieces contained.
 */
class MyGameBoard {
    /**
     * @constructor creates an instance of the class, given a number of columns and rows
     */
    constructor(orchestrator, nColumns, nRows) {
        this.orchestrator = orchestrator;

        this.nRows = nRows;
        this.nColumns = nColumns;

        this.initOctagonTiles();
        this.initSquareTiles();

        // array of pieces that are being currently animated
        this.animatedPieces = [];
    }

    /**
     * Resizes board (number of columns and rows)
     * @param {*} nColumns new number of columns
     * @param {*} nRows new number of rows
     */
    setSize(nColumns, nRows) {
        this.nColumns = nColumns;
        this.nRows = nRows;

        this.initOctagonTiles();
        this.initSquareTiles();
    }

    /**
     * Inits array of empty octagon tiles
     */
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

    /**
     * Inits array of empty square tiles
     */
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

    /**
     * Gets octagon tile in a position
     */
    getOctagonTile(row, column) {
        return this.octagonTiles[row][column];
    }

    /**
     * Gets octagon piece in a position (null if no piece is in that position)
     */
    getOctagonPiece(row, column) {
        return this.octagonTiles[row][column].piece;
    }

    /**
     * Display the board, scaling it to fit a desired width and height
     */
    display(width, height) {
        const scene = this.orchestrator.getScene();

        // compute scale values along x and z directions, in order for the tiles to fit in the given width and height
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

        // display animated pieces
        this.animatedPieces.forEach(piece => {
            piece.display();
        });

        // remove animated pieces whose animation has ended
        this.animatedPieces = this.animatedPieces.filter(piece => {
            return !piece.isAnimOver();
        });


        // displays containers of pieces (place from where new pieces magically appear from)
        const xDif = this.nColumns / 4;

        scene.pushMatrix();
        scene.translate(- xDif - 1, 0, 4 * this.nRows / 5 - 0.5);
        scene.graph.templates['pieceContainer'].display();
        scene.graph.templates['octagonPiece'][1].display();
        scene.popMatrix();


        scene.pushMatrix();
        scene.translate(this.nColumns + xDif, 0, this.nRows / 5 - 0.5);
        scene.graph.templates['pieceContainer'].display();
        scene.graph.templates['octagonPiece'][2].display();
        scene.popMatrix();

        scene.popMatrix();
    }

    // adds a piece to a desired position
    addPiece(column, row, player) {
        this.octagonTiles[column][row].addPiece(this.createOctagonPiece(player));
    }

    /**
     * Given two matrices representing the content of the board, updates the contents of the board
     * @param {*} boards two matrices representing the contents of the boards
     */
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

    /**
     * Creates an animated octagon piece belonging to a given player
     */
    createAnimatedOctagonPiece(player) {
        return new MyAnimatedOctagonPiece(this.orchestrator, player);
    }

    /**
     * Creates an octagon piece belonging to a given player
     */
    createOctagonPiece(player) {
        return new MyOctagonPiece(this.orchestrator, player);
    }

    /**
     * Creates a square piece belonging to a given player
     */
    createSquarePiece(player) {
        return new MySquarePiece(this.orchestrator, player);
    }

    /**
     * Adds an animated piece to the board
     */
    addAnimatedPiece(piece) {
        this.animatedPieces.push(piece);
    }

    /**
     * Removes all animated pieces from the board
     */
    removeAnimatedPieces() {
        this.animatedPieces = [];
    }
}