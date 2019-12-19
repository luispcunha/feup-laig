/**
 * MyOctagonalTile class
 */
class MyOctagonalTile extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene) {
        super(scene);
        this.octagon = new MyRegPolygon(scene, 8, 0.5);
    }

    /**
     * Display security camera.
     */
    display() {
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI / 8, 0, 1, 0);
        this.octagon.display();
        this.scene.popMatrix();
    }
}
