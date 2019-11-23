/**
 * Class KFTransformation, used to represent the values of a transformation (rotation, scale and translation).
 */
class KFTransformation {
    /**
     * @constructor
     *
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Gets the transformation in an array representation.
     */
    getArray() {
        return [this.x, this.y, this.z];
    }

    /**
     * Computes the linear interpolation of two KFTransformation instances, given the current progress.
     *
     * @param {KFTransformation} kft1
     * @param {KFTransformation} kft2
     * @param {Number} progress
     */
    static computeLinearInterpolation(kft1, kft2, progress) {
        return kft2.getArray().map(function (v, i) {
            return this[i] + (v - this[i]) * progress;
        },
        kft1.getArray());
    }

    /**
     * Computes the scale value for the currentTime between two given keyframe (the one whose instant is startTime
     * and the on whose instant is finishTime) transformations representing scale transformations.
     *
     * @param {KFTransformation} kft1
     * @param {KFTransformation} kft2
     * @param {Number} startTime
     * @param {Number} finishTime
     * @param {Number} currentTime
     */
    static computeScaleGeoProg(kft1, kft2, startTime, finishTime, currentTime) {
        return kft2.getArray().map(function (v, i) {

            let initialScale = v;
            let finalScale = this[i];

            let delta = 0;

            // if the "interpolation" of the scale values crosses 0
            // make the values positive by adding "delta", and subtract "delta" to the result
            const min = Math.min(initialScale, finalScale);
            if (min <= 0) {
                delta = 1 - min;
                initialScale += delta;
                finalScale += delta;
            }

            // common ration of the geometric progression
            const r = Math.pow(initialScale / finalScale, 1 / (finishTime - startTime));

            return (finalScale * Math.pow(r, currentTime)) - delta;
        },
        kft1.getArray());
    }
}