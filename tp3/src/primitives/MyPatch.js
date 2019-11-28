/**
 * MyPatch class that creates NURBS objects
 */
class MyPatch extends CGFobject {
    /**
     * @constructor
     *
     * @param {CGFscene} scene
     * @param {Number} uDegree
     * @param {Number} vDegree
     * @param {Number} nPartsU
     * @param {Number} nPartsV
     * @param {vec3[]} controlPoints
     */
    constructor(scene, uDegree, vDegree, nPartsU, nPartsV, controlPoints) {
        super(scene);

        // validate number of control points given
        if ((uDegree + 1) * (vDegree + 1) != controlPoints.length)
            return null;

        const formattedCtrlPoints = this.formatCtrlPtsVector(controlPoints, uDegree + 1, vDegree + 1);

        const nurbsSurface = new CGFnurbsSurface(uDegree, vDegree, formattedCtrlPoints);
        this.nurbsObject = new CGFnurbsObject(this.scene, nPartsU, nPartsV, nurbsSurface);

        this.scaleTexCoords = (ls, lt) => {}
        this.display = () => { this.nurbsObject.display() }
    }

    /**
     * Create a control points vector that corresponds to the expected
     * to the CGFnurbsSurface object
     *
     * @param {vec3[]} controlPoints
     * @param {Number} nPointsU
     * @param {Number} nPointsV
     */
    formatCtrlPtsVector(controlPoints, nPointsU, nPointsV) {
        let formatted = [];
        let ctrlPtsIndex = 0;
        for (let i = 0; i < nPointsU; i++) {

            let uCtrlPts = [];

            for (let j = 0; j < nPointsV; j++) {
                controlPoints[ctrlPtsIndex].push(1);
                uCtrlPts.push(controlPoints[ctrlPtsIndex]);
                ctrlPtsIndex++;
            }

            formatted.push(uCtrlPts);
        }

        return formatted;
    }
}
