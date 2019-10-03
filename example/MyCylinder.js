class MyCylinder extends CGFobject {
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

    calcAngleDelta() {
        this.angleDelta = 2 * Math.PI / this.slices;
    }

    calcHeightDelta() {
        this.heightDelta = this.height / this.stacks;
    }

    calcSlope() {
        this.slope = (this.topRadius - this.bottomRadius) / this.height;
    }

    initBuffers() {
        this.generateVertices();
        this.generateNormals();
        this.generateIndices();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    generateVertices() {
        this.vertices = [];
        for (let slice = 0; slice < this.slices; slice++)
            this.appendSlice(slice);
    }

    generateNormals() {
        this.normals = [];
        const tan = - 1 / this.slope; /* is the tangent of the angle between the normal and a horizontal plane */
        const sin = Math.sqrt(1 / (1 + 1/(tan * tan)));
        const cos = sin / tan;
        for (let slice = 0; slice < this.slices; slice++) {
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
        for (let slice = 0; slice < this.slices - 1; slice++)
            this.connectSlices(slice, slice + 1);
        this.connectSlices(this.slices - 1, 0);
    }

    appendSlice(slice) {
        const angle = slice * this.angleDelta;
        for (let stack = 0; stack <= this.stacks; stack++) {
            const height = this.heightDelta * stack;
            const radius = this.bottomRadius + height*this.slope;
            this.vertices.push(...this.cylindricalToRectangular(radius, angle, height));
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

    cylindricalToRectangular(radius, angle, height) {
        const x = radius * Math.cos(angle);
        const y = radius *Math.sin(angle);
        const z = height;
        return [x, y, z];
    }
}