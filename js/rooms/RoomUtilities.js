/** A function for comparing based on privacy for sorting
 *
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

function compareTotalArea(a, b) {
    if (a.totalArea < b.totalArea) {
        return -1;
    }
    if (a.totalArea > b.totalArea) {
        return 1;
    }
    return 0;
}

function compareArea(a, b) {
    if (a.area < b.area) {
        return -1;
    }
    if (a.area > b.area) {
        return 1;
    }
    return 0;
}
