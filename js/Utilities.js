var directions = ['north', 'east', 'south', 'west'];

/**
 * Returns true if a number is not equal to zero
 * @param number
 * @returns {boolean}
 */
function nonZero(number) {
    return number != 0;
}

/**
 * Generates tries number of buildings without drawing, and logs the average number of failures
 * @param tries
 */
function testRun(tries) {
    var failure = 0;
    for (var i = 0; i < tries; i++) {
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
            list.reverse();
            break;
        case 'west':
            list.sort(compareY);
            break;
        default:
            throw("invalid direction: " + direction);
    }
}

function compareX (a, b) {
    if (a.x < b.x) {
        return -1;
    }
    if (a.x > b.x) {
        return 1;
    }
    return 0;
}

function compareY (a, b) {
    if (a.y < b.y) {
        return -1;
    }
    if (a.y > b.y) {
        return 1;
    }
    return 0;
}




