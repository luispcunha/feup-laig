class MyGameBoardPrimitive {
    constructor(scene, board, width, height) {
        this.scene = scene;
        this.board = board;
        this.width = width;
        this.height = height;
    }

    scaleTexCoords(ls, lt) { }

    display() {
        this.board.display(this.width, this.height);
    }
}