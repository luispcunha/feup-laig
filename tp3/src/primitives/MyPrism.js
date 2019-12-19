/**
* MyPrism
* @constructor
*/
class MyPrism extends CGFobject {
    constructor(scene, slices, apothem, height) {
        super(scene);
        this.slices = slices;
        this.apothem = apothem;
        this.height = height;

        this.initBuffers();
    }
    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const radius = this.apothem / Math.cos(Math.PI / this.slices);

        let ang = 0;
        const alphaAng = 2 * Math.PI / this.slices;

        for (let i = 0; i < this.slices; i++) {
            // All vertices have to be declared for a given face
            // even if they are shared with others, as the normals
            // in each face will be different

            const sa = Math.sin(ang);
            const saa = Math.sin(ang + alphaAng);
            const ca = Math.cos(ang);
            const caa = Math.cos(ang + alphaAng);

            this.vertices.push(ca * radius, 0, -sa * radius);
            this.vertices.push(caa * radius, 0, -saa * radius);
            this.vertices.push(ca * radius, this.height, -sa * radius);
            this.vertices.push(caa * radius, this.height, -saa * radius);

            // triangle normal computed by cross product of two edges
            const normal = [
                saa - sa,
                0,
                caa - ca
            ];

            // normalization
            const nsize = Math.sqrt(
                normal[0] * normal[0] +
                normal[1] * normal[1] +
                normal[2] * normal[2]
            );

            normal[0] /= nsize;
            normal[1] /= nsize;
            normal[2] /= nsize;

            // push normal once for each vertex of this triangle
            this.normals.push(...normal);
            this.normals.push(...normal);
            this.normals.push(...normal);
            this.normals.push(...normal);

            this.indices.push(4 * i + 2, 4 * i, 4 * i + 1);
            this.indices.push(4 * i + 1, 4 * i + 3, 4 * i + 2);

            const tex = [
                i / this.slices, 1,
                (i + 1) / this.slices, 1,
                i / this.slices, 0,
                (i + 1) / this.slices, 0
            ];

            this.texCoords.push(...tex);

            ang += alphaAng;
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    scaleTexCoords(ls, lt) {}
}