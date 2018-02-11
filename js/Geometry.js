// Scotti Anderson
// Geometry
// functions involved in geometry

/**\
 * A rectangle
 * @param left The x location of the left side
 * @param top The y location of the right side
 * @param width The width of the rectangle
 * @param height The height of the rectangle
 * @constructor
 */
function Rectangle(left, top, width, height) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.bottom = this.top + this.height;
    this.right = this.left + this.width;
    this.area = this.width * this.height;
}

/**
 * A 1 Dimensional line segment
 * @param start The line's start point
 * @param end THe lines end point
 * @constructor
 */
function Line1D(start, end) {
    this.start = start;
    this.end = end;
    this.length = Math.abs(this.end - this.start);
}
