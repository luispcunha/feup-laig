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

        const outerAngleDelta = 2 * Math.PI / this.loops;
        const innerAngleDelta = 2 * Math.PI / this.slices;

        for (let loop = 0; loop < this.loops; loop++) {
            const outerAngle = loop * outerAngleDelta;
            const outerCos = Math.cos(outerAngle);
            const outerSin = Math.sin(outerAngle);
            for (let slice = 0; slice < this.slices; slice++) {
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
            }
        }

        for (let loop = 0; loop < this.loops - 1; loop++) {
            this.connectLoops(loop, loop + 1);
        }
        this.connectLoops(this.loops - 1, 0);

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    connectLoops(loop1, loop2) {
        for (let slice = 0; slice < this.slices - 1; slice++) {
            this.connectSquare(loop1, loop2, slice, slice + 1);
        }
        this.connectSquare(loop1, loop2, this.slices - 1, 0);
    }

    connectSquare(loop1, loop2, index1, index2) {
        const offset1 = loop1 * this.slices;
        const offset2 = loop2 * this.slices;
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