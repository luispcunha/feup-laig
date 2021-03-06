/**
 * MyOverlayElement class, that allows the creation of rectangles that appear layered over the scene
 */
class MyOverlayElement extends CGFobject {
    /**
     * Create class instance, in a given position
     */
    constructor(scene, x1, x2, y1, y2) {
        super(scene);
        this.element = new MyRectangle(this.scene, x1, x2, y1, y2);
        this.element.scaleTexCoords(x2 - x1, y2 - y1);

        this.shader = new CGFshader(this.scene.gl, "shaders/overlay.vert", "shaders/overlay.frag");
    }

    /**
     * Sets texture to be displayed in the overlay element
     */
    setTexture(texture) {
        this.texture = texture;
    }

    /**
     * Displays elemnt
     */
    display() {
        this.scene.setActiveShader(this.shader);
        this.scene.gl.disable(this.scene.gl.DEPTH_TEST);
        if (this.texture)
            this.texture.bind(0);
        this.element.display();
        this.scene.gl.enable(this.scene.gl.DEPTH_TEST);
        this.scene.setActiveShader(this.scene.defaultShader);
    }
}