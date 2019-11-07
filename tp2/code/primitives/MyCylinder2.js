/**
 * This class provides a primitive in the shape of a cylinder, with no 
 * caps, variable height, bottom and top radius.
 */
class MyCylinder2 extends CGFobject {
    /**
     * Will yield a new Cylinder with the rotating axis on 
     * _scene_'s z axis.
     * @constructor
     * @param {CGFscene} scene 
     * @param {Number} stacks the number of  subdivisions along the 
     * cylinder's height.
     * @param {Number} slices the number of angular subdivisions of the 
     * curves' discretisation
     * @param {Number} bottomRadius 
     * @param {Number} topRadius 
     * @param {Number} height 
     */
    constructor(scene, stacks, slices, bottomRadius, topRadius, height) {
        super(scene);    
        
        const hBottom = 4 / 3 * bottomRadius; 
        const hTop = 4 / 3 * topRadius;

        const surface = new CGFnurbsSurface(1, 3,
            [ // control points
                [ // u = 0
                    [0, bottomRadius, 0, 1], // v = 0
                    [hBottom, bottomRadius, 0, 1], // v = 1
                    [hBottom, -bottomRadius, 0, 1], // v = 2
                    [0, -bottomRadius, 0, 1] // v = 3
                ],
                [ // u = 1
                    [0, topRadius, height, 1], // v = 0
                    [hTop, topRadius, height, 1], // v = 1
                    [hTop, -topRadius, height, 1], // v = 2
                    [0, -topRadius, height, 1] // v = 3
                ]
            ]);
        
        this.semiCylinder = new CGFnurbsObject(this.scene, stacks, slices, surface);

        this.scaleTexCoords = (lengthS, lengthT) => {}
    }

    display() {
        this.semiCylinder.display();
        this.scene.pushMatrix();
        this.scene.rotate(Math.PI, 0, 0, 1);
        this.semiCylinder.display();
        this.scene.popMatrix();
    }
}