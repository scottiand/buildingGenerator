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
