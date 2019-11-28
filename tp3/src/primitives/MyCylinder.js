/**
 * This class provides a primitive in the shape of a cylinder, with no
 * caps, variable height, bottom and top radius.
 */
class MyCylinder extends CGFobject {
    /**
     * Will yield a new Cylinder with the rotating axis on
     * _scene_'s z axis.
     * @constructor
     * @param {CGFscene} scene
     * @param {Number} stacks the number of subdivisions along the
     * cylinder's height.
     * @param {Number} slices the number of angular subdivisions of the
     * curves' discretisation
     * @param {Number} bottomRadius
     * @param {Number} topRadius
     * @param {Number} height
     */
    constructor(scene, stacks, slices,
            bottomRadius, topRadius, height) {
        super(scene);
        this.stacks = stacks;
        this.slices = slices;
        this.bottomRadius = bottomRadius;
        this.topRadius = topRadius;
        this.height = height;
        this.calcAngleDelta();
        this.calcHeightDelta();
        this.calcSlope();
        this.initBuffers();
    }

    /**
     * Provides scale  factors for applying a texture onto the cylinder.
     * Currently unimplemented.
     * @param {Number} length_s
     * @param {Number} length_t
     */
    scaleTexCoords(length_s, length_t) {
        return;
    }

    calcAngleDelta() {
        /* A slice will be generated at an interval of angleDelta */
        this.angleDelta = 2 * Math.PI / this.slices;
    }

    calcHeightDelta() {
        /* The height of each stack will be heightDelta */
        this.heightDelta = this.height / this.stacks;
    }

    calcSlope() {
        this.slope = (this.topRadius - this.bottomRadius) / this.height;
    }

    initBuffers() {
        this.generateVertices();
        this.generateNormals();
        this.generateIndices();
        this.generateTexCoords();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    generateVertices() {
        this.vertices = [];
        /* A <= is used in the exit condition to have an overlap in
        the last slice, which is used to provide a complete mapping of
        textures onto the cylinders surface*/
        for (let slice = 0; slice <= this.slices; slice++)
            this.appendSlice(slice);
    }

    generateNormals() {
        this.normals = [];
        const tan = - 1 / this.slope; /* is the tangent of the angle between the normal and a horizontal plane */
        const sin = Math.sqrt(1 / (1 + 1/(tan * tan)));
        const cos = sin / tan;
        for (let slice = 0; slice <= this.slices; slice++) {
            const angle = this.angleDelta * slice;
            const x = Math.cos(angle) * sin;
            const y = Math.sin(angle) * sin;
            const z = cos;
            for (let stack = 0; stack <= this.stacks; stack++)
                this.normals.push(x, y, z);
        }
    }

    generateIndices() {
        this.indices = [];
        for (let slice = 0; slice < this.slices ; slice++)
            this.connectSlices(slice, slice + 1);
    }

    appendSlice(slice) {
        const angle = slice * this.angleDelta;
        for (let stack = 0; stack <= this.stacks; stack++) {
            const height = this.heightDelta * stack;
            const radius = this.bottomRadius + height*this.slope;
            this.vertices.push(...Point.fromCylindrical(angle, radius, height).toCoordArray());
        }
    }

    connectSlices(slice1, slice2) {
        const slice1Offset = (this.stacks + 1) * slice1;
        const slice2Offset = (this.stacks + 1) * slice2;
        for (let stack = 0; stack < this.stacks; stack++) {
            const bottomLeft = slice1Offset + stack;
            const bottomRight = slice2Offset + stack;
            const topLeft = bottomLeft + 1;
            const topRight = bottomRight + 1;
            this.indices.push(
                bottomLeft, bottomRight, topRight,
                topRight, topLeft, bottomLeft
            );
        }
    }

    generateTexCoords() {
        const deltaV = 1 / this.stacks;
        const deltaU = 1 / this.slices;
        let currentU = 0;
        let currentV = 1;

        this.texCoords = [];
        for (let slice = 0; slice <= this.slices; slice++) {
            for (let stack = 0; stack <= this.stacks; stack++) {
                this.texCoords.push(currentU, currentV);
                currentV -= deltaV;
            }
            currentV = 1;
            currentU += deltaU;
        }
    }
}
