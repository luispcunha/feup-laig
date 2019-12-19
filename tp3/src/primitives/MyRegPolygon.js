/**
* MyRegPolygon
* @constructor
*/
class MyRegPolygon extends CGFobject {
    constructor(scene, slices, apothem) {
        super(scene);
        this.slices = slices;
        this.apothem = apothem;

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

        this.vertices.push(0, 0, 0);
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0.5);

        for (let i = 0; i < this.slices; i++) {
            // All vertices have to be declared for a given face
            // even if they are shared with others, as the normals
            // in each face will be different

            const sa = Math.sin(ang);
            const ca = Math.cos(ang);

            this.vertices.push(ca * radius, 0, -sa * radius);
            this.texCoords.push(0.5 + ca * 0.5, -0.5 * sa + 0.5);

            // The normal of the vertices the bisector of the angle created by two edges
            const normal = [ 0, 0, 1 ];

            // push normal once for each vertex of this triangle
            this.normals.push(...normal);

            if (i < this.slices - 1)
                this.indices.push(i + 1, i + 2, 0);
            else
                this.indices.push(i + 1, 1, 0);

            ang += alphaAng;
        }

        if (this.orientation == -1)
            this.indices.reverse();

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}
