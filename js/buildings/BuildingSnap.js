/**
 * Building.prototype function that relate to the snapping algorithms
 */

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
 * Causes the room to align itself with other elements in the layout through three snapping processes
 * @param room The room to snap
 */
Building.prototype.snap = function (room) {
    if (room.floor === 1) this.snapPlot(room);
    this.snapTo(room);
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
    var roomList = this.getIntersectingRooms(room.getSpace(this.plot, direction), floor, this.getFloorOutline(floor - 1));
    var list = [];
    if (roomList.length <= 0) return;
    var validSnap;
    switch (direction) {
        case 'north':
            roomList.forEach(function (value) { list.push(value.bottom()) });
            list.sort();
            list.reverse(numericSort);
            var rect = new Rectangle(room.locX, list[0], room.width, room.locY - list[0]);
            validSnap = list[0] < room.locY && room.locY - list[0] <= this.roomSnap && this.empty(room, rect, this.getFloorOutline(floor - 1));
            break;
        case 'south':
            roomList.forEach(function (value) { list.push(value.locY) });
            list.sort(numericSort);
            var rect = new Rectangle(room.locX, room.bottom(), room.width, list[0] - room.bottom());
            validSnap = list[0] > room.bottom() && list[0] - room.bottom() <= this.roomSnap && this.empty(room, rect, this.getFloorOutline(floor - 1));
            break;
        case 'east':
            roomList.forEach(function (value) { list.push(value.locX) });
            list.sort(numericSort);
            var rect = new Rectangle(room.right(), room.locY, list[0] - room.right(), room.width);
            validSnap = list[0] > room.right() && list[0] - room.right() <= this.roomSnap && this.empty(room, rect, this.getFloorOutline(floor - 1));
            break;
        case 'west':
            roomList.forEach(function (value) { list.push(value.right()) });
            list.sort(numericSort);
            list.reverse();
            var rect = new Rectangle(list[0], room.locY, room.locX - list[0], room.height);
            validSnap = list[0] < room.locX && room.locX - list[0] <= this.roomSnap && this.empty(room, rect, this.getFloorOutline(floor - 1));
            break;
        default:
            throw("invalid direction: " + direction);
    }
    if (validSnap) room.stretch(list[0], direction);
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
    var possibleSnapRooms = this.allRooms;
    for (var i = 0; i < possibleSnapRooms.length; i++) {
        var current = possibleSnapRooms.get(i);
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
    switch (direction) {
        case 'north':
            rect = new Rectangle(room.locX, Math.min(near.start, near.end), room.width, near.length);
            doors = room.getDoors('east').concat(room.getDoors('west'));
            max = doors.length > 0 ? getMaxDoor(doors, direction).y - this.doorSpace : Infinity;
            if (spot > max) return; // Do not snap if it would move past a door
            break;
        case 'south':
            rect = new Rectangle(room.locX, room.bottom(), room.width, near.length);
            doors = room.getDoors('east').concat(room.getDoors('west'));
            max = doors.length > 0 ? getMaxDoor(doors, 'south').end() + this.doorSpace: 0;
            if (spot < max) return; // Do not snap if it would move past a door
            break;
        case 'east':
            rect = new Rectangle(room.right(), room.locY, near.length,  room.height);
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
    if (!this.empty(room, rect, this.getFloorOutline(floor - 1))) return; // If the space is occupied, do not snap
    room.stretch(spot, direction);
};
