
// GENERATING ROOM LIST

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
    //console.log('----------------------------------');
    for (var i = 0; i < this.roomChoiceRules.length; i++) {
        var rule = this.roomChoiceRules[i];
        //console.log(rule);
        var possibilities = getAllOf(this.roomTypes, rule.purpose);
        //console.log(possibilities);
        var numPos = possibilities.length;
        if (numPos > 0) {
            var max = rule.max;
            if (max > numPos) {
                max = numPos;
            }
            var range = (max - rule.min + 1);
            //console.log(range);
            if (range > 0) {
                var numChoices = randInt(range) + rule.min;
                //console.log(numChoices);
                for (var j = 0; j < numChoices; j++) {
                    var choice = possibilities.splice(randInt(possibilities.length), 1)[0];
                    //console.log(choice);
                    this.protoRooms.push(new ProtoRoom(choice));
                }
            }
        }
    }


    // for (var i = 0; i < this.roomTypes.length; i++) {
    //     this.protoRooms.push(new ProtoRoom(this.roomTypes[i]));
    // }
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
    this.allRooms.sort(ComparePrivacy);
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

// CREATE CONNECTIVITY GRAPH

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
Building.prototype.connectSubtreesOld = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    //console.log(floor);
    var roomList = this.getFloor(floor);

    var toRemove = [];

    roomList.sort(ComparePrivacy);
    if (floor === 1) this.entry = roomList.peek();
    //while (roomList.length > 1) {
        for (var i = 1; i < roomList.length; i++) {
            var room = roomList.get(i);
            if (!room.isPlaced) { // Does this actually matter?
                var toConnect;
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

                toRemove.push(room);
                //this.getFloor(floor).remove(this.getFloor(floor).getIndexOf(room));
            }

        }
        // for (var i = 0; i < roomList.length; i++) {
        //     this.getFloor(floor).remove(this.getFloor(floor).getIndexOf(room));
        // }
    //}
};

Building.prototype.connectSubtrees = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    var roomList = this.getFloor(floor).copy();
    //console.log(roomList)
    roomList.sort(ComparePrivacy);
    var finalList = [roomList.peek()];
    finalList = addChildrenToList(roomList.peek(), finalList);
    if (floor === 1) this.entry = roomList.peek();
    for (var i = 0; i < finalList.length; i++) {
        roomList.remove(roomList.getIndexOf(finalList[i]));
    }
    for (var i = 0; i < roomList.length; i++) {
        var room = roomList.get(i);
        var toConnect;
        var lowScore = Infinity;
        for (var j = 0; j < finalList.length; j++) {
            var candidate = finalList[j];
            var score = candidate.privacy;
            score += candidate.adjacent.length * 10;
            if (candidate.purpose === 'hallway') score -= 50;
            if (score < lowScore) {
                lowScore = score;
                toConnect = candidate;
            }
        }
        toConnect.connect(room);
        finalList.push(toConnect);
        addChildrenToList(toConnect, finalList);
    }



};

function addChildrenToList(room, list) {

    for (var i = 0; i < room.adjacent.length; i++) {
        var adjRoom = room.adjacent[i];
        list.push(adjRoom);
        addChildrenToList(adjRoom, list);
    }

    return list;
}
