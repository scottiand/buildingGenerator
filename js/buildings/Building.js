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
    this.area = 0;
    this.roomTypes = [greatRoom,bathroom,bedroom,kitchen,diningRoom]; // Eventually get this from BuildingType
    this.rules = [bedBathAndBeyondRule, diningAndKitchenRule]; // Eventually get this from BuildingType
    this.protoRooms = [];
    this.roomList = new RoomList();
    this.allRooms = new RoomList();
    this.entry;
    //this.build();
}

/**
 * Creates and draws the building
 */
Building.prototype.build = function () {
    this.addPlot(plotSize);
    this.generateRoomList();
    this.generateConnectivityGraph();
    if (this.placeRooms()) {
        this.drawRooms(context);
        return true;
    } else {
        return false;
    }
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
    this.maxPlotPortion = this.plot.area * 0.8; // Calculate this based on density at a later date
};

/**
 * Creates a list of rooms to be placed into the building
 */
Building.prototype.generateRoomList = function () {
    this.initializeRoomPrototypes();
    this.addRoomsToList();
    //console.log(this.roomList);
    if (this.area > this.maxPlotPortion) {
        this.trimSize(); // So far, does absolutely nothing
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
    var XCenter = this.plot.width / 2;
    var XOffset =  randGauss(0, 5) - (firstRoom.width / 2);
    var YOffset = Math.abs(randGauss(10, 5)) + firstRoom.height;
    firstRoom.setLocation(XCenter + XOffset, this.plot.height - YOffset);
    firstRoom.isPlaced = true;
    queueRooms(firstRoom, roomQueue);
    var usedRooms = roomQueue.slice();
    usedRooms.push(firstRoom);
    //console.log(usedRooms.length);
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
        console.log("------------------------------------------")
        console.log(current);
        var sides = this.getSideSpace(parent);
        sides.sort(compareArea);
        sides.reverse();
        //console.log(sides);
        for (var i = 0; i < sides.length; i++) {
            if (this.placeRoom(current, sides[i].direction)) break;
            current.rotate();
            if (this.placeRoom(current, sides[i].direction)) break;
            if (i === 3) {
                console.log("Failed to place room");
                return false;
            }
        }
        usedRooms.push(current);
        current.isPlaced = true;
        var children = current.adjacent.slice();
        // console.log("children: ");
        // console.log(children);
        // console.log("usedRooms: ");
        // console.log(usedRooms.length);
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
        //console.log(roomQueue);
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
    if (openings.length === 0) {
        return false;
    }
    var opening = openings[randInt(openings.length)];
    var placeX;
    var placeY;
    var parent = room.parent;
    //console.log(direction);
    switch (direction) {
        case 'north':
            placeY = parent.locY - room.height;
            placeX = this.getPlacement(opening, room.width, new Line1D(parent.locX, parent.locX + parent.width));
            break;
        case 'south':
            placeY = parent.locY + parent.height;
            placeX = this.getPlacement(opening, room.width, new Line1D(parent.locX, parent.locX + parent.width));
            break;
        case 'east':
            placeX = parent.locX + parent.width;
            placeY = this.getPlacement(opening, room.height, new Line1D(parent.locY, parent.locY + parent.height));
            break;
        case 'west':
            placeX = parent.locX - room.width;
            placeY = this.getPlacement(opening, room.height, new Line1D(parent.locY, parent.locY + parent.height));
            break;
        default:
            throw("invalid direction: " + direction);
    }
    if (isNaN(placeX) || isNaN(placeY)) {
        return false;
    }
    //console.log(room);
    room.locX = placeX;
    room.locY = placeY;
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
    //console.log('offset: ' + offset);
    var offset = randDoub(validSpace.length);
    //console.log('offset: ' + offset);
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
    switch (direction){
        case 'north':
            range = new Rectangle(0,parent.locY - room.height, this.plot.width, room.height);
            break;
        case 'south':
            range = new Rectangle(0, parent.locY + parent.height, this.plot.width, room.height);
            break;
        case 'east':
            range = new Rectangle(parent.locX + parent.width, 0, room.width, this.plot.height);
            break;
        case 'west':
            range = new Rectangle(parent.locX - room.width, 0, room.width, this.plot.height);
            break;
        default:
            throw("invalid direction: " + direction);
    }
    //context.fillRect(range.left * scale, range.top * scale, range.width * scale, range.height * scale);
    for (var i = 0; i < this.allRooms.length; i++) {
        var current = this.allRooms.get(i);
        if (current.intersection(range)) {
            obstacles.push(range);
        }
    }
    return obstacles;
};

/**
 * Returns all openings large enough to accommodate the new room that connect to it's parent
 * @param room The room being placed
 * @param direction The direction the room is being place in
 * @returns {Array} All sufficient openings
 */
Building.prototype.getOpenings = function (room, direction) {
    var obstacles = this.getObstacles(room, direction);
    //console.log(obstacles);
    var openings = [];
    var sideLength;
    var parent = room.parent;
    var parentSide;
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
                openings.push(obstacles[obstacles.length - 1].right, this.plot.width);
            }
            sideLength = room.width;
            parentSide = new Line1D(parent.locX, parent.locX + parent.width);
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
                openings.push(obstacles[obstacles.length - 1].bottom, this.plot.height);
            }
            sideLength = room.height;
            parentSide = new Line1D(parent.locY, parent.locY + parent.height);
            break;
        default:
            throw("invalid direction: " + direction);
    }
    var toRemove = [];
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
    var southRect = new Rectangle(0, parent.locY + parent.height, this.plot.width,this.plot.height - (parent.locY + parent.height));
    var eastRect = new Rectangle(parent.locX + parent.width, 0, this.plot.width - (parent.locX + parent.width), this.plot.height);
    var westRect = new Rectangle(0, 0, parent.locX, this.plot.height);
    //context.fillRect(southRect.left * scale, southRect.top* scale, southRect.width * scale, southRect.height * scale);
    //context.fillRect(eastRect.left * scale - 500, eastRect.top* scale, eastRect.width * scale, eastRect.height * scale);
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
    //console.log("All Rooms:");
    //console.log(this.allRooms);
    this.entry.printTree();
    console.log(this.entry);
    for (var i = 0; i < this.allRooms.length; i++) {
        this.allRooms.get(i).draw(context);
    }
};

/**
 *  Creates ProtoRooms for use in addRoomsToList
 */
Building.prototype.initializeRoomPrototypes = function () {
    for (var i = 0; i< this.roomTypes.length; i++) {
        this.protoRooms.push(new ProtoRoom(this.roomTypes[i]));
    }
    //console.log(this.protoRooms);
};

/**
 *  Adds rooms to the list such that the total room size fits inside the given percentage of the plot
 */
Building.prototype.addRoomsToList = function () {
    while (this.area < this.minPlotPortion) {
        this.protoRooms.sort(ComparePriority);
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
    // To do at a later date
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
    //this.roomList.reverse();
    this.entry = this.roomList.peek();
    //console.log("length " + this.roomList.length);
    //console.log(this.roomList);
    for (var i = 1; i < this.roomList.length; i++) {
        var toConnect;
        var room = this.roomList.get(i);
        console.log("room " + room.name + " " + room.area);
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
        console.log("toConnect " + toConnect.name + " " + toConnect.area);
        //console.log("toConnect");
        //console.log(toConnect);
        //console.log("room");
        //console.log(room);
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
}

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
