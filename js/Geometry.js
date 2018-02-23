// Scotti Anderson
// Geometry
// functions involved in geometry

/**\
 * Creates a rectangle
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

/**
 * Trims the end of the line segment by the given amount
 * @param amount How much to trim
 */
Line1D.prototype.trimEnd = function (amount) {
    this.end = this.end - amount;
    this.length = Math.abs(this.end - this.start);
};

/**
 * Trims the start of the line segment by the given amount
 * @param amount How much to trim
 */
Line1D.prototype.trimStart = function (amount) {
    this.start = this.start + amount;
    this.length = Math.abs(this.end - this.start);
};

/**
 * Returns a String representation of a Line1D
 * @returns {string}
 */
Line1D.prototype.toString = function () {
    return "\nLine1D (" + this.start + " - " + this.end + ", Length: "+ this.length + ")";
};

/**
 * A function for comparing based on the left edge for sorting
 * @param a
 * @param b
 * @returns {number}
 */
function compareLeft(a, b) {
    if (a.left < b.left) {
        return -1;
    }
    if (a.left > b.left) {
        return 1;
    }
    return 0;
}

/**
 * A function for comparing based on the top edge for sorting
 * @param a
 * @param b
 * @returns {number}
 */
function compareTop(a, b) {
    if (a.top < b.top) {
        return -1;
    }
    if (a.top > b.top) {
        return 1;
    }
    return 0;
}

/**
 * A function for comparing based on the length for sorting
 * @param a
 * @param b
 * @returns {number}
 */
function compareLength(a, b) {
    if (a.length < b.length) {
        return -1;
    }
    if (a.length > b.length) {
        return 1;
    }
    return 0;
}
