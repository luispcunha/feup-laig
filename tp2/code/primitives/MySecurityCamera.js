class MySecurityCamera extends CGFobject {
    constructor(scene, height, width, texture) {
        super(scene);
        this.texture = texture;
        this.rectangle = new MyRectangle(scene, 0.5, 1, -1, -0.5);
        this.rectangle.scaleTexCoords(0.5, 0.5);
    }
    display() {
        this.texture.bind();
        this.rectangle.display();
        this.texture.unbind();
    }
}
