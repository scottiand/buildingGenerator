/*
Building.prototype functions that deal with the creation of the connectivity graph
 */

/*
GENERATING THE ROOM LIST
 */

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
 *  Creates ProtoRooms for use in addRoomsToList
 */
Building.prototype.initializeRoomPrototypes = function () {
    for (var i = 0; i < this.roomChoiceRules.length; i++) {
        var rule = this.roomChoiceRules[i];
        var possibilities = getAllOf(this.roomTypes, rule.purpose);
        var numPos = possibilities.length;
        if (numPos > 0) {
            var max = rule.max;
            if (max > numPos) {
                max = numPos;
            }
            var range = (max - rule.min + 1);
            if (range > 0) {
                var numChoices = randInt(range) + rule.min;
                for (var j = 0; j < numChoices; j++) {
                    var choice = possibilities.splice(randInt(possibilities.length), 1)[0];
                    this.protoRooms.push(new ProtoRoom(choice));
                }
            }
        }
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
    }
};

/**
 * Trims the rooms to insure that they fit on the plot
 */
Building.prototype.trimSize = function () {
    var i = 0;
    this.allRooms.sort(comparePrivacy);
    while (this.area > this.maxPlotPortion) {
        this.area = 0;
        for (var roomNum = 0; roomNum < this.allRooms.length; roomNum++) {
            var room = this.allRooms.get(roomNum);
            if (room.area > room.proto.avgArea() * (1.3 - (0.2 * i))) {
                room.makeRectangle(room.width *= 0.9,room.height *= 0.9);
            }
            this.area += room.area;
        }
        i++;
    }
};

/*
 CREATING THE CONNECTIVITY GRAPH
 */

/**
 * Creates the abstract graph that represents the flow of rooms in the building
 */
Building.prototype.generateConnectivityGraph = function () {
    this.performRules(this.connectivityRules);
    this.connectSubtrees();
};

/**
 *  Connects the subtrees based on privacy
 */
Building.prototype.connectSubtrees = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    var roomList = this.getFloor(floor).copy();
    roomList.sort(comparePrivacy);
    var finalList = new RoomList();
    finalList.push(roomList.peek());
    finalList = addChildrenToList(roomList.peek(), finalList);
    if (floor === 1) this.entry = roomList.peek();
    for (var i = 0; i < finalList.length; i++) {
        var toRemove = finalList.get(i);
        if (roomList.includes(toRemove)) roomList.remove(roomList.getIndexOf(toRemove));
    }
    for (var i = 0; i < roomList.length; i++) {
        var room = roomList.get(i);
        this.connectRoom(room, finalList);
        finalList.push(room);
        addChildrenToList(room, finalList);
    }
};

/**
 * Connects a single room to one of the listed possibilities
 * Rooms are rated using privacy, number of connections, and if they are a hallway.
 * @param room
 * @param possibilities
 * @returns {Room}
 */
Building.prototype.connectRoom = function(room, possibilities) {
    var toConnect;
    var lowScore = Infinity;
    for (var i = 0; i < possibilities.length; i++) {
        var candidate = possibilities.get(i);
        var score = candidate.privacy;
        score += candidate.adjacent.length * 10;
        if (candidate.purpose === 'hallway') score -= 50;
        if (score < lowScore) {
            lowScore = score;
            toConnect = candidate;
        }
    }
    toConnect.connect(room);
    return toConnect;
};
