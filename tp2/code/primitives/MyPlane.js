class MyPlane extends CGFnurbsObject {
    constructor(scene, npartsU, npartsV) {
        const surface = new CGFnurbsSurface(1, 1,
            [ // control points
                [ // u = 0
                    [-0.5, 0, -0.5], // v = 0
                    [-0.5, 0, 0.5] // v = 1
                ],
                [ // u = 1
                    [0.5, 0, -0.5], // v = 0
                    [0.5, 0, 0.5] // v = 1
                ]
            ]);
        super(scene, npartsU, npartsV, surface);
    }

    scaleTexCoords(length_s, length_t) {
        return;
    }
}
