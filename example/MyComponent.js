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



    }
}