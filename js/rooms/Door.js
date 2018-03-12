// Scotti Anderson
// Door
// A door between two rooms

var CHANCE_TO_REMOVE_WALL = 25;
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
    this.setLocation();
}

/**
 * Sets the door's location to a random spot within the allotted space
 */
Door.prototype.setLocation = function() {
    var overlap = getOverlap(this.room1, this.room2, this.direction);
    var spot = (overlap.start + overlap.end) / 2;
    if (overlap.start > overlap.end) {console.log("Ohhhhh nooooooo")}
    if (overlap.length >= 3) {
        // if (percentChance(CHANCE_TO_REMOVE_WALL) && Math.max(this.room1.privacy, this.room2.privacy) <= 50) {
        //     this.size = overlap.length / 2;
        //     this.setExactLocation(spot, this.direction);
        //     return;
        // }
        placement = Infinity;
        while (placement < (1.5 + overlap.start) || placement > (overlap.end - 1.5)) {
            var placement = randGauss(spot, overlap.length / 6);
        }
        this.setExactLocation(placement, this.direction);
        this.size = 2;
    } else {
        throw("Could not place door between " + this.room1.name + " and " + this.room2.name + ".");
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
            if (this.room1.locY === this.room2.bottom()) {
                this.y = this.room1.locY;
                this.room1.addDoor(this, 'north');
                this.room2.addDoor(this, 'south');
            } else {
                this.y = this.room2.locY;
                this.room1.addDoor(this, 'south');
                this.room2.addDoor(this, 'north');
            }
            break;
        case 'east':
        case 'west':
            this.y = placement;
            if (this.room1.locX === this.room2.right()) {
                this.x = this.room1.locX;
                this.room1.addDoor(this, 'west');
                this.room2.addDoor(this, 'east');
            } else {
                this.x = this.room2.locX;
                this.room1.addDoor(this, 'east');
                this.room2.addDoor(this, 'west');
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
 * @param direction
 * @constructor
 */
function OutsideDoor(room, direction) {
    this.room1 = room;
    this.room2 = null;
    this.x = 0;// The location of the center of the door
    this.y = 0;
    this.size = 0;
    this.direction = direction;
    this.setLocation();
}

/**
 * Sets the door's location to a random spot within the allotted space
 */
OutsideDoor.prototype.setLocation = function() {
    var space = new Line1D(this.room1.getSide(getNextDirection(this.direction, false)), this.room1.getSide(getNextDirection(this.direction)));
    if (space.length >= 3) {
        var spot = (space.start + space.end) / 2;
        placement = Infinity;
        //while (placement < (1.5 + space.start) || placement > (space.end - 1.5)) {
            var placement = randGauss(spot, space.length / 6);
        //}
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
    console.log(this);
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

function addOutsideDoor(edge) {
    var room = edge.room;
    console.log(room);
    var direction = getOppositeDirection(edge.directionOfRoom);
    currentBuilding.doors.push(new OutsideDoor(room, direction));

}
