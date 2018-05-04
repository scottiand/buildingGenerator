
/**
 * Sets the rooms coordinates within the plot
 */
Building.prototype.placeRooms = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    //console.log('placeRooms' + floor);
    var roomList = this.floors[floor - 1];
    //console.log('------------------');
    //console.log(roomList);
    var roomQueue = [];
    // Place the first room
    if (floor === 1) {
        //console.log('if');
        firstRoom = this.entry;
        //console.log(firstRoom);
    } else {
        //console.log("else");
        var firstRoom = roomList.peek();
    }

    this.placeFirstRoom(this, firstRoom);

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
    spit(' before while loop in placeRooms')
    while (roomQueue.length !== 0) {
        var current = roomQueue.shift();

        var parent = current.parent;
        if (current.floor === floor && !current.isPlaced) {
            //console.log(current);
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
                        var list = this.allRooms;
                        for (var j = 0; j < list.length; j++) {
                            if ((!list.get(j).isPlaced) && list.get(j).floor === floor) roomQueue.push(list.get(j));
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
                    } else {
                        var newHeight = current.height;
                        var newWidth = current.width;
                        if (newHeight * 0.9 >= current.proto.minSize) {
                            newHeight *= 0.9;
                        }
                        if (newWidth * 0.9 >= current.proto.minSize) {
                            newWidth *= 0.9;
                        }
                        current.setSize(newWidth, newHeight);
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
                    children.splice(children.indexOf(usedRooms[i]), 1);
                }
            }
            for (var i = 0; i < children.length; i++) {
                var currentChild = children[i];
                currentChild.calcTotalArea(usedRooms.slice());
            }
            children.sort(compareTotalArea);
            children.reverse();
            for (var i = 0; i < children.length; i++) {
                roomQueue.push(children[i]);
            }
        }
    }
    // Removes mysterious unplaced rooms.
    for (var i = 0; i < this.allRooms.length; i++) {
        if ((!this.allRooms.get(i).isPlaced || lessThan(this.allRooms.get(i).locX, 0)) && this.allRooms.get(i).floor === floor) {
            this.allRooms.remove(this.allRooms.getIndexOf(this.allRooms.get(i)));
        }
    }
    //spit(this.allRooms);
    spit(' before fillGaps');
    this.fillGaps(floor);
    spit(' before addCycles');
    this.addCycles(floor);
    spit(' after addCycles');

    // for (var i = 0; i < this.allRooms.length; i++) {
    //     if ((!this.allRooms.get(i).isPlaced || lessThan(this.allRooms.get(i).locX, 0)) && this.allRooms.get(i).floor === floor) {
    //         this.allRooms.remove(this.allRooms.getIndexOf(this.allRooms.get(i)));
    //     }
    // }

    if (this.numFloors > floor) {
        var list = this.getFloorOutline(floor);

        this.floorOutlines[floor - 1] = list;
        // for (var i = 0; i < this.floorOutlines[floor].length; i++) {
        //     this.floorOutlines[floor].get(i).draw(context);
        // }

        var success = this.placeRooms(floor + 1);

        //console.log(success);
        return success;
    }

    return true;
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
    //console.log('placement calculated');
    if (isNaN(placeX) || isNaN(placeY) || this.intersection(new Rectangle(placeX, placeY, room.width, room.height), room.floor)) {
        return false;
    }
    room.locX = placeX;
    room.locY = placeY;
    var door = new Door(room, room.parent, direction);
    this.doors.push(door);
    if (door.size === 0) console.log('yes');
    this.snap(room);
    room.isPlaced = true;
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
    //console.log(room.floor);
    relevantRooms = this.addFloorOutlineToList(relevantRooms, room.floor);

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
            current = list[i];
            if (list[j] !== 0) {
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
    //console.log(room);
    //console.log(parent);
    // Return 0 openings if the room would extend outside the plot
    switch (direction) {
        case 'north':
            if (parent.locY < room.height) return [];
            break;
        case 'south':
            if (this.plot.height - parent.bottom() < room.height) return [];
            break;
        case 'east':
            if (this.plot.width - parent.right() < room.width) return [];
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
