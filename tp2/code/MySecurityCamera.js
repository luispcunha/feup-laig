/**
 * MySecuryityCamera class
 */
class MySecurityCamera extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     * @param {CGFtextureRTT} texture
     */
    constructor(scene, texture) {
        super(scene);
        this.texture = texture;


        this.rectangle = new MyRectangle(scene, 0.5, 1, -1, -0.5);
        this.rectangle.scaleTexCoords(0.5, 0.5); // scale tex coords to fit the full texture
    }

    /**
     * Display security camera.
     */
    display() {
        this.texture.bind();
        this.rectangle.display();
        this.texture.unbind();
    }
}
