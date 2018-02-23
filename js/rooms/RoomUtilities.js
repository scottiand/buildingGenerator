/**
 * A function for comparing based on privacy for sorting
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
function ComparePrivacy(a, b) {
    if (a.privacy < b.privacy) {
        return -1;
    }
    if (a.privacy > b.privacy) {
        return 1;
    }
    return 0;
}

/**
 * A function for comparing based on the total area of a room and it's descendants for sorting
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
function compareTotalArea(a, b) {
    if (a.totalArea < b.totalArea) {
        return -1;
    }
    if (a.totalArea > b.totalArea) {
        return 1;
    }
    return 0;
}

/**
 * A function for comparing based on area for sorting
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
function compareArea(a, b) {
    if (a.area < b.area) {
        return -1;
    }
    if (a.area > b.area) {
        return 1;
    }
    return 0;
}

/**
 * A function for comparing based on priority for sorting
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
function comparePriority(a, b) {
    if (a.priority < b.priority) {
        return -1;
    }
    if (a.priority > b.priority) {
        return 1;
    }
    return 0;
}

/**
 * Returns a line that represents the overlap between the two rooms in the given direction
 * @param room1
 * @param room2
 * @param direction
 * @returns {Line1D}
 */
function getOverlap(room1, room2, direction) {
    var line1;
    var line2;
    switch (direction) {
        case 'north':
        case 'south':
            line1 = new Line1D(room1.locX, room1.right());
            line2 = new Line1D(room2.locX, room2.right());
            break;
        case 'east':
        case 'west':
            line1 = new Line1D(room1.locY, room1.bottom());
            line2 = new Line1D(room2.locY, room2.bottom());
            break;
        default:
            throw("invalid direction: " + direction);
    }
    if (line1.end < line2.start || line2.end < line1.start) {
        return new Line1D(0,0);
    } else {
        return new Line1D(Math.max(line1.start, line2.start), Math.min(line1.end, line2.end));
    }
}

function getMaxDoor(doorList, direction) {
    var maxDoor;
    switch (direction) {
        case 'north':
            for (var i = 0; i < doorList.length; i++) {
                if (typeof maxDoor === 'undefined') {
                    maxDoor = doorList[i];
                } else if (doorList[i].y <= maxDoor.y) {
                    maxDoor = doorList[i];
                }
            }
            break;
        case 'south':
            for (var i = 0; i < doorList.length; i++) {
                if (typeof maxDoor === 'undefined') {
                    maxDoor = doorList[i];
                } else if (doorList[i].y >= maxDoor.y) {
                    maxDoor = doorList[i];
                }
            }
            break;
        case 'east':
            for (var i = 0; i < doorList.length; i++) {
                if (typeof maxDoor === 'undefined') {
                    maxDoor = doorList[i];
                } else if (doorList[i].x >= maxDoor.x) {
                    maxDoor = doorList[i];
                }
            }
            break;
        case 'west':
            for (var i = 0; i < doorList.length; i++) {
                if (typeof maxDoor === 'undefined') {
                    maxDoor = doorList[i];
                } else if (doorList[i].x <= maxDoor.x) {
                    maxDoor = doorList[i];
                }
            }
            break;
        default:
            throw("invalid direction: " + this.direction);
    }
    return maxDoor;
}
