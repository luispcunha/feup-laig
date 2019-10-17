class MyComponent {
    constructor(scene, id) {
        this.id = id;
        this.loaded = false;
        this.scene = scene;

        this.componentChildren;
        this.primitiveChildren;
        
        this.transformation;
        
        this.inheritMaterial = false;
        this.materials = [];
        this.selectedMaterial;

        this.texture;
        this.texLengthS;
        this.texLengthT;
        this.texBehaviour = 'own';
    }

    cycleMaterials() {
        this.selectedMaterial++;
        if (this.selectedMaterial === this.materials.length)
            this.selectedMaterial = 0;
    }


    process(mat, tex, ls, lt) {
        this.scene.pushMatrix();
        this.scene.multMatrix(this.transformation);

        let material, texture, lengthS, lengthT;

        if (! this.inheritMaterial) {
            material = this.materials[this.selectedMaterial];
            lengthS = this.texLengthS;
            lengthT = this.texLengthT;
        } else {
            material = mat;
            lengthS = ls;
            lengthT = lt;
        }

        switch (this.texBehaviour) {
            case 'own':
                texture = this.texture;
                lengthS = this.texLengthS;
                lengthT = this.texLengthT;
                break;
            case 'inherit':
                texture = tex;
                lengthS = ls;
                lengthT = lt;
                break;
            case 'none':
                texture = null;
                break;
            default:
                break;
        }

        if (material) {
            material.setTexture(texture);
            material.setTextureWrap('REPEAT', 'REPEAT');
            material.apply();
        }
        
        for (let primitive of this.primitiveChildren) {
            primitive.scaleTexCoords(lengthS, lengthT);
            primitive.display();
        }

        for (let component of this.componentChildren) {
            component.process(material, texture, lengthS, lengthT);
        }

        this.scene.popMatrix();
    }
}