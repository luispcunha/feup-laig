/**
 * Class MyPlane allows creation of plane primitives using NURBS surfaces
 */
class MyPlane extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     * @param {Number} npartsU
     * @param {Number} npartsV
     */
    constructor(scene, npartsU, npartsV) {
        super(scene);
        const surface = new CGFnurbsSurface(1, 1,
            [ // control points
                [ // u = 0
                    [0.5, 0, -0.5, 1], // v = 0
                    [0.5, 0, 0.5, 1] // v = 1
                ],
                [ // u = 1
                    [-0.5, 0, -0.5, 1], // v = 0
                    [-0.5, 0, 0.5, 1] // v = 1
                ]
            ]);

        this.nurbsObject = new CGFnurbsObject(this.scene, npartsU, npartsV, surface);

        this.scaleTexCoords = (ls, lt) => {}
        this.display = () => { this.nurbsObject.display() }
    }
}
