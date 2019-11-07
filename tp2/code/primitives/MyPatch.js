/**
 * MyPatch
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyPatch extends CGFobject {
	constructor(scene, uDegree, vDegree, nPartsU, nPartsV, controlPoints) {
        super(scene);

        if ((uDegree + 1) * (vDegree + 1) != controlPoints.length)
            return null;

        const formattedCtrlPoints = this.formatCtrlPtsVector(controlPoints, uDegree + 1, vDegree + 1);
        
        const nurbsSurface = new CGFnurbsSurface(uDegree, vDegree, formattedCtrlPoints);
		this.nurbsObject = new CGFnurbsObject(this.scene, nPartsU, nPartsV, nurbsSurface); 

        this.scaleTexCoords = (ls, lt) => {}
        this.display = () => { this.nurbsObject.display() }
    }

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
