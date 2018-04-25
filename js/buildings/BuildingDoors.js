
/**
 * Adds extra doors to low privacy rooms
 * @param floor The floor to add cycles to
 */
Building.prototype.addCycles = function (floor) {
    if (typeof floor === 'undefined') floor = 1;
    var usedRooms = [];
    for (var i = 0; i < this.allRooms.length; i++) {
        var room = this.allRooms.get(i);

        var cyclingPrivacy = this.cyclingPrivacy;
        if (room.floor === floor && room.privacy < cyclingPrivacy) {
            //usedRooms.push(room);
            var contactingRooms= room.getContactingRooms(this);
            contactingRooms.filter(function (value) {
                return value.privacy < cyclingPrivacy;// && !usedRooms.includes(room);
            });

            for (var j = 0; j < contactingRooms.length; j++) {
                var room2 = contactingRooms[j];
                //console.log(room2);
                var direction = room.getDirectionFrom(room2);
                if (!room2.hasDoorTo(room) && percentChance(this.cyclingChance) && greaterThan(getOverlap(room, room2, direction).length, 3)) {
                    var door = new Door(room, room2, direction);
                    this.doors.push(door);
                }
            }

        }
    }
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
        //console.log('true');
        this.addOutsideDoorsSingleYard();
    } else {
        //console.log('false');
        this.addOutsideDoorsMultipleYards(yardList);
    }
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
    var edges = this.getOutsideEdges(1);
    var currentEdge = removeEdge(edges, currentLocation);
    // console.log("Edges");
    // console.log(edges.toString());
    if (currentEdge !== null) {
        while (currentLocation.x !== yard.x1 || currentLocation.y !== yard.y1) {
            if (currentEdge === null) break;
            if (!(currentEdge.room.purpose === 'wall')) adjacentEdges.push(currentEdge);
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
    var edges = this.getOutsideEdges(1);
    edges.sort(sortEdgesByRoomPrivacy);
    if (edges[0].room.purpose === 'wall') edges.splice(0, 1);
    addOutsideDoor(edges[0]);
    edges.splice(0,1);
    if (Math.random() > 0.5) addOutsideDoor(edges[0]);
};

/**
 * Tells all doors to expand(), allowing for variety in doors
 */
Building.prototype.expandDoors = function() {
    //console.log(this.doors.toString());
    for (var i = 0; i < this.doors.length; i++) {
        this.doors[i].expand();
        //console.log(this.doors.toString());
    }
};
