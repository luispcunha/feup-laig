class MySecurityCamera extends CGFobject {
    constructor(scene, height, width, texture) {
        super(scene);
        this.texture = texture;
        this.rectangle = new MyRectangle(scene, 0.5, 1, -1, -0.5);
        this.rectangle.texCoords = [
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];
        this.rectangle.updateTexCoordsGLBuffers();
        this.initBuffers = () => this.initGLBuffers();
    }
    display() {
        this.texture.bind();
        this.rectangle.display();
        this.texture.unbind();
    }
}
