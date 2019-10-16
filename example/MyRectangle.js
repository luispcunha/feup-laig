/**
 * MyRectangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param x - Scale of rectangle in X
 * @param y - Scale of rectangle in Y
 */
class MyRectangle extends CGFobject {
	constructor(scene, id, x1, x2, y1, y2) {
		super(scene);
		this.x1 = x1;
		this.x2 = x2;
		this.y1 = y1;
		this.y2 = y2;
		this.length_s = 1;
		this.length_t = 1;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [
			this.x1, this.y1, 0,	//0
			this.x2, this.y1, 0,	//1
			this.x1, this.y2, 0,	//2
			this.x2, this.y2, 0		//3
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
			1, 3, 2
		];

		//Facing Z positive
		this.normals = [
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1
		];
		
		
		this.initTexCoords();
		

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	initTexCoords() {
		const height = Math.abs(this.y2 - this.y1);
		const width = Math.abs(this.x2 - this.x1);

		this.defaultTexCoords = [
			0, height,
			width, height,
			0, 0,
			width, 0
		];

		this.texCoords = this.defaultTexCoords;
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

	scaleTexCoords(length_s, length_t) {
        if (length_s != this.length_s || length_t != this.length_t) {
            this.length_s = length_s;
			this.length_t = length_t;
			
            this.texCoords = [];
		    for (let i = 0; i < this.defaultTexCoords.length; i = i + 2) 
		        this.texCoords.push(this.defaultTexCoords[i] / length_s, this.defaultTexCoords[i + 1] / length_t);
		}

		this.updateTexCoordsGLBuffers();
    }
}

