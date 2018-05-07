/*
The Room structure represents individual rooms that can be placed into a building.s
 */

/**
 * Generates a room based on a given room proto, with randomized size
 * name: How the room will be labeled
 * purpose: the room's funciton in the building
 * privacy: determines the order of placement of rooms
 * priority: determines the order in which the room is placed
 * delay: determines the frequency of this room
 * length: the length of one side of the room
 * width: the width of one side of the rom
 * locX: the horizontal position of the room. -1 means not yet placed
 * locY: the vertical position of the room. -1 means not yet placed
 * adjacent: a list a rooms to connect to this room
 * isPlaced: keeps track of if the room has been placed in space yet
 * @param {ProtoRoom} proto Gives the room attributes based on the RoomType
 */
function Room(proto) {
    if (typeof proto !== 'undefined') {
        this.proto = Object.assign(proto);
        this.name = this.proto.name;
        this.purpose = this.proto.purpose;
        this.privacy = this.proto.privacy;
        this.area = 0;
        this.totalArea = 0;
        this.width = 0;
        this.height = 0;
        this.pointsByDirection = [0, 0, 0, 0]; //[North, East, South, West]
        this.makeRectangle();
        this.locX = -99999;
        this.locY = -99999;
        this.adjacent = [];
        this.parent = null;
        this.isPlaced = false;

        // Doors are kept track of as lists for each side of the room. Use the accessors to get doors
        this.northDoors = [];
        this.southDoors = [];
        this.eastDoors = [];
        this.westDoors = [];

        this.draw = drawRoom;
        this.floor = 1;
    } else {
        throw "no ProtoRoom provided";
    }
}

/**
 * Returns a list of points that represent the corners of a rectangle
 * If a width and height are not given, they are generated randomly
 * @returns {Array} An array of points
 */
Room.prototype.makeRectangle = function (newWidth, newHeight) {
    var corners = [];
    var width = -1;
    var height = -1;
    if (typeof newWidth === 'undefined' || typeof newHeight === 'undefined') {
        while (width < this.proto.minSize || width > this.proto.maxSize) {
            width = randGauss(this.proto.avgSize, this.proto.sizeVariance);
        }
        while (height < this.proto.minSize || height > this.proto.maxSize) {
            height = randGauss(this.proto.avgSize, this.proto.sizeVariance)
        }
    } else {
        width = newWidth;
        height = newHeight;
    }
    this.pointsByDirection = [1, 1, 1, 1];
    this.area = width * height;
    this.width = width;
    this.height = height;
    corners.push({x:0,y:0});
    corners.push({x:width,y:0});
    corners.push({x:width,y:height});
    corners.push({x:0,y:height});
    this.corners = corners;
};

/**
 * Draws the room in the given context
 * @param context context The context in which the room is drawn
 */
function drawRoom(context) {
    context.beginPath();
    context.lineWidth = scale / 3;
    context.strokeStyle = 'rgb(0, 0, 0)';
    context.moveTo(this.locX * scale, this.locY * scale);
    //For each direction: North, east, south, then west
    for (var i = 0; i < 4; i++) {
        var direction = directions[i];
        // Get the list of doors in the given direction
        var doors = this.getDoors(direction);
        // Returns the index of the corner in which the room changes direction
        var cornerNumber = this.getCornerNumber(i + 1);
        // For each door on the current side
        sortByLocationClockwise(doors, direction);
        for (var j = 0; j < doors.length; j++) {
            switch (direction) {
                case 'north':
                case 'east':
                    context.lineTo(doors[j].startPoint().x * scale, doors[j].startPoint().y * scale);
                    context.moveTo(doors[j].endPoint().x * scale, doors[j].endPoint().y * scale);
                    break;
                case 'south':
                case 'west':
                    context.lineTo(doors[j].endPoint().x * scale, doors[j].endPoint().y * scale);
                    context.moveTo(doors[j].startPoint().x * scale, doors[j].startPoint().y * scale);
                    break;
                default:
                    throw("invalid direction: " + this.direction);
            }
        }
        context.lineTo((this.locX + this.corners[cornerNumber].x) * scale, (this.locY + this.corners[cornerNumber].y) * scale);
    }
    context.stroke();
    context.textAlign = 'center';
    if (context.measureText(this.name).width < this.width * scale && this.height * scale > 20) {
        context.fillStyle = 'rgb(0,0,0)';
        context.fillText(this.name, (this.locX + this.width / 2) * scale, (this.locY + this.height / 2) * scale);
    }
}

/**
 * Returns the index of the corner that starts the side of the given number
 * 0 - North
 * 1 - East
 * 2 - South
 * 3 - West
 * The value is put through a mod function such that 5 corresponds to north, 6 to East, and so on
 * @param directionNumber
 * @returns {number}
 */
Room.prototype.getCornerNumber = function(directionNumber) {
    var toReturn = 0;
    directionNumber = directionNumber % 4;
    for (var i = 0; i < directionNumber; i++) {
        toReturn += this.pointsByDirection[i];
    }
    return toReturn;
};

/**
 * Prints all the variables to the console.
 */
Room.prototype.printToConsole = function () {
    console.log("proto: " + this.proto.name + "\n" +
        "locX: " + this.locX + "\n" +
        "locY: " + this.locY + "\n");
};

/**
 * Adds a room to the adjacent list of this room
 * @param {Room} room the room to connect
 */
Room.prototype.connect = function (room) {
    room.parent = this;
    this.adjacent.push(room);
};

/**
 * Adds a list of rooms to the adjacent of this room
 * @param {Array} rooms List of rooms to connect
 */
Room.prototype.connectAll = function (rooms) {
    for (var i = 0; i < rooms.length; i++) {
        this.connect(rooms[i]);
    }
};

/**
 * Sets the location to the given x and y values
 * @param x Value to set LocX to
 * @param y Value to set LocY to
 */
Room.prototype.setLocation = function (x, y) {
    this.locY = y;
    this.locX = x;
};

/**
 * Calculates the area of this room and all rooms it's connected to, excluding rooms given as a paremeter
 * @param usedRooms list of rooms to exclude
 * @returns {number} The area of this room and rooms that connect to it
 */
Room.prototype.calcTotalArea = function(usedRooms) {
    var toReturn = this.area;
    //console.log(this.name);
    //console.log(this.area);
    usedRooms.push(this);
    for (var i = 0; i < this.adjacent.length; i++) {
        var nextRoom = this.adjacent[i];
        //console.log(nextRoom);
        if (!usedRooms.includes(nextRoom)) {
            toReturn += nextRoom.calcTotalArea(usedRooms.slice());
            //console.log("here");
        }
    }
    this.totalArea = toReturn;
    return toReturn;
};

/**
 * Returns the area of the intersection between the given rectangle and the room
 * @param rectangle A rectangle of the the form: {right: *, left: *, top: *, bottom: *, area: *}
 * @param floor The floors to check, defaults to this.floor
 * If this.floor != floor, returns 0
 * @returns {number} the area of the intersecting space
 */
Room.prototype.intersection = function (rectangle, floor) {
    if (typeof(floor) === 'undefined') floor = this.floor;
    if (floor !== this.floor) return 0;
    if (this.locX < -9999 || this.locY < -9999) return 0;
    var right = this.right();
    var bottom = this.bottom();
    var top = this.locY;
    var left = this.locX;

    var xOverlap = Math.max(0, Math.min(rectangle.right, right) - Math.max(rectangle.left, left));
    var yOverlap = Math.max(0, Math.min(rectangle.bottom, bottom) - Math.max(rectangle.top, top));
    if (lessThanEqual(xOverlap, 0) || lessThanEqual(yOverlap, 0)) {
        return 0;
    }
    return xOverlap * yOverlap;
};

/**
 * Returns true if the room contains the given point
 * Includes the edges of the rooms
 * @param x
 * @param y
 * @returns {boolean}
 */
Room.prototype.containsPoint = function (x, y) {
    return (x >= this.locX && x <= this.right() && y >= this.locY && y <= this.bottom());
};

/**
 * Rotates the room by 90 degrees
 */
Room.prototype.rotate = function () {
    this.makeRectangle(this.height, this.width);
};

/**
 * Prints out the room and all of it's descendants to the console
 */
Room.prototype.printTree = function(string) {
    var tab = typeof string !== 'string' ? "" : string;
    console.log(tab + this.name);
    for (var i = 0; i < this.adjacent.length; i++) {
        var current = this.adjacent[i];
        current.printTree(tab + "   ");
    }
};

/**
 * Sets the new size for the room
 * @param width New width
 * @param height New Height
 */
Room.prototype.setSize = function(width, height) {
    this.makeRectangle(width, height);
};

/**
 * Returns true if there is at least one door in the given direction
 * @param direction
 * @returns {boolean}
 */
Room.prototype.hasDoor = function(direction) {
    switch (direction) {
        case 'north':
            return this.northDoors.length > 0;
        case 'south':
            return this.southDoors.length > 0;
        case 'east':
            return this.eastDoors.length > 0;
        case 'west':
            return this.westDoors.length > 0;
        default:
            throw("invalid direction: " + this.direction);
    }
};

/**
 * Adds a door to this room in the given direction
 * @param door
 * @param direction
 */
Room.prototype.addDoor = function (door, direction) {
    switch (direction) {
        case 'north':
            this.northDoors.push(door);
            break;
        case 'south':
            this.southDoors.push(door);
            break;
        case 'east':
            this.eastDoors.push(door);
            break;
        case 'west':
            this.westDoors.push(door);
            break;
        default:
            throw("invalid direction: " + this.direction);
    }
};

/**
 * Returns the location of the right side of the room
 * @returns {number}
 */
Room.prototype.right = function() {
    return this.locX + this.width;
};

/**
 * Returns the location of the bottom side of the room
 * @returns {number}
 */
Room.prototype.bottom = function () {
    return this.locY + this.height;
};

/**
 * Returns a list of doors in the given direction
 * If not direction is given, returns all doors
 * @param direction
 * @returns {Array}
 */
Room.prototype.getDoors = function(direction) {
    if (typeof direction === 'undefined') {
        var list = [];
        for (var i = 0; i < 4; i++) {
            list = list.concat(this.getDoors(directions[i]));
        }
        return list;
    } else {
        switch (direction) {
            case 'north':
                return this.northDoors;
            case 'south':
                return this.southDoors;
            case 'east':
                return this.eastDoors;
            case 'west':
                return this.westDoors;
            default:
                throw("invalid direction: " + this.direction);
        }
    }
};

/**
 * Returns the location of the side of this room in the given direction
 * @param direction
 * @returns {number}
 */
Room.prototype.getSide = function (direction) {
    switch (direction) {
        case 'north':
            return this.locY;
        case 'south':
            return this.bottom();
        case 'east':
            return this.right();
        case 'west':
            return this.locX;
        default:
            throw("invalid direction: " + direction);
    }
};

/**
 * Stretches the room in the given direction to the given location, if possible
 * @param spot
 * @param direction
 * @param force If true, stretches even if it would extend past it's max or min size
 */
Room.prototype.stretch = function (spot, direction, force) {
    if (typeof(force) === 'undefined') force = false;
    var newHeight;
    var newWidth;
    var newX;
    var newY;
    switch (direction) {
        case 'north':
            var distance = this.locY - spot;
            newWidth = this.width;
            newHeight = this.height + distance;
            newX = this.locX;
            newY = spot;
            break;
        case 'south':
            newWidth = this.width;
            newHeight = spot - this.locY;
            newX = this.locX;
            newY = this.locY;
            break;
        case 'east':
            newWidth = spot - this.locX;
            newHeight = this.height;
            newX = this.locX;
            newY = this.locY;
            break;
        case 'west':
            var distance = this.locX - spot;
            newWidth = this.width + distance;
            newHeight = this.height;
            newX = spot;
            newY = this.locY;
            break;
        default:
            throw("invalid direction: " + direction);
    }
    if (!this.isValidSize(newWidth, newHeight) && !force) return;
    this.setLocation(newX, newY);
    this.setSize(newWidth, newHeight);
};

/**
 * Returns true if the new size is within the limits of the room
 * @param newWidth
 * @param newHeight
 * @returns {boolean}
 */
Room.prototype.isValidSize = function(newWidth, newHeight){
    return (newHeight <= this.proto.maxSize) && (newHeight >= this.proto.minSize) && (newWidth <= this.proto.maxSize) && (newWidth >= this.proto.minSize);
};

/**
 * Returns a list of the sides that contact the edge of the plot
 * @param plot
 * @returns {Array}
 */
Room.prototype.touchingSides = function (plot) {
    var sides = [];
    if (this.locX === 0) sides.push('west');
    if (this.locY === 0) sides.push('north');
    if (equals(this.right(), plot.width)) sides.push('east');
    if (equals(this.bottom(), plot.height)) sides.push('south');
    return sides;
};

/**
 * Returns an array of edges that represent the area that the room touches the outside
 * @param building
 * @param extraRooms A list of rooms to be considered that are not in the house
 * @returns {Array}
 */
Room.prototype.getOutsideEdges = function (building, extraRooms) {
    if (typeof extraRooms === 'undefined') extraRooms = new RoomList();
    var list = [];
    //console.log(this.name);
    for (var i = 0; i < 4; i++) {
        var direction = directions[i];
        var lines = [new Line1D(this.getSide(getNextDirection(direction)), this.getSide(getNextDirection(direction, false)))];
        var contactingRooms = this.getContactingRooms(building, direction, extraRooms);
        for (var j = 0; j < contactingRooms.length; j++) {
            var room = contactingRooms[j];
            for (var k = 0; k < lines.length; k++) {
                var split = lines[k].split(new Line1D(room.getSide(getNextDirection(direction, false)), room.getSide(getNextDirection(direction))));
                if (split.line1 != null) {
                    lines[k] = split.line1;
                } else {
                    lines[k] = new Line1D(0, 0);
                }
                if (split.line2 != null) lines.push(split.line2);
            }
        }
        lines = lines.filter(function (value) { return value.length > 0 });
        for (var j = 0; j < lines.length; j++) {
            var edge = new Edge(lines[j].to2DRoomEdge(this, direction), this);
            //&& !equals(edge.line.length, 0)
            if (!edge.contacts(building.plot) && !equals(edge.line.length, 0)) list.push(edge);
        }
    }
    return list;
};

/**
 * Returns a list or rooms that contact this one on the given side
 * @param building
 * @param direction 'north', 'south', 'east', or 'west'
 * @param extraRooms A list of rooms to be considered that are not in the house
 * @returns {Array}
 */
Room.prototype.getContactingRooms = function(building, direction, extraRooms) {
    if (typeof extraRooms === 'undefined') extraRooms = new RoomList();
    var list = [];
    if (typeof(direction) === 'undefined') {
        for (var i = 0; i < 4; i++) {
            list = list.concat(this.getContactingRooms(building, directions[i]));
        }
    } else {
        var possibleRooms = building.getIntersectingRooms(this.getSpace(building.plot, direction), this.floor);
        for (var i = 0; i < extraRooms.length; i++) {
            if (extraRooms.get(i).intersection(this.getSpace(building.plot, direction), this.floor)) possibleRooms.push(extraRooms.get(i));
        }
        // find all rooms that contact this one
        for (var j = 0; j < possibleRooms.length; j++) {
            if (equals(possibleRooms[j].getSide(getOppositeDirection(direction)), this.getSide(direction))) list.push(possibleRooms[j]);
        }
    }
    return list;
};

/**
 * Returns a rectangle representing the space in the given direction
 * @param plot The building's plot
 * @param direction 'north', 'south', 'east', or 'west'
 * @returns {Rectangle} A rectangle representing the space in the direction of the given room.
 */
Room.prototype.getSpace = function (plot, direction) {
    switch (direction) {
        case "north":
            return new Rectangle(this.locX, 0, this.width, this.locY);
        case "south":
            return new Rectangle(this.locX, this.locY + this.height, this.width, plot.height);
        case "east":
            return new Rectangle(this.locX + this.width, this.locY, plot.width, this.height);
        case "west":
            return new Rectangle(0, this.locY, this.locX, this.height);
        default:
            throw("invalid direction: " + direction);
    }
};

/**
 * Returns the direction that this room is in compared to the given room.
 * If multiple directions apply, this method prefers the directions in this order: north, east, south, west
 * @param room
 * @returns {string}
 */
Room.prototype.getDirectionFrom = function (room) {
    if (!room.floor === this.floor) {
        console.log('Got direction from room on different floor');
    }
    if (lessThanEqual(this.bottom(), room.locY)) {
        return 'north';
    } else if (greaterThanEqual(this.locX, room.right())) {
        return 'east';
    } else if (greaterThanEqual(this.locY, room.bottom())) {
        return 'south';
    } else if (lessThanEqual(this.right(), room.locX)) {
        return 'west';
    } else {
        if (room.floor === this.floor) {
            throw('Intersecting Rooms! (' + this.name + " and " + room.name + ")");
        }
    }
};

/**
 * Returns the number of doors this room has on a given side
 * If no direction is given, returns the total number of doors
 * @param direction
 * @returns {number}
 */
Room.prototype.doorCount = function(direction) {
    var count = 0;
    if (typeof(direction) === 'undefined') {
        for (var i = 0; i < 4; i++) {
            count += this.doorCount(directions[i]);
        }
    } else {
        count = this.getDoors(direction).length;
    }
    return count;
};

/**
 * Returns a string representation of the room
 * @returns {string}
 */
Room.prototype.toString = function () {
    var parentName;
    if (this.parent === null) {
        parentName = 'null';
    } else {
        parentName = this.parent.name;
    }
    return this.name + " (" + this.floor + ") x:" + this.locX + " y:" +this.locY + " w:" + this.width + " h:" + this.height + " parent: " + parentName + "\n";
};

/**
 * Sets the floor and its descendants to the given value
 * Removes this Room from its current floor in the building
 * @param floor
 * @param building The current building
 */
Room.prototype.elevate = function (floor, building) {
    if (building.getFloor(this.floor).includes(this)) building.getFloor(this.floor).remove(building.getFloor(this.floor).getIndexOf(this));
    this.floor = floor;
    for (var i = 0; i < this.adjacent.length; i++) {
        this.adjacent[i].elevate(floor, building);
    }
};

/**
 * Sets isPlaced for this room and its descendants
 * If set to false, also removes all doors from the rooms, and severs existing connections
 * @param bool
 */
Room.prototype.setPlacedForAll = function (bool) {
    this.isPlaced = bool;
    if (!bool) {
        this.locX = -99999;
        this.locY = -99999;
        this.removeDoors();
    }
    for (var i = 0; i < this.adjacent.length; i++) {
        this.adjacent[i].setPlacedForAll(bool);
    }
};

/**
 * Destroys all doors in the given direction
 * If no direction is given, destroys all doors
 * @param direction
 */
Room.prototype.removeDoors = function(direction) {
    if (typeof(direction) === 'undefined') {
        for (var i = 0; i < 4; i++) {
            direction = directions[i];
            this.removeDoors(direction);
        }
    } else {
        for (var i = 0; i< this.getDoors(direction).length; i++) {
            var door = this.getDoors(direction)[i];
            door.delete();
        }
    }
};

/**
 * Removes the given door from this room
 * @param door
 */
Room.prototype.removeDoor = function (door) {
  for (var i = 0; i < 4; i++) {
      var direction = directions[i];
      var doors = this.getDoors(direction);
      if (doors.includes(door)) {
        doors.splice(doors.indexOf(door), 1);
      }
  }
};

/**
 * Returns true if the given room has a door to this room
 * @param room The room to test
 * @returns {boolean} true if this room is connected to the given room
 */
Room.prototype.hasDoorTo = function (room) {
    var doors = this.getDoors();
    for (var i = 0; i < doors.length; i++) {
        if (doors[i].otherRoom(this) === room) {
            return true;
        }
    }
    return false;
};
