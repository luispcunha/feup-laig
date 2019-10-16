class MyTriangle extends CGFobject {
	constructor(scene, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
		super(scene);
		this.x1 = x1;
		this.y1 = y1;
		this.z1 = z1;
		this.x2 = x2;
		this.y2 = y2;
		this.z2 = z2;
		this.x3 = x3;
		this.y3 = y3;
		this.z3 = z3;

		this.initBuffers();
    }

    initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	// 0
			this.x2, this.y2, this.z2,  // 1
			this.x3, this.y3, this.z3	// 2
		];

		// Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
		];

		// vector from point 1 to point 2
		var vector_1_2 = vec3.create();
		vector_1_2 = [
			this.x2 - this.x1,
			this.y2 - this.y1,
			this.z2 - this.z1
		];
		
		// vector from point 2 to point 3
		var vector_3_2 = vec3.create();
		vector_3_2 = [
			this.x3 - this.x2,
		  	this.y3 - this.y2,
			this.z3 - this.z2
	    ];

		// normal to the surface of the triangle
		var normal = vec3.create();
		vec3.cross(normal, vector_1_2, vector_3_2);
		vec3.normalize(normal, normal);
			
		this.normals = [
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2]
		];


		// calculos para as texCoords
		var a = Math.sqrt(Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2 - this.y1, 2) + Math.pow(this.z2 - this.z1, 2));
		var b = Math.sqrt(Math.pow(this.x3 - this.x2, 2) + Math.pow(this.y3 - this.y2, 2) + Math.pow(this.z3 - this.z2, 2));
		var c = Math.sqrt(Math.pow(this.x1 - this.x3, 2) + Math.pow(this.y1 - this.y3, 2) + Math.pow(this.z1 - this.z3, 2));

		var alphaCos = (Math.pow(a, 2) - Math.pow(b, 2) + Math.pow(c, 2)) / (2 * a * c);
		var alphaSin = Math.sqrt(1 - Math.pow(alphaCos, 2));

		this.defaultTexCoords = [
			0, 0,
			a, 0,
			c * alphaCos, c * alphaSin
		];

		this.texCoords = this.defaultTexCoords.slice();
		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
    }
    
    /**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the rectangle
	 * @param {Array} coords - Array of texture coordinates
	 */
	updateTexCoords(coords) {
		this.texCoords = [...coords];
		this.updateTexCoordsGLBuffers();
	}

	scaleTexCoords(ls, lt) {
		this.texCoords = [];
		for (var i = 0; i < this.defaultTexCoords.length; i = i + 2) {
			var s = this.defaultTexCoords[i] / ls;
			var t = this.defaultTexCoords[i + 1] / lt;
			this.texCoords.push(s,t);
		}
		this.updateTexCoordsGLBuffers();
	}
}