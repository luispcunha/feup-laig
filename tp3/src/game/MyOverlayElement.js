class MyOverlayElement extends CGFobject {
    constructor(scene, x1, x2, y1, y2) {
        super(scene);
        this.element = new MyRectangle(this.scene, x1, x2, y1, y2);
        this.element.scaleTexCoords(x2 - x1, y2 - y1);

        this.shader = new CGFshader(this.scene.gl, "shaders/overlay.vert", "shaders/overlay.frag");
    }

    setTexture(texture) {
        this.texture = texture;
    }

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