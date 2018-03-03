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
    this.plot = {width:0, height:0, area: 0};
    this.minPlotPortion = 0;
    this.maxPlotPortion = 0;
    this.plotSnap = 4;
    this.roomSnap = 8;
    this.area = 0;
    this.roomTypes = [greatRoom,bathroom,bedroom,kitchen,diningRoom]; // Eventually get this from BuildingType
    this.rules = [bedBathAndBeyondRule, diningAndKitchenRule]; // Eventually get this from BuildingType
    this.protoRooms = [];
    this.roomList = new RoomList();
    this.allRooms = new RoomList();
    this.entry;
    this.doors = [];
    this.draw = true;
    this.doorSpace = 0.5;
}

/**
 * Creates and draws the building
 */
Building.prototype.build = function () {
    this.addPlot(plotSize);
    this.generateRoomList();
    this.generateConnectivityGraph();
    if (this.placeRooms()) {
        if (this.draw) this.drawRooms(context);
        return true;
    }
    return false;
};

/**
 * Randomly generates the size of the plot
 * @param plotSize The desired average plot size
 */
Building.prototype.addPlot = function (plotSize) {
    this.plot.width = randGauss(plotSize,5);
    this.plot.height = randGauss(plotSize,5);
    this.plot.area = this.plot.width * this.plot.height;
    canvas.width = this.plot.width * scale;
    canvas.height = this.plot.height * scale;
    this.minPlotPortion = this.plot.area * 0.5; // Calculate this based on density at a later date
    this.maxPlotPortion = this.plot.area * 0.7; // Calculate this based on density at a later date
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
    this.createSubtrees();
    this.connectSubtrees();
};

/**
 * Sets the rooms coordinates within the plot
 */
Building.prototype.placeRooms = function () {
    var roomQueue = [];
    // Place the first room
    var firstRoom = this.roomList.peek();
    var validPlacement = false;
    // Make sure that the room is placed within the plot
    while (!validPlacement) {
        var XCenter = this.plot.width / 2;
        var XOffset = randGauss(0, 5) - (firstRoom.width / 2);
        var YOffset = Math.abs(randGauss(0, 10)) + firstRoom.height;
        firstRoom.setLocation(XCenter + XOffset, this.plot.height - YOffset);
        validPlacement = (firstRoom.locX >= 0) && (firstRoom.locX <= this.plot.width - firstRoom.width) && (firstRoom.locY >= 0) && (firstRoom.locY <= this.plot.height - firstRoom.height);
    }
    firstRoom.isPlaced = true;
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
    while (roomQueue.length != 0) {
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
                if (this.draw) console.log("Failed to place room");
                return false;
            }
        }
        usedRooms.push(current);
        current.isPlaced = true;
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
    //this.snapAllRooms(1);
    return true;
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
    if (isNaN(placeX) || isNaN(placeY)) {
        return false;
    }
    room.locX = placeX;
    room.locY = placeY;
    this.doors.push(new Door(room, room.parent, direction));
    this.snap(room);
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
    var empty = !this.intersection(this.getSpace(room, direction));
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
    var roomList = this.getIntersectingRooms(this.getSpace(room, direction));
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
 * Returns a rectangle representing the space in the direction of the given room.
 * @param room The room to use
 * @param direction 'north', 'south', 'east', or 'west'
 * @returns {Rectangle} A rectangle representing the space in the direction of the given room.
 */
Building.prototype.getSpace = function (room, direction) {
    switch (direction) {
        case "north":
            return new Rectangle(room.locX, 0, room.width, room.locY);
        case "south":
            return new Rectangle(room.locX, room.locY + room.height, room.width, this.plot.height);
        case "east":
            return new Rectangle(room.locX + room.width, room.locY, this.plot.width, room.height);
        case "west":
            return new Rectangle(0, room.locY, room.locX, room.height);
        default:
            throw("invalid direction: " + direction);
    }
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
    if (room.hasDoor(direction)) return; //Do not snap if it would disconnect rooms connected by a door
    var nearSide = room.getSide(direction) - this.roomSnap;
    var farSide = room.getSide(direction) + this.roomSnap;
    var list = [];
    // Get all room that fall within the snap distance
    for (var i = 0; i < this.allRooms.length; i++) {
        var current = this.allRooms.get(i);
        if (current.getSide(direction) >= nearSide && current.getSide(direction) <= farSide && current !== room) list.push(new Line1D(room.getSide(direction), current.getSide(direction)));
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
    for (var i = 0; i < this.allRooms.length; i++) {
        if (this.allRooms.get(i).intersection(rectangle) > 0 && room !== this.allRooms.get(i)) {
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
    for (var i = 0; i < this.allRooms.length; i++) {
        var current = this.allRooms.get(i);
        if (current.intersection(range) > 0) {
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
    for (var i = 0; i < this.roomList.length;i++) {
        var current = this.roomList.get(i);
        for (var j = 0; j < sides.length; j++) {
            var side = sides[j];
            side.area -= current.intersection(side);
        }
    }
    return [{direction: "north", area: northRect.area},{direction: "south", area: southRect.area},{direction: "east", area: eastRect.area},{direction: "west", area: westRect.area}];
};

function queueRooms(room, list) {
    for (var i = 0; i < room.adjacent.length; i++) {
        var toPlace = room.adjacent[i];
        if (!toPlace.isPlaced) {
            toPlace.isPlaced = true;
            toPlace.parent = room;
            list.push(toPlace);
        }
    }
}

/**
 * Draws the room in the given context
 * @param context the context in which to draw the rooms
 */
Building.prototype.drawRooms = function (context) {
    // Draw the grid
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
        this.allRooms.get(i).draw(context);
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
        this.area += room.area;
    }
};

/**
 * Trims the rooms to insure that they fit on the plot
 */
Building.prototype.trimSize = function () {
    var i = 0;
    this.roomList.sort(comparePriority);
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
 *  Builds subtrees based on the building's rules
 */
Building.prototype.createSubtrees = function () {
    for (var i = 0; i < this.rules.length; i++) {
        this.rules[i](this);
    }
};

/**
 *  Connects the subtrees based on privacy
 */
Building.prototype.connectSubtrees = function () {
    this.roomList.sort();
    this.entry = this.roomList.peek();
    for (var i = 1; i < this.roomList.length; i++) {
        var toConnect;
        var room = this.roomList.get(i);
        var lowScore = Infinity;
        for (var j = 0; j < this.roomList.length; j++) {
            if (j != i) {
                var currentRoom = this.roomList.get(j);
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
    this.roomList.push(room);
    this.allRooms.push(room);
};

/**
 * Returns true if any rooms in the building intersect the given rectangle
 * @param rectangle
 * @returns {boolean}
 */
Building.prototype.intersection = function(rectangle) {
    var inters = false;
    for (var i = 0; i < this.allRooms.length; i++) {
        if (this.allRooms.get(i).intersection(rectangle)) {
            inters = true;
            break;
        }
    }
    return  inters;
};

/**
 * Returns an array of rooms that intersect the given rectangle
 * @param rectangle
 * @returns {Array}
 */
Building.prototype.getIntersectingRooms = function (rectangle) {
    var list = [];
    for (var i = 0; i < this.allRooms.length; i++) {
        var current = this.allRooms.get(i);
        if (current.intersection(rectangle) > 0) {
            list.push(current);
        }
    }
    return list;
};

function bedBathAndBeyondRule(building) {
    var roomList = building.roomList;
    while (roomList.contains("bedroom")) {
        var num = roomList.countAllOf("bedroom");
        var shortList = [];
        var rand = Math.random();
        // Get some number of bedrooms and remove them from the list
        if (num <= 2) {
            shortList = roomList.removeAllOf("bedroom");
        } else if (rand < 0.1) {
            shortList = roomList.removeSomeOf("bedroom",5);
        } else if (Math.random() < 0.3) {
            shortList = roomList.removeSomeOf("bedroom",4);
        } else if (Math.random() < 0.6) {
            shortList = roomList.removeSomeOf("bedroom",3);
        } else {
            shortList = roomList.removeSomeOf("bedroom",2);
        }
        // Get a bathroom and remove it to the list
        var bath = roomList.contains("bathroom") ? roomList.removeFirstOf("bathroom") : null;
        if (bath != null) {
            shortList.push(bath);
        }
        var hall = new Room(new ProtoRoom(hallway));
        hall.connectAll(shortList);
        building.area += hall.area;
        building.push(hall);
    }
}

function diningAndKitchenRule(building) {
    var roomList = building.roomList;
    var i = roomList.countAllOf("kitchen");
    var j = roomList.countAllOf("dining");
    if (j < i) {
        i = j;
    }
    // Do until we run out of dining rooms or kitchens
    for (var k = 0; k < i; k++){
        var kitch = roomList.removeFirstOf("kitchen");
        var din = roomList.getFirstOf("dining");
        din.connect(kitch);
    }
}
