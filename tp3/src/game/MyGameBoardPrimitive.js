class MyGameBoardPrimitive {
    constructor(board, width, height) {
        this.board = board;
        this.width = width;
        this.height = height;
    }

    scaleTexCoords(ls, lt) { }

    display() {
        this.board.display(this.width, this.height);
    }
}