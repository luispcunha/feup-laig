/**
 * TODO: documentation
 */
class MySphere extends CGFobject {
    constructor(scene, stacks, slices, radius) {
        super(scene);
        this.stacks = stacks;
        this.slices = slices;
        this.radius = radius;
        this.initBuffers();
    }

    initBuffers() {
        this.generateNormals();
        this.generateVertices();
        this.generateIndices();
        this.generateTexCoords();
       
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    generateNormals() {
        this.stackAngleDelta = Math.PI / (2 * this.stacks);
        this.sliceAngleDelta = 2 * Math.PI / this.slices;
        this.normals = [];
        for (let slice = 0; slice <= this.slices; slice += 1) {
            this.addSliceNormals(slice);
        }
    }

    generateVertices() {
        this.vertices = this.normals.map(coord => coord * this.radius);
    }

    generateIndices() {
        this.indices = [];
        for (let slice = 0; slice < this.slices; slice += 1)
            this.connectSlices(slice, slice + 1);
    }

    generateTexCoords() {
        this.texCoords = [];
        this.horizTexCoordDelta = 1 / this.slices;
        this.vertTexCoordDelta = 1 / (2 * this.stacks);
        for (let slice = 0; slice <= this.slices; slice++) {
            this.addSliceTexCoords(slice);
        }
    }

    addSliceNormals(slice) {
        const sliceAngle = slice * this.sliceAngleDelta;
        for (let stack = - this.stacks; stack <= this.stacks; stack++) {
            const stackAngle = stack * this.stackAngleDelta;
            const normal = Point.fromSpherical(sliceAngle, stackAngle, 1).toCoordArray();
            this.normals.push(...normal);
        }
    }

    addSliceTexCoords(slice) {
        const horizTexCoord = slice * this.horizTexCoordDelta;
        for (let vertex = 0; vertex <= 2 * this.stacks; vertex++) {
            const vertTexCoord = vertex * this.vertTexCoordDelta;
            this.texCoords.push(horizTexCoord, vertTexCoord);
        }
    }

    connectSlices(slice1, slice2) {
        const verticesPerSlice = 2 * this.stacks + 1;
        const slice1Offset = slice1 * verticesPerSlice;
        const slice2Offset = slice2 * verticesPerSlice;

        for (let vertex = 0; vertex <= verticesPerSlice; vertex++) {
            const bottomLeft = slice1Offset + vertex;
            const bottomRight = slice2Offset + vertex;
            const topLeft = slice1Offset + vertex + 1;
            const topRight = slice2Offset + vertex + 1;
            this.indices.push(
                bottomLeft, bottomRight, topRight,
                topRight, topLeft, bottomLeft
            );
        }
    }
}