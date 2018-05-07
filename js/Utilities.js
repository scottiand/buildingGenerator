/*
Miscellaneous functions and variables
 */

// The cardinal directions, as used by many parts of the algorithm
var directions = ['north', 'east', 'south', 'west'];
// For comparing decimal values
var precision = 0.0000001;
// Determines if the spit() function can activate
var noisy = false;

/**
 * Returns true if a number is not equal to zero
 * @param number
 * @returns {boolean}
 */
function nonZero(number) {
    return number !== 0;
}

/**
 * Generates tries number of buildings without drawing, and logs the average number of failures
 * @param tries
 */
function testRun(tries) {
    var failure = 0;
    for (var i = 0; i < tries; i++) {
        spit(i);
        seedEntry.value = i;
        failure += generateButtonOnClick(false);
    }
    console.log("Average Failure = " + failure / tries);
}

/**
 * Returns the next direction in the clockwise direction, or counter-clockwise, if clockwise is set to false
 * @param direction
 * @param clockwise
 * @returns {string}
 */
function getNextDirection(direction, clockwise) {
    clockwise = typeof clockwise !== 'undefined' ? clockwise : true;
    var i = directions.indexOf(direction);
    if (clockwise) {
        i++;
        i = i % 4;
        return directions[i];
    } else {
        i--;
        if (i < 0) i = 3;
        return directions[i];
    }
}

/**
 * Returns the opposite direction of the given (North returns South, etc.)
 * @param direction
 * @returns {string}
 */
function getOppositeDirection(direction) {
    var i = directions.indexOf(direction);
    return directions[(i + 2) % 4];
}

/**
 * Returns true if the direction is 'north' of 'south' and false if it is 'east' or 'west'
 * @param direction
 * @returns {boolean}
 */
function vertical(direction) {
    switch (direction) {
        case 'north':
        case 'south':
            return true;
        case 'east':
        case 'west':
            return false;
        default:
            throw("invalid direction: " + direction);
    }
}

/**
 * Sort a list of objects with x and y
 * Objects are sorted based on the direction, such that the ordering is based on a clockwise traversal of a space,
 * as opposed to a left/right or up/down.
 * @param list
 * @param direction
 */
function sortByLocationClockwise(list, direction) {
    switch (direction) {
        case 'north':
            list.sort(compareX);
            break;
        case 'south':
            list.sort(compareX);
            list.reverse();
            break;
        case 'east':
            list.sort(compareY);
            //list.reverse();
            break;
        case 'west':
            list.sort(compareY);
            list.reverse();
            break;
        default:
            throw("invalid direction: " + direction);
    }
}

/**
 * Returns the nearest room in a given direction
 * for 'north', returns the room with the lowest LocX
 * for 'south', returns the room with the greatest Bottom()
 * for 'east', returns the room with the greatest Right()
 * for 'west', returns the room with the lowest LocY
 * @param array An array of rooms
 * @param direction The direction to sort the roms in ('north', 'south', 'east', or 'west')
 * @returns {Room} The nearest room, as described above
 */
function nearestRoom(array, direction) {
    var compareFunction;
    switch (direction) {
        case "north":
            compareFunction = compareBottom;
            break;
        case "south":
            compareFunction = compareLocY;
            break;
        case "east":
            compareFunction = compareLocX;
            break;
        case "west":
            compareFunction = compareRight;
            break;
        default:
            throw("invalid direction: " + direction);
    }
    array.sort(compareFunction);
    switch (direction) {
        case "north":
        case "west":
            array.reverse();
            break;
        case "south":
        case "east":

            break;
        default:
            throw("invalid direction: " + direction);
    }
    return array[0];
}

/**
 * Returns true if the given floating point values are very close to equal
 * Very close is defined by the precision global variable
 * @param numA
 * @param numB
 * @returns {boolean}
 */
function equals(numA, numB) {
    return Math.abs(numA - numB) <= precision;
}

/**
 * Returns true if the first value is greater than or very close to equal to the second value
 * Very close is defined by the precision global variable
 * @param numA
 * @param numB
 * @returns {boolean}
 */
function greaterThanEqual(numA, numB) {
    var diff = numA - numB;
    if (Math.abs(diff) <= precision) return true;
    return (diff > 0);
}

/**
 * Returns true if the first value is less than or very close to equal to the second value
 * Very close is defined by the precision global variable
 * @param numA
 * @param numB
 * @returns {boolean}
 */
function lessThanEqual(numA, numB) {
    var diff = numA - numB;
    if (Math.abs(diff) <= precision) return true;
    return (diff < 0);
}

/**
 * Returns true if the first value is greater than but not very close to equal to the second value
 * Very close is defined by the precision global variable
 * @param numA
 * @param numB
 * @returns {boolean}
 */
function greaterThan(numA, numB) {
    var diff = numA - numB;
    if (Math.abs(diff) <= precision) return false;
    return (diff > 0);
}

/**
 * Returns true if the first value is less than but not very close to equal to the second value
 * Very close is defined by the precision global variable
 * @param numA
 * @param numB
 * @returns {boolean}
 */
function lessThan(numA, numB) {
    var diff = numA - numB;
    if (Math.abs(diff) <= precision) return false;
    return (diff < 0);
}

/**
 * If noisy is set to true, prints the given object to the console
 * @param obj
 */
function spit(obj) {
    if (noisy) {
        if (typeof obj.content === 'undefined') {
            console.log(obj);
        } else {
            for (var i = 0; i < obj.length; i++) {
                console.log(obj.get(i).toString());
            }
        }
    }
}

/**
 * Rule used by a building to determine which RoomTypes to include
 * @param purpose
 * @param min
 * @param max
 * @constructor
 */
function RoomChoiceRule(purpose, min, max) {
    this.purpose = purpose;
    this.min = min;
    this.max = max;
}

/**
 * Places the adjacent list of the given room in the given list
 * @param room
 * @param list
 */
function queueRooms(room, list) {
    for (var i = 0; i < room.adjacent.length; i++) {
        var toPlace = room.adjacent[i];
        if (!toPlace.isPlaced) {
            list.push(toPlace);
        }
    }
}

/*
COMPARISON FUNCTIONS
For use with array.sort()
 */

/**
 * Compares a and b by x
 * @param a
 * @param b
 * @returns {number}
 */
function compareX (a, b) {
    if (a.x < b.x) {
        return -1;
    }
    if (a.x > b.x) {
        return 1;
    }
    return 0;
}

/**
 * Compares a and b by y
 * @param a
 * @param b
 * @returns {number}
 */
function compareY (a, b) {
    if (a.y < b.y) {
        return -1;
    }
    if (a.y > b.y) {
        return 1;
    }
    return 0;
}

/**
 * Compares a and b by score
 * @param a
 * @param b
 * @returns {number}
 */
function compareScore(a, b) {
    if (a.score < b.score) {
        return -1;
    }
    if (a.score > b.score) {
        return 1;
    }
    return 0;
}

/**
 * Compares a and b  numerically
 * @param a
 * @param b
 * @returns {number}
 */
function numericSort(a, b) {
    if (lessThan(a, b)) {
        return -1;
    }
    if (greaterThan(a, b)) {
        return 1;
    }
    return 0;
}
