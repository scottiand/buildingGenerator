// Scotti Anderson
// Building
// Buildings represent the entire plot and contain functions to generate the floor plan
//

var plotSize = 50;

/**
 * Represents the floor plan of a building as a series of rooms connected and placed in space.
 * @constructor
 */
function Building() {
    this.plot = new Plot(50);
    this.minPlotPortion = this.plot.area * 0.5; // Calculate this based on density at a later date
    this.maxPlotPortion = this.plot.area * 0.7; // Calculate this based on density at a later date
    this.plotSnap = 4;
    this.roomSnap = 8;
    this.area = 0;
    this.roomTypes = [greatRoom,bathroom,bedroom,kitchen,diningRoom]; // Eventually get this from BuildingType
    this.connectivityRules = [bedBathAndBeyondRule, diningAndKitchenRule]; // Eventually get this from BuildingType
    this.connectivityRulesUpstairs = [upstairsBedroomRule]; // Eventually get this from BuildingType
    this.protoRooms = [];

    this.floors = [new RoomList()];

    this.roomList = this.floors[0];

    this.allRooms = new RoomList();
    //this.entry;
    this.doors = [];
    this.draw = true;
    this.doorSpace = 0.5;

    this.maxFloors = 2;
    this.numFloors = 1;
    this.selectedFloor = 1;
}

/**
 * Creates and draws the building
 */
Building.prototype.build = function () {
    //this.addPlot(plotSize);
    canvas.width = this.plot.width * scale;
    canvas.height = this.plot.height * scale;
    this.generateRoomList();
    this.generateConnectivityGraph();
    if (this.placeRooms()) {
        this.addOutsideDoors();
        this.expandDoors();
        //console.log(this.roomList.toString());
        if (this.draw) this.drawRooms(context);
        return true;
    }

    return false;
};

/**
 * Fills the gaps in the building.
 * Gives up after 100 tries.
 */
Building.prototype.fillGaps = function () {
    for (var i = 0; i < 100; i++) {
        //console.log('fillGaps');
        if (!this.findGap()) break;
    }
};

/**
 * Finds and fills gaps in the plot
 * @returns {boolean}
 */
Building.prototype.findGap = function () {
    var foundGap = false;
    var edges = this.getOutsideEdges();
    for (var i = 0; i < 4; i++) {
        var direction = directions[i];
        var oppositeDirection = getOppositeDirection(direction);
        var thisSideEdges = [];
        for (var j = 0; j < edges.length; j++) {
            if (edges[j].directionOfRoom === oppositeDirection) thisSideEdges.push(edges[j]);
        }
        for (var j = 0; j < thisSideEdges.length; j++) {
            var edge = thisSideEdges[j];
            var space = edge.getSpace(this.plot);
            var intersectingRooms = this.getIntersectingRooms(space);
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
                if (this.rectangleIsClosed(rect, 1)) {
                    if (this.rectangleIsClosed(rect, 0)) foundGap = true;
                    this.fillGap(rect);
                }
            }
        }
    }
    return foundGap;
};

/**
 * Returns true if the number of open sides is less than or equal to the given number.
 * Always true if number is 4 or greater
 * @param rect
 * @returns {boolean}
 */
Building.prototype.rectangleIsClosed = function (rect, number) {
    var openSides = 0;
    for (var i = 0; i < 4; i++) {
        //console.log('here');
        var direction = directions[i];
        var touchingSide = false;
        for (var j = 0; j < this.allRooms.length; j++) {
            var room = this.allRooms.get(j);
            // console.log("-----------------------------")
            // console.log(direction);
            // console.log(room.getSide(getOppositeDirection(direction)));
            // console.log(rect.getSide(direction));
            var dummy = dummyRoom(rect.left, rect.top, rect.width, rect.height);
            var overlap = getOverlap(room, dummy,direction);
            //console.log(overlap);
            //console.log(overlap.length);
            if (equals(room.getSide(getOppositeDirection(direction)), rect.getSide(direction)) && overlap.length > 0) {
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
Building.prototype.fillGap = function(rect) {
    if (rect.height < 1 || rect.width < 1) {
        if (!this.tryToStretchRoomToFillGap(rect)) {
            // Create a filler room in the empty space
            this.push(wallRoom(rect.left, rect.top, rect.width, rect.height));
        }
    } else if (rect.height < 4 || rect.width < 4) {
        if (rect.width >= 3 || rect.height >=3) { // Only add a closet if a door ca fit
            // Make some closets
            this.fillGapWithClosets(rect);
        } else {
            if (!this.tryToStretchRoomToFillGap(rect)) {
                // Create a filler room in the empty space
                this.push(wallRoom(rect.left, rect.top, rect.width, rect.height));
            }
        }
    } else {
        if (this.rectangleIsClosed(rect, 0)) {
            this.fillRectWithRoom(rect);
        }
    }

};

/**
 * Files the given rect with the next possible room in the proto rooms list.
 * @param rect
 */
Building.prototype.fillRectWithRoom = function(rect) {
    this.protoRooms.sort(comparePriority);
    var current = 0;
    var room = new Room(this.protoRooms[0]);
    while (room.proto.minSize >= rect.width && room.proto.minSize >= rect.height) {
        current++;
        if (this.protoRooms.length > current) {
            room = new Room(this.protoRooms[current]);
        } else {
            return;//throw('Couldnt find room to put in gap' );
        }
    }
    room.setLocation(rect.left, rect.top);
    var newWidth = room.width;
    var newHeight = room.height;
    if (rect.width <= room.proto.maxSize) newWidth = rect.width;
    if (rect.height <= room.proto.maxSize) newHeight = rect.height;
    room.setSize(newWidth, newHeight);
    this.protoRooms[current].priority += this.protoRooms[current].delay;
    this.push(room);

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
 * Takes a given Rectangle and fill it with closet spaces
 * @param rect
 */
Building.prototype.fillGapWithClosets = function (rect) {

    while (rect.area > 0) {

        // Create a closet room to put into the gap
        var newRoom = new Room(new ProtoRoom(closet));
        newRoom.setLocation(rect.left, rect.top);
        var filledGap = false;

        // If the closet can fill the space, stretch it to fit and move on
        if (rect.width <= newRoom.proto.maxSize) {
            newRoom.stretch(rect.right, 'east', true);
            filledGap = true;
        } else {
            rect = new Rectangle(newRoom.right(), rect.top, rect.width - newRoom.width, rect.height);
        }
        if (rect.height <= newRoom.proto.maxSize) {
            newRoom.stretch(rect.bottom, 'south', true);
            if (filledGap) {
                rect = new Rectangle(0,0,0,0);
            }
        } else {
            rect = new Rectangle(rect.left, newRoom.bottom(), rect.width, rect.height - newRoom.height);
        }
        this.push(newRoom);

        // Select an adjacent room and add a door
        var connectedRooms = newRoom.getContactingRooms(this);
        var candidates = [];
        for (var i = 0; i < connectedRooms.length; i++) {
            var room = connectedRooms[i];
            var direction = room.getDirectionFrom(newRoom);
            var overlap = getOverlap(newRoom, room, direction);
            if (overlap.length >= 3) {
                var score = 0;
                if (room.purpose === 'bedroom') score += 10;
                if (room.purpose === 'kitchen') score += 20;
                if (room.purpose === 'hallway') score += 20;
                if (room.purpose === 'storage') score -= 1000;
                if (room.purpose === 'bathroom') score -= 20;
                if (hasPurpose(room.adjacent, 'storage')) score -= 50;
                score -= room.doorCount() * 10;
                candidates.push({room: room, score: score});
            }
        }

        if (candidates.length > 0) {

            candidates.sort(compareScore);
            candidates.reverse();
            var choice = candidates[0].room;

            var newDoor = new Door(choice, newRoom,  choice.getDirectionFrom(newRoom));

            if (choice.purpose === 'kitchen' || choice.purpose === 'dining') newRoom.name = 'Pantry';
            if (purposeCount(choice.adjacent, 'storage') > 0) { // If a room would gain additional closet, expand that room instead
                //console.log('here');
                newDoor.expanded = true;
                newRoom.name = "";
                newRoom.purpose = choice.purpose;
                if (!(rect.area === 0)) {
                    if (rect.width !== newRoom.width) newRoom.stretch(newRoom.getSide('east') + rect.width, 'east',true);
                    if (rect.height !== newRoom.height) newRoom.stretch(newRoom.getSide('south') + rect.height, 'south',true);
                    rect = new Rectangle(0,0,0,0);
                }
                newDoor.overlap = newDoor.calcOverlap();
                takeDownWall(newDoor);
            }

            this.doors.push(newDoor);
            choice.connect(newRoom);

        }

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

/**
 * Creates a list of rooms to be placed into the building
 */
Building.prototype.generateRoomList = function () {
    this.initializeRoomPrototypes();
    this.addRoomsToList();
    if (this.area > this.maxPlotPortion) {
        this.trimSize();
    }
};

/**
 * Creates the abstract graph that represents the flow of rooms in the building
 */
Building.prototype.generateConnectivityGraph = function () {
    this.performRules(this.connectivityRules);
    this.connectSubtrees();
};

/**
 * Sets the rooms coordinates within the plot
 */
Building.prototype.placeRooms = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    var roomList = this.floors[floor - 1];
    var roomQueue = [];
    // Place the first room
    var firstRoom = roomList.peek();

    this.placeFirstRoom(firstRoom);

    queueRooms(firstRoom, roomQueue);
    var usedRooms = roomQueue.slice();
    usedRooms.push(firstRoom);
    // Sort the rooms by the amount of space their children will require
    for (var i = 0; i< roomQueue.length;i++) {
        var current = roomQueue[i];
        current.calcTotalArea(usedRooms.slice());
    }
    roomQueue.sort(compareTotalArea);
    roomQueue.reverse();
    // Place each room
    //var upstairs = new RoomList();

    while (roomQueue.length !== 0) {
        var current = roomQueue.shift();
        var parent = current.parent;
        var sides = this.getSideSpace(parent);
        sides.sort(compareArea);
        sides.reverse();
        for (var i = 0; i < sides.length; i++) {
            if (this.placeRoom(current, sides[i].direction)) break;
            current.rotate();
            if (this.placeRoom(current, sides[i].direction)) break;
            if (i === 3) {
                // If the room can't be place, try adding another floor
                if (current.height * 0.9 < current.proto.minSize && current.width * 0.9 < current.proto.minSize) {
                    if (!this.addFloor()) return false;
                    this.performRules(this.connectivityRulesUpstairs);
                    var list = this.allRooms.getAllOf('stairwell');
                    for (var j = 0; j < list.length; j++) {
                        if ((!list[j].isPlaced) && list[j].floor === floor) roomQueue.push(list[j]);
                    }
                    var toRemove = [];
                    for (var j = 0; j < roomQueue.length; j++) {
                        if (roomQueue[j].floor !== floor) {
                            toRemove.push(roomQueue[j]);
                        }
                    }
                    for (var j = 0; j < toRemove.length; j++) {
                        roomQueue.splice(roomQueue.indexOf(toRemove[j]), 1);
                    }
                    current = roomQueue.shift();
                    if (typeof current === 'undefined') break;
                }
                if (current.height * 0.9 >= current.proto.minSize) {
                    current.height *= 0.9;
                }
                if (current.width * 0.9 >= current.proto.minSize) {
                    current.width *= 0.9;
                }
                i = -1;
            }
        }
        if (typeof current === 'undefined') break;
        usedRooms.push(current);
        //current.isPlaced = true;
        var children = current.adjacent.slice();
        for (var i = 0; i < usedRooms.length; i++) {
            if (children.includes(usedRooms[i])) {
                children.splice(children.indexOf(usedRooms[i]),1);
            }
        }
        for (var i = 0; i< children.length;i++) {
            var currentChild = children[i];
            currentChild.calcTotalArea(usedRooms.slice());
        }
        children.sort(compareTotalArea);
        children.reverse();
        for (var i = 0; i < children.length; i++) {
            roomQueue.push(children[i]);
        }
    }
    this.fillGaps();
    if (this.numFloors > floor) {

        var success = this.placeRooms(floor + 1);
        //console.log(success);
        return success;
    }
    return true;
};

/**
 * Replaces oldRoom with newRoom in the allRooms list
 * @param oldRoom
 * @param newRoom
 */
Building.prototype.replace = function (oldRoom, newRoom) {
    this.removeRoom(oldRoom);
    this.allRooms.push(newRoom);
};

/**
 * Removes the given room from the buildings allRooms list
 * @param room
 */
Building.prototype.removeRoom = function (room) {
    this.allRooms.remove(this.allRooms.getIndexOf(room));
};

/**
 * Snaps all the rooms, repeating the given number of times
 * @param num
 */
Building.prototype.snapAllRooms = function(num){
    for (var j = 0; j < num; j++) {
        for (var i = 0; i < this.allRooms.length; i++) {
            this.snap(this.allRooms.get(i));
        }
    }
};

/**
 * Attempts to place the given room on the given side of it's parent
 * @param room The room being placed
 * @param direction 'north', 'south', 'east', or 'west'
 * @returns {boolean} Returns true if the building was successfully placed
 */
Building.prototype.placeRoom = function (room, direction) {
    var openings = this.getOpenings(room, direction);
    // If there are no openings, the room cannot be placed on this side
    if (openings.length === 0) return false;
    var opening = openings[randInt(openings.length)];
    var placeX;
    var placeY;
    var parent = room.parent;
    // Places the rooms within a random valid opening
    switch (direction) {
        case 'north':
            placeY = parent.locY - room.height;
            placeX = this.getPlacement(opening, room.width, new Line1D(parent.locX, parent.right()));
            break;
        case 'south':
            placeY = parent.bottom();
            placeX = this.getPlacement(opening, room.width, new Line1D(parent.locX, parent.right()));
            break;
        case 'east':
            placeX = parent.right();
            placeY = this.getPlacement(opening, room.height, new Line1D(parent.locY, parent.bottom()));
            break;
        case 'west':
            placeX = parent.locX - room.width;
            placeY = this.getPlacement(opening, room.height, new Line1D(parent.locY, parent.bottom()));
            break;
        default:
            throw("invalid direction: " + direction);
    }
    if (isNaN(placeX) || isNaN(placeY) || this.intersection(new Rectangle(placeX, placeY, room.width, room.height), room.floor)) {
        return false;
    }
    room.locX = placeX;
    room.locY = placeY;
    this.doors.push(new Door(room, room.parent, direction));
    this.snap(room);
    room.isPlaced = true;
    return true;
};

/**
 * Causes the room to align itself with other elements in the layout through three snapping processes
 * @param room The room to snap
 */
Building.prototype.snap = function (room) {
    this.snapPlot(room);
    if (room.area === 0) {
        throw("snapPlot");
    }
    this.snapTo(room);
    if (room.area === 0) {
        throw("snapTo");
    }
    this.snapAlign(room);
};

/**
 * Snaps the room to the edges of the plot if the room is within the plotSnap distance
 * @param room The room to snap
 */
Building.prototype.snapPlot = function (room) {
    for (var i = 0; i < 4; i++) {
        this.snapPlotSingleDirection(room, directions[i]);
    }
};

/**
 * Snaps the room to the given edge of the plot, if it is within the plotSnap distance
 * @param room
 * @param direction
 */
Building.prototype.snapPlotSingleDirection = function(room, direction) {
    var floor = room.floor;
    var empty = !this.intersection(room.getSpace(this.plot, direction), floor);
    var closeEnough;
    var spot;
    switch (direction) {
        case 'north':
            closeEnough = empty && room.locY <= this.plotSnap;
            spot = 0;
            break;
        case 'south':
            closeEnough = this.plot.height - room.bottom() <= this.plotSnap;
            spot = this.plot.height;
            break;
        case 'east':
            closeEnough = this.plot.width - room.right() <= this.plotSnap;
            spot = this.plot.width;
            break;
        case 'west':
            closeEnough = room.locX <= this.plotSnap;
            spot = 0;
            break;
        default:
            throw("invalid direction: " + direction);
    }
    if (empty && closeEnough) room.stretch(spot, direction);//this.snapRoom(room, direction, spot);
};

/**
 * Snaps the room to touch nearby rooms within the roomSnap distance
 * @param room The room to snap
 */
Building.prototype.snapTo = function (room) {
    for (var i = 0; i < 4; i++) {
        this.snapToSingleDirection(room, directions[i]);
    }
};

/**
 * Snaps the room to the closest room withing the roomSnap distance in the given direction
 * @param room
 * @param direction
 */
Building.prototype.snapToSingleDirection = function (room, direction) {
    var floor = room.floor;
    var roomList = this.getIntersectingRooms(room.getSpace(this.plot, direction), floor);
    var list = [];
    if (roomList.length <= 0) return;
    var validSnap;
    switch (direction) {
        case 'north':
            roomList.forEach(function (value) { list.push(value.bottom()) });
            list.sort();
            list.reverse();
            var rect = new Rectangle(room.locX, list[0], room.width, room.locY - list[0]);
            validSnap = list[0] < room.locY && room.locY - list[0] <= this.roomSnap && this.empty(room, rect);
            break;
        case 'south':
            roomList.forEach(function (value) { list.push(value.locY) });
            list.sort();
            var rect = new Rectangle(room.locX, room.bottom(), room.width, list[0] - room.bottom());
            validSnap = list[0] > room.bottom() && list[0] - room.bottom() <= this.roomSnap && this.empty(room, rect);
            break;
        case 'east':
            roomList.forEach(function (value) { list.push(value.locX) });
            list.sort();
            var rect = new Rectangle(room.right(), room.locY, list[0] - room.right(), room.width);
            validSnap = list[0] > room.right() && list[0] - room.right() <= this.roomSnap && this.empty(room, rect);
            break;
        case 'west':
            roomList.forEach(function (value) { list.push(value.right()) });
            list.sort();
            list.reverse();
            var rect = new Rectangle(list[0], room.locY, room.locX - list[0], room.height);
            validSnap = list[0] < room.locX && room.locX - list[0] <= this.roomSnap && this.empty(room, rect);
            break;
        default:
            throw("invalid direction: " + direction);
    }
    if (validSnap) room.stretch(list[0], direction);//this.snapRoom(room, direction, list[0]);
};

/**
 * Snaps the room such that the sides align with other rooms, even across gaps
 * @param room The room to snap
 */
Building.prototype.snapAlign = function (room) {
    for (var i = 0; i < 4;i++) {
        this.snapAlignSingleDirection(room, directions[i]);
    }
};

/**
 * Snaps the room to line up with rooms within the roomSnap distance in the given direction
 * @param room
 * @param direction
 */
Building.prototype.snapAlignSingleDirection = function(room, direction) {
    var floor = room.floor;
    if (room.hasDoor(direction)) return; //Do not snap if it would disconnect rooms connected by a door
    var nearSide = room.getSide(direction) - this.roomSnap;
    var farSide = room.getSide(direction) + this.roomSnap;
    var list = [];
    // Get all room that fall within the snap distance
    for (var i = 0; i < this.allRooms.length; i++) {
        var current = this.allRooms.get(i);
        if (current.floor === floor && current.getSide(direction) >= nearSide && current.getSide(direction) <= farSide && current !== room) list.push(new Line1D(room.getSide(direction), current.getSide(direction)));
    }
    if (list.length <= 0) return; // If there are no matches, we're done!
    list.sort(compareLength);
    var near = list[0]; // Find the shortest line segment
    if (near.length === 0) return; // Snapping is unnecessary already aligned
    var rect;
    var doors = [];
    var max;
    var spot = near.end;
    //var shrinking = room.isShrinking(direction, spot);
    switch (direction) {
        case 'north':
            rect = new Rectangle(room.locX, Math.min(near.start, near.end), room.width, near.length);
            doors = room.getDoors('east').concat(room.getDoors('west'));
            max = doors.length > 0 ? getMaxDoor(doors, direction).y - this.doorSpace : Infinity;
            if (spot > max) return; // Do not snap if it would move past a door
            break;
        case 'south':
            rect = new Rectangle(room.locX, Math.max(near.start, near.end), room.width, near.length);
            doors = room.getDoors('east').concat(room.getDoors('west'));
            max = doors.length > 0 ? getMaxDoor(doors, 'south').end() + this.doorSpace: 0;
            if (spot < max) return; // Do not snap if it would move past a door
            break;
        case 'east':
            rect = new Rectangle(Math.max(near.start, near.end), room.locY, near.length,  room.height);
            doors = room.getDoors('north').concat(room.getDoors('south'));
            max = doors.length > 0 ? getMaxDoor(doors, 'east').end() + this.doorSpace : 0;
            if (spot < max) return; // Do not snap if it would move past a door
            break;
        case 'west':
            rect = new Rectangle(Math.min(near.start, near.end), room.locY, near.length,  room.height);
            doors = room.getDoors('north').concat(room.getDoors('south'));
            max = doors.length > 0 ? getMaxDoor(doors, 'west').x - this.doorSpace : Infinity;
            if (spot > max) return; // Do not snap if it would move past a door
            break;
        default:
            throw("invalid direction: " + this.direction);
    }
    if (!this.empty(room, rect)) return; // If the space is occupied, do not snap
    room.stretch(spot, direction);//this.snapRoom(room, direction, spot);
};

/**
 * Returns true is the given rectangle is empty, except for the given room
 * @param room
 * @param rectangle
 * @returns {boolean}
 */
Building.prototype.empty = function(room, rectangle) {
    var floor = room.floor;
    for (var i = 0; i < this.allRooms.length; i++) {
        if (this.allRooms.get(i).floor === floor && this.allRooms.get(i).intersection(rectangle) > 0 && room !== this.allRooms.get(i)) {
            return false;
        }
    }
    return true;
};

/**
 * Chooses a random location within the given opening for the given side length
 * @param opening The opening (Line1D) that is being used
 * @param sideLength The size of the relevant side of the room being placed
 * @returns {*} The random location of the room within the given parameters
 */
Building.prototype.getPlacement = function (opening, sideLength, parentSide) {
    var availableSpace = new Line1D(opening.start, opening.end);
    availableSpace.trimEnd(sideLength);
    var validSpace = new Line1D(Math.max(availableSpace.start, 3 + parentSide.start - sideLength), Math.min(availableSpace.end, parentSide.end - 3));
    var offset = randDoub(validSpace.length);
    return validSpace.start + offset;
};

/**
 * Returns all obstacles in a the given direction
 * @param room The room being placed
 * @param direction The direction the room is being place in
 * @returns {Array} All relevant obstacles as rectangles
 */
Building.prototype.getObstacles = function(room, direction) {
    var parent = room.parent;
    var range;
    var obstacles = [];
    var sortFunction;
    switch (direction){
        case 'north':
            range = new Rectangle(0,parent.locY - room.height, this.plot.width, room.height);
            sortFunction = compareLeft;
            break;
        case 'south':
            range = new Rectangle(0, parent.bottom(), this.plot.width, room.height);
            sortFunction = compareLeft;
            break;
        case 'east':
            range = new Rectangle(parent.right(), 0, room.width, this.plot.height);
            sortFunction = compareTop;
            break;
        case 'west':
            range = new Rectangle(parent.locX - room.width, 0, room.width, this.plot.height);
            sortFunction = compareTop;
            break;
        default:
            throw("invalid direction: " + direction);
    }
    var relevantRooms = this.getRoomsOnFloor(room.floor);

    //console.log(room);
    //console.log(relevantRooms);

    for (var i = 0; i < relevantRooms.length; i++) {
        var current = relevantRooms[i];
        if (current.intersection(range, room.floor) > 0) {
            obstacles.push(new Rectangle(current.locX, current.locY, current.width, current.height));
        }
    }
    obstacles.sort(sortFunction);
    obstacles = this.collapseObstacles(obstacles, direction);
    return obstacles;
};

/**
 * Collapses a list of obstacles such that overlapping obstacles are not considered as separate obstacles
 * @param list The list of obstacles to collapse
 * @param direction The direction the room is being placed in. ('north', 'south', 'east', or 'west')
 */
Building.prototype.collapseObstacles= function (list, direction) {
    for (var i = 0; i < list.length - 1; i++) {
        var current = list[i];
        for (var j = i + 1; j < list.length; j++) {
            if (list[j] != 0) {
                var next = list[j];
                switch (direction) {
                    case 'north':
                    case 'south':
                        if (next.left <= current.right) {
                            var newLeft = Math.min(current.left, next.left);
                            var newTop = Math.min(current.top, next.top);
                            var newWidth = Math.max(current.right, next.right) - newLeft;
                            var newHeight = Math.max(current.bottom, next.bottom) - newTop;
                            list[i] = new Rectangle(newLeft, newTop, newWidth, newHeight);
                            list[j] = 0;
                        }
                        break;
                    case 'east':
                    case 'west':
                        if (next.top <= current.bottom) {
                            var newLeft = Math.min(current.left, next.left);
                            var newTop = Math.min(current.top, next.top);
                            var newWidth = Math.max(current.right, next.right) - newLeft;
                            var newHeight = Math.max(current.bottom, next.bottom) - newTop;
                            list[i] = new Rectangle(newLeft, newTop, newWidth, newHeight);
                            list[j] = 0;
                        }
                        break;
                    default:
                        throw("invalid direction: " + direction);
                }
            }
        }
    }
    return list.filter(nonZero);
};

/**
 * Returns all openings large enough to accommodate the new room that connect to it's parent
 * @param room The room being placed
 * @param direction The direction the room is being place in
 * @returns {Array} All sufficient openings
 */
Building.prototype.getOpenings = function (room, direction) {
    var parent = room.parent;
    // Return 0 openings if the room would extend outside the plot
    switch (direction) {
        case 'north':
            if (parent.locY < room.height) return [];
            break;
        case 'south':
            if (this.plot.height - parent.height - parent.locY < room.height) return [];
            break;
        case 'east':
            if (this.plot.width - parent.width - parent.locX < room.width) return [];
            break;
        case 'west':
            if (parent.locX < room.width) return [];
            break;
        default:
            throw("invalid direction: " + direction);
    }
    // Obstacles are sorted according to the relevant direction, and overlapping obstacles are combined
    var obstacles = this.getObstacles(room, direction);
    var openings = [];
    var sideLength;
    var parentSide;
    // Find all spaces between obstacles
    switch (direction) {
        case 'north':
        case 'south':
            if (obstacles.length === 0) {
                openings.push(new Line1D(0, this.plot.width));
            } else {
                openings.push(new Line1D(0, obstacles[0].left));
                for (var i = 0; i < obstacles.length - 1; i++) {
                    openings.push(new Line1D(obstacles[i].right,obstacles[i+1].left));
                }
                openings.push(new Line1D(obstacles[obstacles.length - 1].right, this.plot.width));
            }
            sideLength = room.width;
            parentSide = new Line1D(parent.locX, parent.right());
            break;
        case 'east':
        case 'west':
            if (obstacles.length === 0) {
                openings.push(new Line1D(0, this.plot.height));
            } else {
                openings.push(new Line1D(0, obstacles[0].top));
                for (var i = 0; i < obstacles.length - 1; i++) {
                    openings.push(new Line1D(obstacles[i].bottom,obstacles[i+1].top));
                }
                openings.push(new Line1D(obstacles[obstacles.length - 1].bottom, this.plot.height));
            }
            sideLength = room.height;
            parentSide = new Line1D(parent.locY, parent.bottom());
            break;
        default:
            throw("invalid direction: " + direction);
    }
    var toRemove = [];
    // Remove openings that won't fit the room and do not align with the parent room
    for (var i = 0; i < openings.length; i++) {
        var opening = openings[i];
        if (opening.length < sideLength || opening.end - parentSide.start < 3 || parentSide.end - opening.start < 3) {
            toRemove.push(opening);
        }
    }
    for (var i = 0; i< toRemove.length; i++) {
        var index = openings.indexOf(toRemove[i]);
        openings.splice(index, 1);
    }
    return openings;
};

/**
 * Gets the available space on the each side of the room, to determine where to place the next room
 * @param parent The room that the next room will be placed on.
 * @returns {*[]} Areas of available space in each cardinal direction
 */
Building.prototype.getSideSpace = function(parent) {
    var northRect = new Rectangle(0,0, this.plot.width,parent.locY);
    var southRect = new Rectangle(0, parent.bottom(), this.plot.width,this.plot.height - parent.bottom());
    var eastRect = new Rectangle(parent.right(), 0, this.plot.width - parent.right(), this.plot.height);
    var westRect = new Rectangle(0, 0, parent.locX, this.plot.height);
    var sides = [northRect,southRect,eastRect,westRect];
    var roomList = this.getFloor(parent.floor);
    for (var i = 0; i < roomList.length;i++) {
        var current = roomList.get(i);
        for (var j = 0; j < sides.length; j++) {
            var side = sides[j];
            side.area -= current.intersection(side, parent.floor);
        }
    }
    return [{direction: "north", area: northRect.area},{direction: "south", area: southRect.area},{direction: "east", area: eastRect.area},{direction: "west", area: westRect.area}];
};

function queueRooms(room, list) {
    for (var i = 0; i < room.adjacent.length; i++) {
        var toPlace = room.adjacent[i];
        if (!toPlace.isPlaced) {
            list.push(toPlace);
        }
    }
}

/**
 * Draws the room in the given context
 * @param context the context in which to draw the rooms
 */
Building.prototype.drawRooms = function (context) {
    setTabs();
    // Draw the grid
    context.lineWidth = 1;
    context.strokeStyle = 'rgb(230, 243, 255)';
    for (var i = 1; i < this.plot.width; i++) {
        context.beginPath();
        context.moveTo(i * scale, 0);
        context.lineTo(i * scale, this.plot.height * scale);
        context.closePath();
        context.stroke();
    }
    for (var i = 1; i < this.plot.height; i++) {
        context.beginPath();
        context.moveTo(0, i * scale);
        context.lineTo(this.plot.width * scale, i * scale);
        context.closePath();
        context.stroke();
    }
    console.log("All Rooms:");
    console.log(this.allRooms);
    this.entry.printTree();
    console.log(this.entry);
    // Draw the building
    for (var i = 0; i < this.allRooms.length; i++) {
        if (this.allRooms.get(i).floor === this.selectedFloor) this.allRooms.get(i).draw(context);
    }
    var edges = this.getOutsideEdges(this.selectedFloor);
    for (var i = 0; i < edges.length; i++) {
        edges[i].draw(context, scale / 1.5);
    }
    // for (var i = 0; i < this.doors.length; i++) {
    //     this.doors[i].draw(context);
    // }
};

/**
 *  Creates ProtoRooms for use in addRoomsToList
 */
Building.prototype.initializeRoomPrototypes = function () {
    for (var i = 0; i < this.roomTypes.length; i++) {
        this.protoRooms.push(new ProtoRoom(this.roomTypes[i]));
    }
};

/**
 *  Adds rooms to the list such that the total room size fits inside the given percentage of the plot
 */
Building.prototype.addRoomsToList = function () {
    while (this.area < this.minPlotPortion) {
        this.protoRooms.sort(comparePriority);
        var room = new Room(this.protoRooms[0]);
        this.push(room);
        this.protoRooms[0].priority += this.protoRooms[0].delay;
        //this.area += room.area;
    }
};

/**
 * Trims the rooms to insure that they fit on the plot
 */
Building.prototype.trimSize = function () {
    var i = 0;
    this.roomList.sort(ComparePrivacy);
    while (this.area > this.maxPlotPortion) {
        this.area = 0;
        for (var roomNum = 0; roomNum < this.roomList.length; roomNum++) {
            var room = this.roomList.get(roomNum);
            if (room.area > room.proto.avgArea() * (1.3 - (0.2 * i))) {
                room.makeRectangle(room.width *= 0.9,room.height *= 0.9);
            }
            this.area += room.area;
        }
        i++;
    }
};

/**
 *  Connects the subtrees based on privacy
 */
Building.prototype.connectSubtrees = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    //console.log(floor);
    var roomList = this.floors[floor - 1];
    roomList.sort(ComparePrivacy);
    if (floor === 1) this.entry = roomList.peek();
    for (var i = 1; i < roomList.length; i++) {
        var toConnect;
        var room = roomList.get(i);
        var lowScore = Infinity;
        for (var j = 0; j < roomList.length; j++) {
            if (j !== i) {
                var currentRoom = roomList.get(j);
                var score = currentRoom.privacy;
                if (room.adjacent.includes(currentRoom)) {
                    score = Infinity;
                } else {
                    score += currentRoom.adjacent.length * 10;
                    if (currentRoom.purpose === "hallway") {
                        score -= 50;
                    }
                }
                if (score < lowScore) {
                    lowScore = score;
                    toConnect = currentRoom;
                }
            }
        }
        toConnect.connect(room);
    }
};

/**
 *  Adds the given room to the room lists
 * @param room The room to add
 */
Building.prototype.push = function (room) {
    var floor = room.floor;
    if (floor === 1) this.area += room.area;
    this.floors[floor - 1].push(room);
    this.allRooms.push(room);
};

/**
 * Returns true if any rooms in the building intersect the given rectangle
 * @param rectangle
 * @returns {boolean}
 */
Building.prototype.intersection = function(rectangle, floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    for (var i = 0; i < this.allRooms.length; i++) {
        if (this.allRooms.get(i).intersection(rectangle) && this.allRooms.get(i).floor === floor) {
            return true;
        }
    }
    return false;
};

/**
 * Returns an array of rooms that intersect the given rectangle
 * @param rectangle
 * @returns {Array}
 */
Building.prototype.getIntersectingRooms = function (rectangle, floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    var list = [];
    for (var i = 0; i < this.allRooms.length; i++) {
        var current = this.allRooms.get(i);
        if (current.intersection(rectangle, floor) > 0) {
            list.push(current);
        }
    }
    return list;
};

/**
 * Adds at least one door to each yard area
 * A yard area is any section of outdoor space on the plot defined by the edges of the plot and the wall of the house
 * If there is only one yard space, we may add a front door and a back door
 */
Building.prototype.addOutsideDoors = function () {
    var roomsTouchingEdge = [];
    for (var i = 0; i < this.allRooms.length; i++) {
        var room = this.allRooms.get(i);
        if (room.touchingSides(this.plot).length > 0) {
            roomsTouchingEdge.push(room);
        }
    } // Get all rooms that are touching an edge

    var northLines = [];
    this.getFreeOuterLines(roomsTouchingEdge, 'north').forEach(function (value) { northLines.push(value.to2DPlotEdge(currentBuilding.plot,'north')) });
    var eastLines = [];
    this.getFreeOuterLines(roomsTouchingEdge, 'east').forEach(function (value) { eastLines.push(value.to2DPlotEdge(currentBuilding.plot,'east')) });
    var southLines = [];
    this.getFreeOuterLines(roomsTouchingEdge, 'south').forEach(function (value) { southLines.push(value.to2DPlotEdge(currentBuilding.plot,'south')) });
    var westLines = [];
    this.getFreeOuterLines(roomsTouchingEdge, 'west').forEach(function (value) { westLines.push(value.to2DPlotEdge(currentBuilding.plot,'west')) });

    var yardList = northLines.concat(eastLines, southLines, westLines);
    while (!this.isConnected(yardList) && yardList.length > 1) {
        //console.log('here');
        for (var i = 0; i < yardList.length; i++) {
            var i2 = (i + 1) % yardList.length;
            if (equals(yardList[i].x2, yardList[i2].x1) && equals(yardList[i].y2, yardList[i2].y1)) {
                yardList[i] = new Line2D(yardList[i].x1, yardList[i].y1, yardList[i2].x2, yardList[i2].y2);
                yardList.splice(i2, 1);
                break;
            }
        }
    }
    if (yardList.length === 1) {
        this.addOutsideDoorsSingleYard();
    } else {
        this.addOutsideDoorsMultipleYards(yardList);
    }
    //console.log(this.doors);
    //console.log(yardList);
};

/**
 * Adds a door to each yard in the yardList
 * The yards in the yardList are represented as a Line2D that marks the points where the yard contacts the house
 * @param yardList
 */
Building.prototype.addOutsideDoorsMultipleYards = function (yardList) {
    for (var i = 0; i < yardList.length; i++) {
        this.addDoorToYard(yardList[i]);
    }
};

/**
 * Adds a door to the least private room that contacts the given yard
 * @param yard
 */
Building.prototype.addDoorToYard = function(yard) {
    var currentLocation = {x: yard.x2, y: yard.y2};
    var adjacentEdges = [];
    var edges = this.getOutsideEdges();
    var currentEdge = removeEdge(edges, currentLocation);
    // console.log("Edges");
    // console.log(edges.toString());
    if (currentEdge !== null) {
        while (currentLocation.x !== yard.x1 || currentLocation.y !== yard.y1) {
            if (currentEdge === null) break;
            adjacentEdges.push(currentEdge);
            currentLocation = currentEdge.getOtherPoint(currentLocation);
            currentEdge = removeEdge(edges, currentLocation);
        }
        adjacentEdges.sort(sortEdgesByRoomPrivacy);
        var publicEdges = [adjacentEdges[0]];
        var count = 1;
        while (count < adjacentEdges.length && adjacentEdges[0].room.privacy === adjacentEdges[count].room.privacy) {
            publicEdges.push(adjacentEdges[count]);
            count++;
        }
        var edgeToPlaceDoor = publicEdges[randInt(publicEdges.length)];
        addOutsideDoor(edgeToPlaceDoor);
    }
};

/**
 * Adds one or two doors to a building with a single yard.
 */
Building.prototype.addOutsideDoorsSingleYard = function () {
    var edges = this.getOutsideEdges();
    edges.sort(sortEdgesByRoomPrivacy);
    addOutsideDoor(edges[0]);
    edges.splice(0,1);
    if (Math.random() > 0.5) addOutsideDoor(edges[0]);
};

/**
 * Returns of list of room edges that line the outside of the building
 * @returns {Array}
 */
Building.prototype.getOutsideEdges = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    var list = [];
    for (var i = 0; i < this.allRooms.length; i++) {
        var room = this.allRooms.get(i)
        if (room.floor === floor) {
            var roomEdges = room.getOutsideEdges(this);
            for (var j = 0; j < roomEdges.length; j++) {
                list.push(roomEdges[j])
            }
        }
        //list.concat(roomEdges);
    }
    //console.log(list);
    return list;
};

/**
 * Returns the first room it finds in the building that intersects the given point
 * @param x
 * @param y
 * @returns {*}
 */
Building.prototype.getRoomAtPoint = function (x, y, floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    for (var i = 0; i < this.allRooms.length; i++) {
        if (this.allRooms.get(i).containsPoint(x, y) && this.allRooms.get(i).floor === floor) return this.allRooms.get(i);
    }
    return null;
};

/**
 * Takes a list of Line2D and returns false if the end of one line is the same as the beginning of the next.
 * The list is treating as a cycle, so the last element will be compared with the first
 * @param listOfLine2D
 * @returns {boolean}
 */
Building.prototype.isConnected = function(listOfLine2D) {
    for (var i = 0; i < listOfLine2D.length; i++) {
        var i2 = (i + 1) % listOfLine2D.length;
        if (equals(listOfLine2D[i].x2, listOfLine2D[i2].x1) && equals(listOfLine2D[i].y2, listOfLine2D[i2].y1)) return false;
    }
    return true;
};

/**
 * Returns a list of Line1D that represent areas on the given edge of the plot that do not intersect any of the room in the given list
 * @param roomList
 * @param direction
 * @returns {*[]}
 */
Building.prototype.getFreeOuterLines = function (roomList, direction) {
    var lineList = [new Line1D(this.plot.getSide(getNextDirection(direction, false)),this.plot.getSide(getNextDirection(direction)))];
    for (var i = 0; i < roomList.length; i++) {
        var room = roomList[i];
        if (equals(room.getSide(direction), this.plot.getSide(direction))) {
            for (var j = 0; j < lineList.length; j++) {
                var split = lineList[j].split(new Line1D(room.getSide(getNextDirection(direction, false)), room.getSide(getNextDirection(direction))));
                if (split.line1 != null) lineList[j] = split.line1;
                if (split.line2 != null) lineList.push(split.line2);
            }
        }
    }
    lineList = lineList.filter(function (value) { return value.length > 0 });
    return lineList;
};

/**
 * Tells all doors to expand(), allowing for variety in doors
 */
Building.prototype.expandDoors = function() {
    for (var i = 0; i < this.doors.length; i++) {
        this.doors[i].expand();
    }
};

/**
 * Performs each rule in the given list of rules
 * @param ruleList
 */
Building.prototype.performRules = function (ruleList) {
    for (var i = 0; i < ruleList.length; i++) {
        ruleList[i](this);
    }
};

/**
 * Adds another empty floor to the building
 * Returns false if the building is already at it's maximum number of floors
 * @returns {boolean}
 */
Building.prototype.addFloor = function () {
    if (this.numFloors === this.maxFloors) return false;
    this.numFloors++;
    this.floors.push(new RoomList());
    return true;
};

/**
 * Selects a spot for the first room.
 * If this is the first floor, it generates random values.
 * On other floors, this picks the location of a stairwell from the lower floor.
 * @param firstRoom
 * @param floor
 */
Building.prototype.placeFirstRoom = function (firstRoom) {
    var floor = firstRoom.floor;
    if (floor === 1) {
        var validPlacement = false;
        while (!validPlacement) {
            var XCenter = this.plot.width / 2;
            var XOffset = randGauss(0, 5) - (firstRoom.width / 2);
            var YOffset = Math.abs(randGauss(0, 10)) + firstRoom.height;
            firstRoom.setLocation(XCenter + XOffset, this.plot.height - YOffset);
            validPlacement = (firstRoom.locX >= 0) && (firstRoom.locX <= this.plot.width - firstRoom.width) && (firstRoom.locY >= 0) && (firstRoom.locY <= this.plot.height - firstRoom.height);
        }
    } else {
        var longList = this.getFloor(floor - 1);
        //console.log(longList);
        var shortList = [];
        for (var i = 0; i < longList.length; i++) {
            if (longList.get(i).purpose === 'stairwell') shortList.push(longList.get(i));
        }
        if (shortList.length > 0) {
            var stairwell = shortList[0];
            firstRoom.setLocation(stairwell.locX, stairwell.locY);
            firstRoom.setSize(stairwell.width, stairwell.height);
        }

    }
    firstRoom.isPlaced = true;
};

/**
 * Returns the roomList for the given floor
 * @param floor
 * @returns {RoomList|*}
 */
Building.prototype.getFloor = function (floor) {
    return this.floors[floor - 1];
};

/**
 * Returns a list of all rooms on the given floor
 * @param floor
 * @returns {Array}
 */
Building.prototype.getRoomsOnFloor = function (floor) {
  var toReturn = [];
  for (var i = 0; i< this.allRooms.length; i++) {
      if (this.allRooms.get(i).floor === floor) toReturn.push(this.allRooms.get(i));
  }
  return toReturn;
};
