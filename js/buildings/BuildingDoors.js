/*
Building.prototype functions that deal with Doors
 */

/**
 * Adds extra doors to low privacy rooms
 * @param floor The floor to add cycles to
 */
Building.prototype.addCycles = function (floor) {
    if (typeof floor === 'undefined') floor = 1;
    for (var i = 0; i < this.allRooms.length; i++) {
        var room = this.allRooms.get(i);
        var cyclingPrivacy = this.cyclingPrivacy;
        if (room.floor === floor && room.privacy < cyclingPrivacy) {
            var contactingRooms= room.getContactingRooms(this);
            contactingRooms.filter(function (value) {
                return value.privacy < cyclingPrivacy;
            });
            for (var j = 0; j < contactingRooms.length; j++) {
                var room2 = contactingRooms[j];
                var direction = room.getDirectionFrom(room2);
                var chance = this.cyclingChance;
                if (room2.purpose === 'storage') chance -= this.cyclingChance;
                if (room2.purpose === 'bathroom') chance -= 20;
                if (!room2.hasDoorTo(room) && percentChance(chance) && greaterThan(getOverlap(room, room2, direction).length, 3)) {
                    var door = new Door(room, room2, direction);
                    this.doors.push(door);
                }
            }

        }
    }
};

/**
 * Adds outside doors
 * Gets the different yard sections and passes them to the BuildingTypes addOutsideDoorsToYards function
 */
Building.prototype.addOutsideDoors = function () {
    // Get all rooms that are touching an edge
    var roomsTouchingEdge = [];
    for (var i = 0; i < this.allRooms.length; i++) {
        var room = this.allRooms.get(i);
        if (room.touchingSides(this.plot).length > 0) {
            roomsTouchingEdge.push(room);
        }
    }
    // Get all the uninterrupted lines along the plot on each side
    var northLines = [];
    this.getFreeOuterLines(roomsTouchingEdge, 'north').forEach(function (value) { northLines.push(value.to2DPlotEdge(currentBuilding.plot,'north')) });
    var eastLines = [];
    this.getFreeOuterLines(roomsTouchingEdge, 'east').forEach(function (value) { eastLines.push(value.to2DPlotEdge(currentBuilding.plot,'east')) });
    var southLines = [];
    this.getFreeOuterLines(roomsTouchingEdge, 'south').forEach(function (value) { southLines.push(value.to2DPlotEdge(currentBuilding.plot,'south')) });
    var westLines = [];
    this.getFreeOuterLines(roomsTouchingEdge, 'west').forEach(function (value) { westLines.push(value.to2DPlotEdge(currentBuilding.plot,'west')) });
    var yardList = northLines.concat(eastLines, southLines, westLines);
    // Connect yards at corners
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
    this.addOutsideDoorsToYards(this, yardList);
};

/**
 * Tells all doors to expand(), allowing for variety in doors
 */
Building.prototype.expandDoors = function() {
    for (var i = 0; i < this.doors.length; i++) {
        this.doors[i].expand();
    }
};
