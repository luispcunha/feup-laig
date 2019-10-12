class MyTriangle extends CGFobject {
    constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3, length_s, length_t) {
        super(scene);
        this.p1 = new Point(x1, y1, z1);
        this.p2 = new Point(x2, y2, z2);
        this.p3 = new Point(x3, y3, z3);
        this.length_s = length_s;
        this.length_t = length_t;
        this.initBuffers();
    }

    initBuffers() {
        this.initVertices();
        this.initIndices();
        this.initNormals();
        this.initTexture();
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    initVertices() {
        this.vertices = [];
        [this.p1, this.p2, this.p3].forEach(p => this.vertices.push(...p.toCoordArray()));
    }

    initIndices() {
        this.indices = [0, 1, 2];
    }

    initNormals() {
        const nx = this.getNormalX();
        const ny = this.getNormalY();
        const nz = this.getNormalZ();
        const length = Math.sqrt(nx*nx + ny*ny + nz*nz);
        const normal = [nx, ny, nz].map(n => n / length);

        this.normals = [];
        for (let n = 0; n < 3; n++) {
            this.normals.push(...normal);
        }
    }

    initTexture() {
        const v12 = Vector.fromPoints(this.p1, this.p2);
        const v13 = Vector.fromPoints(this.p1, this.p3);
        const cosAlpha = Vector.cos(v12, v13);
        const p3RelativeY = Vector.fromPoints(this.p2, this.p3).length * cosAlpha;
        const p3RelativeX = v13.length * cosAlpha;
        this.texCoords = [
            0, 0,
            v12.length / this.length_s, 0,
            p3RelativeX / this.length_s, p3RelativeY / this.length_t
        ];
    }

    getNormalX() {
        const v = [this.p1, this.p2, this.p3];
        let acc = 0;
        for (let i = 0; i < 3; i++) {
            const j = (i + 1) % 3;
            acc += (v[i].y - v[j].y)*(v[i].z + v[j].z);
        }
        return acc;
    }

    getNormalY() {
        const v = [this.p1, this.p2, this.p3];
        let acc = 0;
        for (let i = 0; i < 3; i++) {
            const j = (i + 1) % 3;
            acc += (v[i].z - v[j].z)*(v[i].x + v[j].x);
        }
        return acc;
    }

    getNormalZ() {
        const v = [this.p1, this.p2, this.p3];
        let acc = 0;
        for (let i = 0; i < 3; i++) {
            const j = (i + 1) % 3;
            acc += (v[i].x - v[j].x)*(v[i].y + v[j].y);
        }
        return acc;
    }
}