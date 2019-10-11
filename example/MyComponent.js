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
        this.scene.multMatrix(this.transformation);

        let mat, tex;

        if (this.inheritMaterial) {
            mat = this.scene.popMaterial();
            this.scene.pushMaterial(mat);
        } else {
            mat = this.selectedMaterial;
        }

        switch (this.texBehaviour) {
            case 'own':
                tex = this.texture;
                break;
            case 'none':
                tex = null;
                break;
            case 'inherit':
                tex = this.scene.popTexture();
                this.scene.pushTexture(tex);
                break;
            default:
                break;
        }

        for (let child of this.children) {
            if (mat != null) {
                mat.setTexture(tex);
                mat.apply();
            }

            this.scene.pushTexture(tex);
            this.scene.pushMaterial(mat);
            this.scene.pushMatrix();
            child.display();
            this.scene.popMatrix();
            mat = this.scene.popMaterial();
            tex = this.scene.popTexture();
        }
    }
}