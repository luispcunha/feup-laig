/**
 * TODO: documentation
 */
class MySphere extends CGFobject {
    constructor(scene, stacks, slices, radius) {
        super(scene);
        this.stacks = stacks;
        this.slices = slices;
        this.radius = radius;
        this.calcAngleDeltas();
        this.initBuffers();
    }

    calcAngleDeltas() {
        this.stackAngleDelta = Math.PI / (2 * this.stacks);
        this.sliceAngleDelta = 2 * Math.PI / this.slices;
    }

    initBuffers() {
        /* Generating normals before because vertices can be obtained as a transformation of their normals */
        this.generateNormals();
        this.generateVertices();
        this.generateIndices();
        
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    generateNormals() {
        /* Initialise normals list with the poles only */
        this.normals = [
            0, 0, 1,
            0, 0, -1
            ];
        for (let slice = 0; slice < this.slices; slice += 1)
            this.appendSlice(slice);
    }

    generateIndices() {
        this.indices = [];
        /* connect the last set of faces separately to avoid modulus operations */
        for (let slice = 0; slice < this.slices - 1; slice += 1)
            this.connectSlices(slice, slice + 1);
        this.connectSlices(this.slices - 1, 0);
    }

    generateVertices() {
        /* In a sphere , the normal on a vertex is the coords of the vertex normalized to length 1,
            so a vertex can be obtained by multiplying each normal by the sphere's radius */
        this.vertices = this.normals.map(coord => coord * this.radius);
    }

    appendSlice(slice) {
        const sliceAngle = slice * this.sliceAngleDelta;
        for (let stack = - this.stacks + 1; stack < this.stacks; stack += 1) {
            const stackAngle = stack * this.stackAngleDelta;
            const normal = MySphere.polarToRectangular(sliceAngle, stackAngle);
            this.normals.push(...normal);
        }
    }

    static polarToRectangular(sliceAngle, stackAngle) {
        return [
            Math.cos(sliceAngle) * Math.cos(stackAngle), //x
            Math.sin(sliceAngle) * Math.cos(stackAngle), //y
            Math.sin(stackAngle)                         //z
        ];
    }

    connectSlices(slice1, slice2) {
        const verticesPerSlice = 2 * this.stacks - 1;
        const slice1Offset = 2 + slice1 * verticesPerSlice;
        const slice2Offset = 2 + slice2 * verticesPerSlice;
        /* Connect bottom vertices to pole */
        this.indices.push(
            1, slice2Offset, slice1Offset
        );
        /* Connect vertices among themselves */
        for (let vertex = 0; vertex < verticesPerSlice - 1; vertex += 1) {
            const bottomLeft = slice1Offset + vertex;
            const bottomRight = slice2Offset + vertex;
            const topLeft = slice1Offset + vertex + 1;
            const topRight = slice2Offset + vertex + 1;
            this.indices.push(
                bottomLeft, bottomRight, topRight,
                topRight, topLeft, bottomLeft
            );
        }
        /* Connect top vertices to pole */
        this.indices.push(
            slice1Offset + verticesPerSlice - 1,
            slice2Offset + verticesPerSlice - 1,
            0
        );
    }
    
}