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
    clockwise = typeof clockwise != 'undefined' ? clockwise : true;
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
