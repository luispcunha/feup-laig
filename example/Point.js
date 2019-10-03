class Point {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    static fromSpherical(horizAngle, vertAngle, radius) {
        return new Point(
            Math.cos(horizAngle) * Math.cos(vertAngle) * radius,
            Math.sin(horizAngle) * Math.cos(vertAngle) * radius,
            Math.sin(vertAngle) * radius
        );
    }

    static fromCylindrical(angle, radius, height) {
        return new Point(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            height
        );
    }

    toCoordArray() {
        return [this.x, this.y, this.z];
    }

    static distance(p1, p2) {
        const vec = [p1.x - p2.x, p1.y - p2.y, p1.z - p2.z];
        const square = vec.map(n => n * n).reduce((acc, val) => acc + val);
        return Math.sqrt(square);
    }
}