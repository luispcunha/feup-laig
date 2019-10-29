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
            const r = Math.pow(v / this[i], 1 / (finishTime - startTime));
            return this[i] * Math.pow(r, currentTime);
        },
        kft1.getArray());
    }
}