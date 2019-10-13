class MyTorus extends CGFobject {
    constructor(scene, inner, outer, slices, loops) {
        super(scene);
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;
        this.initializeBuffers();
    }

    initializeBuffers() {
        this.vertices = [];
        this.normals = [];
        this.indices = [];
        this.texCoords = [];

        const outerAngleDelta = 2 * Math.PI / this.loops;
        const innerAngleDelta = 2 * Math.PI / this.slices;

        for (let loop = 0; loop <= this.loops; loop++) {
            const outerAngle = loop * outerAngleDelta;
            const outerCos = Math.cos(outerAngle);
            const outerSin = Math.sin(outerAngle);
            for (let slice = 0; slice <= this.slices; slice++) {
                const innerAngle = slice * innerAngleDelta;
                const innerCos = Math.cos(innerAngle);
                const innerSin = Math.sin(innerAngle);
                this.normals.push(
                    outerCos * innerCos,
                    outerSin * innerCos,
                    innerSin
                );
                this.vertices.push(
                    outerCos * (this.outer + innerCos * this.inner),
                    outerSin * (this.outer + innerCos * this.inner),
                    innerSin * this.inner
                );
                this.texCoords.push(
                    loop / this.loops,
                    1 - slice / this.slices
                );

                if (loop < this.loops && slice < this.slices)
                    this.connectSquare(loop, loop + 1, slice, slice + 1)
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    connectSquare(loop1, loop2, index1, index2) {
        const offset1 = loop1 * (this.slices + 1);
        const offset2 = loop2 * (this.slices + 1);
        const bottomLeft = offset1 + index1;
        const bottomRight = offset2 + index1;
        const topLeft = offset1 + index2;
        const topRight = offset2 + index2;
        this.indices.push(
            bottomLeft, bottomRight, topRight,
            topRight, topLeft, bottomLeft
        );
    }
}