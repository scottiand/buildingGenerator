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

/**
 *  Connects the subtrees based on privacy
 */
Building.prototype.connectSubtrees = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    //console.log(floor);
    var roomList = this.getFloor(floor);

    roomList.sort(ComparePrivacy);
    if (floor === 1) this.entry = roomList.peek();
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
        }
        //this.getFloor(floor).remove(this.getFloor(floor).getIndexOf(room));

    }
};
