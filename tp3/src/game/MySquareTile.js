/**
 * MySquareTile class
 */
class MySquareTile extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene) {
        super(scene);

        const octagonSide = Math.tan(Math.PI / 8);
        const squareApothem = octagonSide / 2;

        this.square = new MyRegPolygon(scene, 4, squareApothem);
    }

    /**
     * Display security camera.
     */
    display() {
        this.square.display();
    }
}
