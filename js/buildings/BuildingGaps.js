
/**
 * Fills the gaps in the building.
 * Gives up after 100 tries.
 */
Building.prototype.fillGaps = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    for (var i = 0; i < 100; i++) {
        //console.log('fillGaps');
        // context.fillStyle = 'rgb(255,255,255)';
        // context.fillRect(0,0, this.plot.width * scale, this.plot.height.scale);
        // this.drawRooms(context);
        if (!this.findGap(floor)) break;
    }
};

/**
 * Finds and fills gaps in the plot
 * @returns {boolean}
 */
Building.prototype.findGap = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    var foundGap = false;
    var filledGap = false;
    var edges = this.getOutsideEdges(floor);
    //console.log(edges.length);
    for (var i = 0; i < 4; i++) {
        var direction = directions[i];
        var oppositeDirection = getOppositeDirection(direction);
        var thisSideEdges = [];
        for (var j = 0; j < edges.length; j++) {
            if (edges[j].directionOfRoom === oppositeDirection) thisSideEdges.push(edges[j]);
        }
        //console.log(thisSideEdges.length);
        for (var j = 0; j < thisSideEdges.length; j++) {
            var edge = thisSideEdges[j];
            var space = edge.getSpace(this.plot);
            var intersectingRooms = this.getIntersectingRooms(space, floor);
            sortByGivenSide(intersectingRooms, oppositeDirection);
            if (direction === 'north' || direction === 'west') intersectingRooms.reverse();
            if (intersectingRooms.length > 0) {
                var closestRoom = intersectingRooms[0];
                var gap = new Line1D(edge.location, closestRoom.getSide(oppositeDirection));
                gap.makeStartLowerThanEnd();
                var rect;
                switch (direction) {
                    case 'north':
                    case 'south':
                        rect = new Rectangle(Math.min(edge.line.x1, edge.line.x2), gap.start, edge.line.length, gap.length);
                        break;
                    case 'east':
                    case 'west':
                        rect = new Rectangle(gap.start, Math.min(edge.line.y1, edge.line.y2), gap.length, edge.line.length);
                        break;
                }
                //spit(rect);
                if (this.rectangleIsClosed(rect, 1, floor)) {
                    //if (this.rectangleIsClosed(rect, 0, floor)) foundGap = true;
                    this.fillGap(rect, floor);
                    filledGap = true;
                    break;
                }
            }
        }
        if (filledGap) break;
    }
    return filledGap;
};

/**
 * Returns true if the number of open sides is less than or equal to the given number.
 * Open, in the case, means there are no rooms that contact that side of the rectangle.s
 * Always true if number is 4 or greater
 * @param rect The rectangle to check
 * @param number The number of sides allowed to be open, usually 0 or 1
 * @param floor Only considers rooms on the given floor
 * @returns {boolean}
 */
Building.prototype.rectangleIsClosed = function (rect, number, floor) {
    var openSides = 0;
    for (var i = 0; i < 4; i++) {
        //console.log('here');
        var direction = directions[i];
        var touchingSide = false;
        for (var j = 0; j < this.allRooms.length; j++) {
            var room = this.allRooms.get(j);
            var dummy = dummyRoom(rect.left, rect.top, rect.width, rect.height);
            var overlap = getOverlap(room, dummy,direction);
            if (room.floor === floor && equals(room.getSide(getOppositeDirection(direction)), rect.getSide(direction)) && overlap.length > 0) {
                touchingSide = true;
                break;
            }
        }
        if (touchingSide === false) {
            openSides++;
        }
    }
    //console.log(false);
    return openSides <= number;
};

/**
 * Fills the given gap by expanding or adding rooms
 * @param rect
 */
Building.prototype.fillGap = function(rect, floor) {

    if (typeof(floor) === 'undefined') floor = 1;
    if (rect.height < 1 || rect.width < 1) {
        if (!this.tryToStretchRoomToFillGap(rect)) {
            // Create a filler room in the empty space
            this.push(wallRoom(rect.left, rect.top, rect.width, rect.height, floor));
        }
    } else if (rect.height < 4 || rect.width < 4) {
        if (rect.width >= 3 || rect.height >=3) { // Only add a closet if a door can fit
            // Make some closets
            this.fillSmallGaps(this, rect, floor);
        } else {
            if (!this.tryToStretchRoomToFillGap(rect)) {
                // Create a filler room in the empty space
                this.push(wallRoom(rect.left, rect.top, rect.width, rect.height, floor));
            }
        }
    } else {

        if (this.rectangleIsClosed(rect, 0, floor)) {
            this.fillRectWithRoom(rect, floor);
        }
    }

};

/**
 * Files the given rect with the next possible room in the proto rooms list.
 * @param rect
 */
Building.prototype.fillRectWithRoom = function(rect, floor) {
    this.protoRooms.sort(comparePriority);
    spit('   begin fillRectWithRoom');
    spit(this.allRooms.length);
    var current = 0;
    var room = new Room(this.protoRooms[0]);
    while (room.proto.minSize >= rect.width && room.proto.minSize >= rect.height) {
        //console.log(current);
        current++;
        if (this.protoRooms.length > current) {
            room = new Room(this.protoRooms[current]);
        } else {
            return;//throw('Couldnt find room to put in gap' );
        }
    }
    room.floor = floor;
    room.setLocation(rect.left, rect.top);
    var newWidth = room.width;
    var newHeight = room.height;
    if (rect.width <= room.proto.maxSize) newWidth = rect.width;
    if (rect.height <= room.proto.maxSize) newHeight = rect.height;
    room.setSize(newWidth, newHeight);
    this.protoRooms[current].priority += this.protoRooms[current].delay;
    spit(room.toString());

    this.push(room);
    room.isPlaced = true;

    var connectedRooms = room.getContactingRooms(this);
    var candidates = [];
    for (var i = 0; i < connectedRooms.length; i++) {
        var roomToConnect = connectedRooms[i];
        var direction = roomToConnect.getDirectionFrom(room);
        var overlap = getOverlap(room, roomToConnect, direction);
        if (overlap.length >= 3) {
            var score = roomToConnect.privacy;
            if (roomToConnect.purpose === 'storage') score += 1000;
            if (roomToConnect.purpose === 'bathroom') score += 50;
            if (hasPurpose(roomToConnect.adjacent, 'storage')) score -= 50;
            score += roomToConnect.doorCount() * 10;
            candidates.push({room: roomToConnect, score: score});
        }
    }
    if (candidates.length > 0) {
        candidates.sort(compareScore);
        var choice = candidates[0].room;
        var newDoor = new Door(choice, room,  choice.getDirectionFrom(room));
        this.doors.push(newDoor);
        choice.connect(room);
        //console.log(room);
    }
};

/**
 * Attempts to stretch a nearby room to fill the gap defined by rect
 * @param rect
 * @returns {boolean}
 */
Building.prototype.tryToStretchRoomToFillGap = function (rect) {
    for (var i = 0; i < 4; i++) {
        var direction = directions[i];
        var oppositeDirection = getOppositeDirection(direction);
        for (var j = 0; j < this.allRooms.length; j++) {
            var room = this.allRooms.get(j);
            if (equals(room.getSide(oppositeDirection), rect.getSide(direction))) {
                var overlap = getOverlap(room, dummyRoom(rect.left, rect.top, rect.width, rect.height), direction);
                // console.log(room);
                // console.log(room.bottom());
                // console.log(direction);
                // console.log(overlap);
                // console.log(rect);
                switch (direction) {
                    case 'north':
                    case 'south':
                        if (equals(overlap.length, room.width)) {
                            room.stretch(rect.getSide(oppositeDirection),oppositeDirection, true);
                            return true;
                        }
                        break;
                    case 'east':
                    case 'west':
                        if (equals(overlap.length, room.height)) {
                            room.stretch(rect.getSide(oppositeDirection),oppositeDirection, true);
                            return true;
                        }
                        break;
                    default:
                        throw("invalid direction: " + direction);
                }

                // if (room.getSide(getNextDirection(direction)) === rect.getSide(getNextDirection(direction)) && room.getSide(getNextDirection(direction, false)) === rect.getSide(getNextDirection(direction, false))) {
                //     room.stretch(rect.getSide(oppositeDirection),oppositeDirection, true);
                //     return true;
                // }
            }
        }
    }
    return false;
};
