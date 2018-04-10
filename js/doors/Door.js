// Scotti Anderson
// Door
// A door between two rooms

var CHANCE_TO_REMOVE_WALL = 20;
var MIN_PRIVACY_TO_REMOVE_WALL = 50;

/**
 * Creates a door between two rooms, in the given direction
 * @param room1
 * @param room2
 * @param direction 'north' or 'south' creates a horizontal door while 'east' or 'west' creates a vertical door
 * @constructor
 */
function Door(room1, room2, direction) {
    this.room1 = room1;
    this.room2 = room2;
    this.x = 0;// The location of the center of the door
    this.y = 0;
    this.size = 0;
    this.direction = direction;
    this.privacy = Math.max(this.room1.privacy, this.room2.privacy);
    this.overlap;
    this.removalChance = CHANCE_TO_REMOVE_WALL;

    this.setLocation();

    this.doorTypes = [smallDoor, singleDoor, doubleDoor];
    this.doorType = smallDoor;
    this.expanded = false;

}

/**
 * Sets the door's location to a random spot within the allotted space
 */
Door.prototype.setLocation = function() {
    var overlap = this.calcOverlap();
    var spot = (overlap.start + overlap.end) / 2;
    if (overlap.start > overlap.end) {console.log("Ohhhhh nooooooo")}
    if (equals(overlap.length, 3)) {
        placement = spot;
        this.setExactLocation(placement, this.direction);
        this.addDoorToRooms(this.direction);
        this.size = 2;
    } else if (overlap.length >= 3) {
        this.overlap = overlap;
        placement = Infinity;
        while (placement < (1.5 + overlap.start) || placement > (overlap.end - 1.5)) {
            var placement = randGauss(spot, overlap.length / 6);
        }
        this.setExactLocation(placement, this.direction);
        this.addDoorToRooms(this.direction);
        this.size = 2;
    } else {
        console.log(this.room1);
        console.log(this.room2);
        currentBuilding.drawRooms(context);
        throw("Could not place door between " + this.room1.name + " and " + this.room2.name + ".");
    }
    console.log(this.size);
};

Door.prototype.addDoorToRooms = function(direction) {
    switch (direction) {
        case 'north':
        case 'south':
            if (equals(this.room1.locY, this.room2.bottom())) {
                this.room1.addDoor(this, 'north');
                this.room2.addDoor(this, 'south');
            } else {
                this.room1.addDoor(this, 'south');
                this.room2.addDoor(this, 'north');
            }
            break;
        case 'east':
        case 'west':
            if (equals(this.room1.locX, this.room2.right())) {
                this.room1.addDoor(this, 'west');
                this.room2.addDoor(this, 'east');
            } else {
                this.room1.addDoor(this, 'east');
                this.room2.addDoor(this, 'west');
            }
            break;
        default:
            throw("invalid direction: " + direction);
    }
};

/**
 * Sets the x and y location of the door depending on the direction
 * @param placement
 * @param direction
 */
Door.prototype.setExactLocation = function (placement, direction) {
    switch (direction) {
        case 'north':
        case 'south':
            this.x = placement;
            if (equals(this.room1.locY, this.room2.bottom())) {
                this.y = this.room1.locY;
            } else {
                this.y = this.room2.locY;
            }
            break;
        case 'east':
        case 'west':
            this.y = placement;
            if (equals(this.room1.locX, this.room2.right())) {
                this.x = this.room1.locX;
            } else {
                this.x = this.room2.locX;
            }
            break;
        default:
            throw("invalid direction: " + direction);
    }
};

/**
 * Draws the door in the given context
 * @param context
 */
Door.prototype.draw = function(context) {
    context.strokeStyle = "rgb(0,0,0)";
    context.fillStyle = "rgb(255,255,255)";
    switch (this.direction) {
        case 'north':
        case 'south':
            context.fillRect((this.x - (this.size / 2)) * scale, (this.y - 0.2) * scale, this.size * scale, 0.4 * scale);
            break;
        case 'east':
        case 'west':
            context.fillRect((this.x - 0.2) * scale, (this.y - (this.size / 2)) * scale, 0.4 * scale, this.size * scale)
            break;
        default:
            throw("invalid direction: " + this.direction);
    }
};

/**
 * Returns the endpoint of the door (right or bottom side, depending on the orientation)
 * @returns {*}
 */
Door.prototype.end = function () {
    switch (this.direction) {
        case 'north':
        case 'south':
            return this.x + this.size;
        case 'east':
        case 'west':
            return this.y + this.size;
        default:
            throw("invalid direction: " + this.direction);
    }
};

/**
 * Returns the point that the door ends at
 */
Door.prototype.endPoint = function () {
    return DoorEndPoint(this);
};

/**
 * Returns the point that the door starts at
 */
Door.prototype.startPoint = function() {
    return DoorStartPoint(this);
};

/**
 * Calls the expand function with this door as a parameter
 */
Door.prototype.expand = function () {
  expand(this);
};

/**
 * Returns true if there is enough space to place the given type of door
 * @param current
 * @param door
 * @returns {boolean}
 */
function doorFits(current, door) {
    var halfSize = current.size / 2;
    var placement;
    switch (door.direction) {
        case 'north':
        case 'south':
            placement = door.x;
            break;
        case 'east':
        case 'west':
            placement = door.y;
            break;
        default:
            throw("invalid direction: " + door.direction);
    }
    var overlap = door.overlap;
    var extraSpace = Math.min(placement - overlap.start, overlap.end - placement) - 0.5;
    return halfSize <= extraSpace;
}

/**
 * Calculates the shared space between the
 * @returns {Line1D}
 */
Door.prototype.calcOverlap = function() {
    console.log(currentBuilding.allRooms);
    return getOverlap(this.room1, this.room2, this.direction);
};

Door.prototype.toString = function () {
    return this.size;
};

Door.prototype.delete = function() {
    this.room1.removeDoor(this);
    this.room2.removeDoor(this);
};

/**
 * Takes a default door and randomly assigns a door from the door's DoorType list
 * Can also eliminate walls in less private areas
 * @param door
 */
function expand(door) {
    if (door.expanded) return;
    door.overlap = door.calcOverlap();
    if (percentChance(door.removalChance) && door.privacy <= 50) {
        takeDownWall(door);
        return;
    }
    var validDoors = [];
    for (var i = 0; i < door.doorTypes.length; i++) {
        var current = door.doorTypes[i];
        if (current.privacy >= door.privacy && doorFits(current, door)) validDoors.push(current);
    }
    if (validDoors.length > 0) {
        door.doorType = validDoors[randInt(validDoors.length)];
        //console.log(door.doorType);
        door.size = door.doorType.size;
    }

    door.expanded = true;
}

/**
 * Sets the door's length to the total overlap between the two rooms.
 * @param door
 */
function takeDownWall(door) {
    door.size = door.overlap.length;
    door.setExactLocation((door.overlap.start + door.overlap.end) / 2, door.direction);
}

function DoorEndPoint(door) {
    switch (door.direction) {
        case 'north':
        case 'south':
            return {x: door.x + (door.size / 2), y: door.y};
        case 'east':
        case 'west':
            return {x: door.x, y: door.y + (door.size / 2)};
        default:
            throw("invalid direction: " + door.direction);
    }
}
function DoorStartPoint(door) {
    switch (door.direction) {
        case 'north':
        case 'south':
            return {x: door.x - (door.size / 2), y: door.y};
        case 'east':
        case 'west':
            return {x: door.x, y: door.y - (door.size / 2)};
        default:
            throw("invalid direction: " + door.direction);
    }
}

/**
 * Creates a new door to the outside at on the given side of the given room
 * @param room
 * @param edge
 * @param direction
 * @constructor
 */
function OutsideDoor(room, edge, direction) {
    this.room1 = room;
    this.edge = edge;
    this.room2 = null;
    this.x = 0;// The location of the center of the door
    this.y = 0;
    this.size = 0;
    this.direction = direction;
    this.privacy = 0;
    this.removalChance = 0;
    this.setLocation();
    this.doorTypes = [singleDoor, singleDoorSideLight, singleDoorDoubleSidelight, doubleDoor];
    this.doorType = singleDoor;
}

/**
 * Sets the door's location to a random spot within the allotted space
 */
OutsideDoor.prototype.setLocation = function() {
    //var space = new Line1D(this.room1.getSide(getNextDirection(this.direction, false)), this.room1.getSide(getNextDirection(this.direction)));
   var space = this.calcOverlap();
   //console.log("Outside Door");
   //console.log(space);
    if (space.length >= 3) {
        this.overlap = space;
        var spot = (space.start + space.end) / 2;
        placement = Infinity;
        while (placement < (1.5 + space.start) || placement > (space.end - 1.5)) {
            var placement = randGauss(spot, space.length / 6);
        }
        this.setExactLocation(placement, this.direction);
        this.size = 2;
    }
};

/**
 * Sets the x and y location of the door depending on the direction
 * @param placement
 * @param direction
 */
OutsideDoor.prototype.setExactLocation = function(placement, direction) {
    switch (direction) {
        case 'north':
        case 'south':
            this.x = placement;
            this.y = this.room1.getSide(direction);
            break;
        case 'east':
        case 'west':
            this.y = placement;
            this.x = this.room1.getSide(direction);
            break;
        default:
            throw("invalid direction: " + direction);
    }
    //console.log(this);
    this.room1.addDoor(this, direction);
};

/**
 * Returns the point that the door starts at
 */
OutsideDoor.prototype.startPoint = function() {
    return DoorStartPoint(this);
};

/**
 * Returns the point that the door ends at
 */
OutsideDoor.prototype.endPoint = function () {
    return DoorEndPoint(this);
};

/**
 * Calls the expand function with this door as a parameter
 */
OutsideDoor.prototype.expand = function() {
    expand(this);
};

/**
 * Returns a Line1D that represents the available space on the outside edge of the room
 * @returns {*}
 */
OutsideDoor.prototype.calcOverlap = function () {
  return this.edge.getLine1D();
};

function addOutsideDoor(edge) {
    var room = edge.room;
    //console.log(room);
    var direction = getOppositeDirection(edge.directionOfRoom);
    currentBuilding.doors.push(new OutsideDoor(room, edge, direction));

}
