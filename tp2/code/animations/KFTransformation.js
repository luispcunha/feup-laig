class KFTransformation {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getArray() {
        return [this.x, this.y, this.z];
    }

    static computeLinearInterpolation(kft1, kft2, progress) {
        return kft2.getArray().map(function (v, i) {
            return this[i] + (v - this[i]) * progress;
        },
        kft1.getArray());
    }

    static computeScaleGeoProg(kft1, kft2, startTime, finishTime, currentTime) {
        return kft2.getArray().map(function (v, i) {

            let initialScale = v;
            let finalScale = this[i];
            let delta = 0;

            const min = Math.min(initialScale, finalScale);
            if (min <= 0) {
                delta = 1 - min;
                initialScale += delta;
                finalScale += delta;
            }

            const r = Math.pow(initialScale / finalScale, 1 / (finishTime - startTime));

            return (finalScale * Math.pow(r, currentTime)) - delta;
        },
        kft1.getArray());
    }
}