/** Represents a point in 3D space */
class Point {
  /**
   * Constructs a point from rectangular coordinates
   * @constructor
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
   * Yields a point converting from spherical coordinates
   * @param {Number} horizAngle azimuth, it is the angle along the horizontal projetion plane (xOy)
   * @param {Number} vertAngle the complement of the polar angle, it is the angle between the line 
   * that connects the dot and the origin, and the horizontal projection plane (xOy)
   * @param {Number} radius distance from the origin
   */
  static fromSpherical(horizAngle, vertAngle, radius) {
    return new Point(
      Math.cos(horizAngle) * Math.cos(vertAngle) * radius,
      Math.sin(horizAngle) * Math.cos(vertAngle) * radius,
      Math.sin(vertAngle) * radius
    );
  }

  /**
   * Yields a point converting from cylindrical coordintes
   * @param {Number} angle azimuth, the angle along the horizontal projection plane
   * @param {Number} radius distance between the origin and the horizontal projection of the point
   * @param {Number} height distance from the horizontal projection plane
   */
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

  /**
   * Calculates the distance between two points
   * @param {Point} p1 
   * @param {Point} p2 
   */
  static distance(p1, p2) {
    const vec = [p1.x - p2.x, p1.y - p2.y, p1.z - p2.z];
    const square = vec.map(n => n * n).reduce((acc, val) => acc + val);
    return Math.sqrt(square);
  }
}
