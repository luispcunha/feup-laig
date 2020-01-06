/**
 * Primitive used to place the board in the scene graph. Has a width and height, used to display the board with the right dimensions
 */
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