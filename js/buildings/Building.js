// Scotti Anderson
// Building
// Buildings represent the entire plot and contain functions to generate the floor plan
//

var plotSize = 50;

/**
 * Represents the floor plan of a building as a series of rooms connected and placed in space.
 * @constructor
 */
function Building(buildingType) {
    this.buildingType = buildingType;

    this.plot = new Plot(buildingType.avgPlotSize);
    this.minPlotPortion = this.plot.area * 0.5; // Calculate this based on density at a later date
    this.maxPlotPortion = this.plot.area * 0.7; // Calculate this based on density at a later date
    this.plotSnap = buildingType.plotSnap;
    this.roomSnap = buildingType.roomSnap;
    this.cyclingPrivacy = buildingType.cyclingPrivacy;
    this.cyclingChance = buildingType.cyclingChance;
    this.area = 0;

    // RULES
    this.roomTypes = buildingType.roomTypes;
    this.roomChoiceRules = buildingType.roomChoiceRules;

    this.connectivityRules = buildingType.connectivityRules;
    this.connectivityRulesUpstairs = buildingType.connectivityRulesUpstairs;
    this.placeFirstRoom = buildingType.placeFirstRoom;
    this.addOutsideDoorsToYards = buildingType.addOutsideDoors;
    this.fillSmallGaps = buildingType.fillSmallGaps;


    this.protoRooms = [];

    this.floors = [new RoomList()];
    this.floorOutlines = [];

    this.roomList = this.floors[0];

    this.allRooms = new RoomList();
    //this.entry;
    this.doors = [];
    this.draw = true;
    this.doorSpace = buildingType.doorSpace;

    this.maxFloors = buildingType.maxFloors;
    this.numFloors = 1;
    this.selectedFloor = 1;


}

/**
 * Creates and draws the building
 */
Building.prototype.build = function () {
    //console.log('build()');
    canvas.width = this.plot.width * scale;
    canvas.height = this.plot.height * scale;
    spit('before generateRoomList');
    this.generateRoomList();
    spit('before generateConnectiveityGraph');
    this.generateConnectivityGraph();
    //console.log('Graph Created');
    spit('before placeRooms');
    if (this.placeRooms()) {
        //console.log('Rooms Placed');
        var toRemove = [];
        for (var i = 0; i < this.allRooms.length; i++) {
            if (this.allRooms.get(i).locX < 0) toRemove.push(this.allRooms.get(i));
        }
        for (var i = 0; i < toRemove.length; i++) {
            this.allRooms.remove(this.allRooms.getIndexOf(toRemove[i]));
        }
        this.addOutsideDoors();
        //console.log('Doors added');
        this.expandDoors();
        //console.log('Doors Expanded');
        //console.log(this.roomList.toString());
        if (this.draw) this.drawRooms(context);
        return true;
    }

    return false;
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
 * Returns true is the given rectangle is empty, except for the given room
 * @param room
 * @param rectangle
 * @returns {boolean}
 */
Building.prototype.empty = function(room, rectangle, extraRooms) {
    if (typeof extraRooms === 'undefined') extraRooms = new RoomList();
    var floor = room.floor;
    var roomList = this.allRooms.concat(extraRooms);
    for (var i = 0; i < roomList.length; i++) {
        if (roomList.get(i).floor === floor && roomList.get(i).intersection(rectangle) > 0 && room !== roomList.get(i)) {
            return false;
        }
    }
    return true;
};

/**
 * Returns a list with the floor outilne dummy room added t the end of the given list
 * @param list A list of rooms
 * @param floor The current floor
 * @returns {*} A list of rooms with the dummy rooms added on the end
 */
Building.prototype.addFloorOutlineToList = function(list, floor) {
    if (floor > 1) {
        return list.concat(this.getFloorOutline(floor - 1).content);
    } else {
        return list;
    }
};

/**
 * Gets the available space on the each side of the room, to determine where to place the next room
 * @param parent The room that the next room will be placed on.
 * @returns {*[]} Areas of available space in each cardinal direction
 */
Building.prototype.getSideSpace = function(parent) {
    //console.log(parent);
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
        if (i % 5 === 0) {
            context.strokeStyle = 'rgb(210, 223, 235)'
        } else {
            context.strokeStyle = 'rgb(230, 243, 255)';
        }
        context.beginPath();
        context.moveTo(i * scale, 0);
        context.lineTo(i * scale, this.plot.height * scale);
        context.closePath();
        context.stroke();
    }
    for (var i = 1; i < this.plot.height; i++) {
        if (i % 5 === 0) {
            context.strokeStyle = 'rgb(210, 223, 235)'
        } else {
            context.strokeStyle = 'rgb(230, 243, 255)';
        }
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
Building.prototype.getIntersectingRooms = function (rectangle, floor, extraRooms) {
    if (typeof(floor) === 'undefined') floor = 1;
    if (typeof extraRooms === 'undefined') extraRooms = new RoomList();
    var list = [];
    var toTest = this.allRooms.concat(extraRooms);
    for (var i = 0; i < toTest.length; i++) {
        var current = toTest.get(i);
        if (current.intersection(rectangle, floor) > 0) {
            list.push(current);
        }
    }
    return list;
};

/**
 * Returns of list of room edges that line the outside of the building
 * @returns {Array}
 */
Building.prototype.getOutsideEdges = function (floor) {
    if (typeof(floor) === 'undefined') floor = 1;
    var list = [];
    for (var i = 0; i < this.allRooms.length; i++) {
        var room = this.allRooms.get(i);
        if (room.floor === floor) {
            var roomEdges = room.getOutsideEdges(this);
            for (var j = 0; j < roomEdges.length; j++) {
                list.push(roomEdges[j])
            }
        }
    }
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

/**
 * Returns of roomList full of dummy room that fill the outdoor spaces of the house
 * Note that these rooms have a floor value of one greater than floor, because they will be used when creating the next floor
 * @param floor The floor number in which to detect the outdoor spaces
 * @returns {RoomList} A list of dummy rooms
 */
Building.prototype.getFloorOutline = function(floor) {
    // var roomList = new RoomList();


    if (floor < 1) return new RoomList();
    var count = 0;
    if (typeof this.floorOutlines[floor - 1] === 'undefined') {
        // if (failures === 1) {
        //     spit('here');
        // }
        var queue = this.getOutsideEdges(floor);
        var list = new RoomList();
        // context.fillStyle = 'rgb(255,255,255)';
        // context.fillRect(0,0, this.plot.width * scale, this.plot.height.scale);
        // this.drawRooms(context, floor);
        while (queue.length > 0) {
            count++;
            if (count > 10000) {
                console.log(failures);
                x.y();
            }
            //console.log(failures);
            // console.log('------------------------');
            // console.log(this.allRooms);
             //console.log('startwhile');
            // console.log(queue.length);
            // console.log(failures);
            var currentEdge = queue[0];
            queue.splice(0, 1);
            var direction = getOppositeDirection(currentEdge.directionOfRoom);
            var rect = currentEdge.getSpace(this.plot, direction);
            var intersectingRooms = this.getIntersectingRooms(rect, floor, list);
            var newRoom;
            if (intersectingRooms.length > 0) {
                var nearRoom = nearestRoom(intersectingRooms, direction);
                switch (direction) {
                    case "north":
                        rect = new Rectangle(rect.left, nearRoom.bottom(), rect.width, currentEdge.location - nearRoom.bottom());
                        break;
                    case "south":
                        rect = new Rectangle(rect.left, rect.top, rect.width, nearRoom.locY - currentEdge.location);
                        break;
                    case "east":
                        rect = new Rectangle(rect.left, rect.top, nearRoom.locX - currentEdge.location, rect.height);
                        break;
                    case "west":
                        rect = new Rectangle(nearRoom.right(), rect.top, currentEdge.location - nearRoom.right(), rect.height);
                        break;
                    default:
                        throw("invalid direction: " + direction);
                }
            }
            newRoom = dummyRoom(rect.left, rect.top, rect.width, rect.height, floor);
            if (newRoom.area !== 0) {
                list.push(newRoom);
                //console.log(newRoom.getOutsideEdges(this, list));
                var newEdges = newRoom.getOutsideEdges(this, list);
                queue = queue.concat(newEdges);
                //newRoom.draw(context);
            }
        }
        //console.log(list);
        for (var i = 0; i < list.length; i++) {
            list.get(i).floor += 1;
        }
        return list;
    }

    return this.floorOutlines[floor - 1];
};

Building.prototype.getAllRooms = function(floor) {
    if (typeof floor === 'undefined') {
        return this.allRooms;
    } else {
        var list = new RoomList();
        for (var i = 0; i < this.allRooms.length; i++) {
            var room = this.allRooms.get(i);
            if (room.floor === floor) list.push(room);
        }
        return list;
    }
};



