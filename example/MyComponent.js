class MyComponent {
    constructor(scene, id) {
        this.id = id;
        this.loaded = false;
        this.scene = scene;

        this.children;
        
        this.transformation;
        
        this.inheritMaterial = false;
        this.materials = [];
        this.selectedMaterial;


        this.texture;
        this.texLengthS;
        this.texLengthT;
        this.texBehaviour = 'own';
    }

    display() {
        let childTransfMatrix = mat4.create();
        mat4.multiply(childTransfMatrix, this.scene.getMatrix(), this.transformation);
        this.scene.setMatrix(childTransfMatrix);

        for (let child of this.children) {
            this.scene.pushMatrix();
            child.display();
            this.scene.popMatrix();
        }
    }
}