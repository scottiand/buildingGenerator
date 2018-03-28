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
 * Returns the location of the given side
 * @param direction
 * @returns {*}
 */
Rectangle.prototype.getSide = function (direction) {
    switch (direction) {
        case "south":
            return this.bottom;
        case "north":
            return this.top;
        case "west":
            return this.left;
        case "east":
            return this.right;
        default:
            throw("invalid direction: " + direction);
    }
};

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
 * Returns true if this line intersects the given line
 * @param line
 * @returns {boolean}
 */
Line1D.prototype.intersection = function (line) {
    if (Math.max(line.start,line.end) < Math.min(this.start, this.end) || Math.min(line.start, line.end) > Math.max(this.start, this.end)) return false;
    return true;
};

/**
 * Returns a pair of lines that represents the original line cut in half by the given line
 * Returns an object of the form {line1, line2}
 * If the two lines do not intersect, returns {this, null}
 * If the the two lines overlap, returns {line1, null} where line1 is the line that represents space not overlapped
 * If the given line is completely contained by this line, return {line1, line2} where line1 and line2 are the areas
 *      where the given line does not intersect this line.
 * @param line
 * @returns {*}
 */
Line1D.prototype.split = function (line) {
    if (!this.intersection(line)) return({line1: this, line2: null});
    var max1 = Math.max(this.start, this.end);
    var max2 = Math.max(line.start, line.end);
    var min1 = Math.min(this.start, this.end);
    var min2 = Math.min(line.start, line.end);
    var line1 = null;
    var line2 = null;
    if (min1 <= min2) {
        line1 = {start: min1, end: min2};
    } // Calculates the first line section
    if (max1 >= max2) {
        line2 = {start: max2, end: max1};
    } // Calculates the second line section
    var toReturn;
    if (this.start < this.end) {
        toReturn = {line1: (line1 !=null ? new Line1D(line1.start, line1.end) : null), line2: (line2 != null ? new Line1D(line2.start, line2.end) : null)};
    } else {
        toReturn = {line1: (line2 !=null ? new Line1D(line2.end, line2.start) : null), line2: (line1 !=null ? new Line1D(line1.end, line1.start) : null)};
    } // Return a line moving in the same direction as the original
    //if (toReturn.line1 != null && toReturn.line1.length <= 0) toReturn.line1 = null; // Only return lines with length greater than 0
    //if (toReturn.line2 != null && toReturn.line2.length <= 0) toReturn.line2 = null;
    if (toReturn.line1 === null) {
        toReturn.line1 = toReturn.line2;
        toReturn.line2 = null;
    } // If line1 is empty, move line2 to line1
    return toReturn;
};

/**
 * Returns a Line2D that represents the given line if it were layed on the given edge of the plot
 * @param plot
 * @param direction
 */
Line1D.prototype.to2DPlotEdge = function (plot, direction) {
    switch (direction) {
        case 'north':
        case 'south':
            return new Line2D(this.start, plot.getSide(direction), this.end, plot.getSide(direction));
        case 'east':
        case 'west':
            return new Line2D(plot.getSide(direction), this.start, plot.getSide(direction), this.end);
        default:
            throw("invalid direction: " + direction);
    }
};

/**
 * Returns a Line2D that represents the given line if it were layed on the given edge of the proom
 * @param room
 * @param direction
 * @returns {Line2D}
 */
Line1D.prototype.to2DRoomEdge = function (room, direction) {
    switch (direction) {
        case 'north':
        case 'south':
            return new Line2D(this.start, room.getSide(direction), this.end,room.getSide(direction));
            //if (line.x1 > 13 && line.x1 < 14 && line.y1 > 13 && line.y1 < 14) console.log(room.name);
            //return line;
        case 'east':
        case 'west':
            return new Line2D(room.getSide(direction), this.start, room.getSide(direction), this.end);
        default:
            throw("invalid direction: " + direction);
    }
};

/**
 * Makes sure that the start value is lower than the end value
 * If the end value is lower, the values are swapped
 */
Line1D.prototype.makeStartLowerThanEnd = function () {
  this.start = Math.min(this.start, this.end);
  this.end = Math.max(this.start, this.end);
};

/**
 * A two-dimensional line segment
 * @param x1 The x value of the first point
 * @param y1 The y value of the first point
 * @param x2 The x value of the second point
 * @param y2 The y value of the second point
 * @constructor
 */
function Line2D(x1, y1, x2, y2) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 *  If the line is facing in a cardinal direction, return it as a Line1D, otherwise return null
 * @returns {*}
 */
Line2D.prototype.toLine1D = function() {
    if (equals(this.x1, this.x2)) return new Line1D(Math.min(this.y1, this.y2), Math.max(this.y1, this.y2));
    if (equals(this.y1, this.y2)) return new Line1D(Math.min(this.x1, this.x2), Math.max(this.x1, this.x2));
    return null;
};

/**
 * Returns a string representation of the object
 * @returns {string}
 */
Line2D.prototype.toString = function () {
    return "(" + this.x1 + ", " + this.y1 + ") - (" + this.x2 + ", " + this.y2 + ")";
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

/**
 * Represents an edge connected to a room. Contains a Line2D, a room, and a direction representing the side of the edge the room is on
 * @param line
 * @param room
 * @constructor
 */
function Edge(line, room) {
    this.line = line;
    this.room = room;
    if (equals(this.line.x1, this.line.x2)) {
        this.vertical = true;
        this.location = this.line.x1;
    } else if (equals(this.line.y1, this.line.y2)) {
        this.vertical = false;
        this.location = this.line.y1;
    } else {
        throw("Edge must be a strait line");
    }
    if (this.vertical) {
        if (equals(this.room.locX, this.location)) {
            this.directionOfRoom = 'east';
        } else if (equals(this.room.right(), this.location)) {
            this.directionOfRoom = 'west';
        } else {
            throw("Edge must connect to room");
        }
    } else {
        if (equals(this.room.locY, this.location)) {
            this.directionOfRoom = 'south';
        } else if (equals(this.room.bottom(), this.location)) {
            this.directionOfRoom = 'north';
        } else {
            throw("Edge must connect to room");
        }
    }
}

/**
 * Returns true if either point on the edge equals the given point
 * @param x
 * @param y
 * @returns {boolean}
 */
Edge.prototype.hasPoint = function (x, y) {
    return (equals(this.line.x1, x) && equals(this.line.y1, y)) || (equals(this.line.x2, x) && equals(this.line.y2, y));
};

/**
 * Given one of the points on the edge, returns the other point
 * @param point
 * @returns {{x: *|number|SVGAnimatedLength, y: *|SVGAnimatedLength|number}}
 */
Edge.prototype.getOtherPoint = function (point) {
    if (this.hasPoint(point.x, point.y)) {
        if (equals(this.line.x1, point.x) && equals(this.line.y1, point.y)) return {x: this.line.x2, y: this.line.y2};
        if (equals(this.line.x2, point.x) && equals(this.line.y2, point.y)) return {x: this.line.x1, y: this.line.y1};
    } else {
        throw("Edge does not contain point (" + point.x + ", " + point.y + ")");
    }
};

/**
 * Returns true if the edge runs along the given structure
 * Works for Room and Plot
 * @param structure
 * @returns {boolean}
 */
Edge.prototype.contacts = function(structure) {
    if (this.vertical) {
        return (equals(this.location, structure.getSide('east')) || equals(this.location, structure.getSide('west')));
    } else {
        return (equals(this.location, structure.getSide('north')) || equals(this.location, structure.getSide('south')));
    }
};

/**
 * Returns this edge as a Line1D
 * @returns {*}
 */
Edge.prototype.getLine1D = function () {
    return this.line.toLine1D();
};

/**
 * Returns a string representation of the edge
 * @returns {string}
 */
Edge.prototype.toString = function () {
    return this.line.toString() + "\n";
};

/**
 * Returns a rectangle that spans from this edge to the edge of the plot
 * @param plot
 * @returns {Rectangle}
 */
Edge.prototype.getSpace = function(plot) {
    switch (this.directionOfRoom) {
        case "south":
            return new Rectangle(Math.min(this.line.x1, this.line.x2), 0, this.line.length, this.location);
        case "north":
            return new Rectangle(Math.min(this.line.x1, this.line.x2), this.location, this.line.length, plot.height - this.location);
        case "west":
            return new Rectangle(this.location, Math.min(this.line.y1, this.line.y2), plot.width - this.location, this.line.length);
        case "east":
            return new Rectangle(0, Math.min(this.line.y1, this.line.y2), this.location, this.line.length);
        default:
            throw("invalid direction: " + this.directionOfRoom);
    }
};

/**
 * Returns the first edge in the list that contains the given point
 * @param edgeList
 * @param point
 * @returns {*}
 */
function getEdge(edgeList, point) {
    //console.log("-------------------------")
    for (var i = 0; i < edgeList.length; i++) {
        // console.log("getEdge");
        // console.log(edgeList[i]);
        // console.log(point);
        if (edgeList[i].hasPoint(point.x, point.y)) return edgeList[i];
    }
    return null;
}

/**
 * Removes and returns the first edge in the list that contains the given point
 * @param edgeList
 * @param point
 * @returns {*}
 */
function removeEdge(edgeList, point) {
    var edge = getEdge(edgeList, point);
    edgeList.splice(edgeList.indexOf(edge), 1);
    return edge;
}

function sortEdgesByRoomPrivacy(a, b) {
    var aPriv = a.room.privacy;
    var bPriv = b.room.privacy;
    if (aPriv < bPriv) {
        return -1;
    }
    if (aPriv > bPriv) {
        return 1;
    }
    return 0;
}
