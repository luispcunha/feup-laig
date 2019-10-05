class MyComponent {
    constructor(id) {
        this.id = id;
        this.loaded = false;
        
        this.componentChildren = [];
        this.primitiveChildren = [];
        
        this.transformation;
        
        this.inheritMaterial = false;
        this.materials = [];
        this.selectedMaterial;


        this.texture;
        this.texLengthS;
        this.texLengthT;
        this.texBehaviour = 'own';
    }
}