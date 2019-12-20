/**
 * MyComponent
 * @constructor
 * @param scene - Reference to MyScene object
 * @param id - component ID
 */
class MyComponent {
    constructor(scene, id) {
        this.id = id;
        this.scene = scene;

        /* property used to prevent that components
        created only because they are referenced as other
        component's children really exist and are loaded
        afterwards */
        this.loaded = false;

        // children nodes of the component
        this.componentChildren;
        // children leaf nodes of the component
        this.primitiveChildren;

        // transformation matrix for this component
        this.transformation;

        // array of materials of the component
        this.materials = [];
        // index of the current select material
        this.selectedMaterial;

        // component texture and scale factor of tex coords
        this.texture;
        this.texLengthS;
        this.texLengthT;
    }

    /**
     * Set selected material to the next in the array
     */
    cycleMaterials() {
        if (this.materials.length) {
        this.selectedMaterial++;
            if (this.selectedMaterial === this.materials.length)
                this.selectedMaterial = 0;
        }
    }

    /**
     * Process node, draw leaf nodes and recursively process other children nodes
     * @param mat   Material of the parent node
     * @param tex   Texture of the parent node
     * @param ls    S tex coord scale factor of parent node
     * @param lt    T tex coord scale factor of parent node
     */
    process(mat, tex, ls, lt) {
        /* push current transformation matrix so that other components
        that aren't children of this component  are not affected by this component's
        transformation */
        this.scene.pushMatrix();

        // multiply parent transformation matrix with this node's transformation matrix
        this.scene.multMatrix(this.transformation);

        if (this.animation)
            this.animation.apply();

        let material, texture, lengthS, lengthT;

        // if current selectedMaterial is the one representing "inherit" behaviour, use parent's material, else
        // use currently selected material
        if (this.materials[this.selectedMaterial] == "inherit") {
            material = mat;
        } else {
            material = this.materials[this.selectedMaterial];
        }

        // if this node's texture is the one representing "inherit" behaviour,
        // use parent's texture and tex coords scale factors, else
        // if it's the one representing "none" behaviour, set texture to null,
        // else, use own texture and tex coords scale factors
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

        // set texture and apply material
        material.setTexture(texture);
        material.setTextureWrap('REPEAT', 'REPEAT');
        material.apply();

        // update tex coords and display leaf node children of this node
        for (let primitive of this.primitiveChildren) {
            primitive.scaleTexCoords(lengthS, lengthT);
            primitive.display();
        }

        // process children node
        for (let component of this.componentChildren) {
            component.process(material, texture, lengthS, lengthT);
        }

        // reestablish scene transformation matrix with previously pushed matrix
        this.scene.popMatrix();
    }

    display() {
        this.process(new CGFappearance(this.scene), null, 1, 1);
    }
}
