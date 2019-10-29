class KFTransformation {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    getArray() {
        return [this.x, this.y, this.z];
    }

    static interpolate(kft1, kft2, progress) {
        return kft2.getArray().map(function (v, i) { return this[i] + (v - this[i]) * progress; }, kft1.getArray());
    }
}