class Vector {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.length = Math.sqrt(x * x + y * y + z * z);
    }

    static fromPoints(p1, p2) {
        return new Vector(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
    }

    toCoordArray() {
        return [this.x, this.y, this.z];
    }

    normalized() {
        return new Vector(...this.toCoordArray.map(coord => coord / this.length));
    }

    static scalarProduct(vec1, vec2) {
        return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z + vec2.z;
    }

    static crossProduct(vec1, vec2) {
        return new Vector(
            vec1.y * vec2.z - vec1.z * vec2.y,
            vec1.z * vec2.x - vex1.x * vec2.z,
            vec1.x * vec2.y - vec1.y * vec2.x
        );
    }

    static angle(vec1, vec2) {
        return Math.acos(Vector.cos(vec1, vec2));
    }

    static cos(vec1, vec2) {
        return Vector.scalarProduct(vec1, vec2) / vec1.length / vec2.length;
    }

    static sin(vec1, vec2) {
        return Math.sqrt(1 - Math.pow(Vector.cos(vec1, vec2), 2));
    }
}