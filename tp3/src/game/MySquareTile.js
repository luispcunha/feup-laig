/**
 * MyTile class
 */
class MySquareTile extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     */
    constructor(scene, column, row, scale) {
        super(scene);
        this.column = column;
        this.row = row;
        this.scale = scale;
    }

    setComponent(component) {
        this.component = component;
    }

    /**
     * Display board.
     */
    display() {
        this.scene.pushMatrix();
        this.scene.translate(this.column - 0.5, 0, this.row - 0.5);
        this.scene.scale(this.scale, 1, this.scale);
        this.component.display();
        this.scene.popMatrix();
    }
}