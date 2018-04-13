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

/**
 * From a given list of doors, returns the door that is farthest in the given direction
 * @param doorList
 * @param direction
 * @returns {*}
 */
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

/**
 * Sorts the given list of rooms by the position of the given side
 * @param list
 * @param direction
 */
function sortByGivenSide(list, direction) {
    switch (direction) {
        case 'north':
            list.sort(compareLocY);
            //list.reverse();
            break;
        case 'south':
            list.sort(compareBottom);
            break;
        case 'east':
            list.sort(compareRight);
            break;
        case 'west':
            list.sort(compareLocX);
            //list.reverse();
            break;
        default:
            throw("invalid direction: " + direction);
    }
}

/**
 * A function for comparing based on locX for sorting
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
function compareLocX(a, b) {
    if (a.locX < b.locX) {
        return -1;
    }
    if (a.locX > b.locX) {
        return 1;
    }
    return 0;
}

/**
 * A function for comparing based on locY for sorting
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
function compareLocY(a, b) {
    if (a.locY < b.locY) {
        return -1;
    }
    if (a.locY > b.locY) {
        return 1;
    }
    return 0;
}

/**
 * A function for comparing based on right() for sorting
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
function compareRight(a, b) {
    if (a.right() < b.right()) {
        return -1;
    }
    if (a.right() > b.right()) {
        return 1;
    }
    return 0;
}

/**
 * A function for comparing based on bottom() for sorting
 * @param a
 * @param b
 * @returns {number}
 * @constructor
 */
function compareBottom(a, b) {
    if (a.bottom() < b.bottom()) {
        return -1;
    }
    if (a.bottom() > b.bottom()) {
        return 1;
    }
    return 0;
}

/**
 * Returns true if the given array of rooms has any rooms of the given purpose
 * @param list
 * @param purpose
 * @returns {boolean}
 */
function hasPurpose(list, purpose) {
    for (var i = 0; i< list.length; i++) {
        if (list[i].purpose === purpose) return true;
    }
    return false;
}

/**
 * Returns the number of rooms in the list with the given purpose
 * @param list
 * @param purpose
 * @returns {number}
 */
function purposeCount(list, purpose) {
    var count = 0;
    for (var i = 0; i< list.length; i++) {
        if (list[i].purpose === purpose) count++;
    }
    return count;
}

/**
 * Returns a dummy room not meant to be placed in a house, but instead used for other types of calculations
 * @param x
 * @param y
 * @param width
 * @param height
 * @returns {Room}
 */
function dummyRoom(x, y, width, height) {
    var room = new Room(new ProtoRoom(dummy));
    room.setLocation(x,y);
    room.setSize(width, height);
    return room;
}

/**
 * Returns a room that has a special draw function, so that it is filled in black like a wall.
 * @param x
 * @param y
 * @param width
 * @param height
 * @returns {Room}
 */
function wallRoom(x, y, width, height, floor) {
    if (typeof(floor) === "undefined") floor = 1;
    var newRoom = dummyRoom(x, y, width, height);
    newRoom.draw = function (context) {
        context.strokeStyle = 'rgb(0, 0, 0)';
        //context.moveTo(this.locX * scale, this.locY * scale);
        context.rect(this.locX * scale, this.locY * scale, this.width * scale, this.height * scale);
        context.fillRect(this.locX * scale, this.locY * scale, this.width * scale, this.height * scale);
        context.stroke();
    };
    newRoom.name = '';
    newRoom.purpose = 'wall';
    newRoom.floor = floor;
    return newRoom;
}

/**
 * Creates a new stairwell
 * If values are given for all parameters, the room will be forced to have those parameters.
 * Otherwise, values are generated as normal
 * @param x
 * @param y
 * @param width
 * @param height
 * @returns {Room}
 */
function stairwellRoom(x, y, width, height) {
    var newRoom = new Room(new ProtoRoom(stairwell));
    if (typeof(x) !== 'undefined' && typeof(x) !== 'undefined' && typeof(x) !== 'undefined' && typeof(x) !== 'undefined') {
        newRoom.setLocation(x, y);
        newRoom.setSize(width, height);
    }
    // Make stairs and edit draw function
    return newRoom;
}

function hallwayToStairwell(hallway) {
    var newRoom = stairwellRoom(hallway.locX, hallway.locY, hallway.width, hallway.height);

    newRoom.northDoors = hallway.northDoors;
    newRoom.southDoors = hallway.southDoors;
    newRoom.eastDoors = hallway.eastDoors;
    newRoom.westDoors = hallway.westDoors;
    newRoom.floor = hallway.floor;
    newRoom.adjacent = hallway.adjacent;
    newRoom.parent = hallway.parent;
    newRoom.isPlaced = hallway.isPlaced;
    console.log(newRoom);
    return newRoom;
}

/**
 * A function for comparing rooms based on the number of doors
 * @param a
 * @param b
 * @returns {number}
 */
function compareNumberOfDoors(a, b) {
    if (a.doorCount() < b.doorCount()) {
        return -1;
    }
    if (a.doorCount() > b.doorCount()) {
        return 1;
    }
    return 0;
}
