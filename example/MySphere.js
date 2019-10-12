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
        const stackAngleDelta = Math.PI / (2 * this.stacks);
        const sliceAngleDelta = 2 * Math.PI / this.slices;

        this.normals = [];
        this.vertices = [];
        this.texCoords = [];

        for (let slice = 0; slice <= this.slices; slice += 1) {

            const sliceAngle = slice * sliceAngleDelta;

            for (let stack = - this.stacks; stack <= this.stacks; stack += 1) {
                const stackAngle = stack * stackAngleDelta;
                const normal = MySphere.polarToRectangular(sliceAngle, stackAngle);
               
                this.normals.push(...normal);
                this.vertices.push(...(normal.map(coord => coord * this.radius)));
                this.texCoords.push(
                    slice / this.slices, 
                    (stack + this.stacks) / (this.stacks * 2)
                );
            }
        }

        this.generateIndices();
       
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    generateIndices() {
        this.indices = [];
      
        for (let slice = 0; slice < this.slices; slice += 1)
            this.connectSlices(slice, slice + 1);
    }

    connectSlices(slice1, slice2) {
        const verticesPerSlice = 2 * this.stacks + 1;
        const slice1Offset = slice1 * verticesPerSlice;
        const slice2Offset = slice2 * verticesPerSlice;

        for (let vertex = 0; vertex < verticesPerSlice; vertex += 1) {
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

    static polarToRectangular(sliceAngle, stackAngle) {
        return [
            Math.cos(sliceAngle) * Math.cos(stackAngle), //x
            Math.sin(sliceAngle) * Math.cos(stackAngle), //y
            Math.sin(stackAngle)                         //z
        ];
    }
}