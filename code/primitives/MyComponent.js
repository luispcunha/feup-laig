class MyComponent {
    constructor(scene, id) {
        this.id = id;
        this.loaded = false;
        this.scene = scene;

        this.componentChildren;
        this.primitiveChildren;

        this.transformation;

        this.materials = [];
        this.selectedMaterial;

        this.texture;
        this.texLengthS;
        this.texLengthT;
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

        if (this.materials[this.selectedMaterial] == "inherit") {
            material = mat;
        } else {
            material = this.materials[this.selectedMaterial];
        }

        if (this.texture == "inherit") {
            texture = tex;
            lengthS = ls;
            lengthT = lt;
        } else if (this.texture == "none") {
            texture = null;
        } else {
            texture = this.texture;
            lengthS = this.texLengthS;
            lengthT = this.texLengthT;
        }

        material.setTexture(texture);
        material.setTextureWrap('REPEAT', 'REPEAT');
        material.apply();
        
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
