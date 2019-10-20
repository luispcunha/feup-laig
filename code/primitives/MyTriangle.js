class MyTriangle extends CGFobject {
  constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
    super(scene);
    this.p1 = new Point(x1, y1, z1);
    this.p2 = new Point(x2, y2, z2);
    this.p3 = new Point(x3, y3, z3);

    this.x1 = x1;
    this.y1 = y1;
    this.z1 = z1;
    this.x2 = x2;
    this.y2 = y2;
    this.z2 = z2;
    this.x3 = x3;
    this.y3 = y3;
    this.z3 = z3;

    this.length_s = 1;
    this.length_t = 1;
    this.initBuffers();
  }

  initBuffers() {
    this.initVertices();
    this.initIndices();
    this.initNormals();
    this.initTexCoords();
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
    /* Uses Newell's method */
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

  scaleTexCoords(length_s, length_t) {
    if (length_s != this.length_s || length_t != this.length_t) {

      this.length_s = length_s;
      this.length_t = length_t;
      this.texCoords = this.defaultTexCoords.map((val, i) => val / ((i % 2 == 0) ? length_s : length_t));

      this.updateTexCoordsGLBuffers();
    }
  }

  initTexCoords() {
    const a = Vector.fromPoints(this.p1, this.p2).length;
    const b = Vector.fromPoints(this.p2, this.p3).length;
    const c = Vector.fromPoints(this.p3, this.p1).length;
    const cosAlpha = (Math.pow(a, 2) - Math.pow(b, 2) + Math.pow(c, 2)) / (2 * a * c);
    const sinAlpha = Math.sqrt(1 - Math.pow(cosAlpha, 2));

    this.defaultTexCoords = [
      0, 0,
      a, 0,
      c * cosAlpha, c * sinAlpha
    ];

    this.texCoords = this.defaultTexCoords;
    this.updateTexCoordsGLBuffers();
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
