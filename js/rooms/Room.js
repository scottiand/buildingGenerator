// Scotti Anderson
// Room
// Setup for Rooms, which represent individual rooms

/**
 * Generates a room based on a given room proto, with randomized size
 * privacy: determines the order of placement of rooms
 * priority: determines the order in which the room is placed
 * delay: determines the frequency of this room
 * length: the length of one side of the room
 * width: the width of one side of the rom
 * locX: the horizontal position of the room. -1 means not yet placed
 * locY: the vertical position of the room. -1 means not yet placed
 * adjacent: a list a rooms to connect to this room
 * isPlaced: keeps track of if the room has been placed in space yet (maybe unnecessary)
 * @param {ProtoRoom} proto Gives the room attributes based on the RoomType
 */
function Room(proto) {

    if (typeof proto != 'undefined') {
        this.proto = Object.assign(proto);
        this.name = this.proto.name;
        this.purpose = this.proto.purpose;
        this.privacy = this.proto.privacy;
        this.area = 0;
        this.totalArea = 0;
        this.width = 0;
        this.height = 0;
        this.corners = this.makeRectangle();
        this.locX = -99999;
        this.locY = -99999;
        this.adjacent = [];
        this.parent = null;
        this.isPlaced = false;
    } else {
        throw "no ProtoRoom provided";
    }
}

/**
 * Returns a list of points that represent the corners of a rectangle, with randomly determined length and width
 * @returns {Array} An array of points
 */
Room.prototype.makeRectangle = function (newWidth, newHeight) {
    var corners = [];
    var width = -1;
    var height = -1;
    if (typeof newWidth === 'undefined' || typeof newHeight === 'undefined') {
        while (width < this.proto.minSize || width > this.proto.maxSize) {
            width = randGauss(this.proto.avgSize, this.proto.sizeVariance);
        }
        while (height < this.proto.minSize || height > this.proto.maxSize) {
            height = randGauss(this.proto.avgSize, this.proto.sizeVariance)
        }
    } else {
        width = newWidth;
        height = newHeight;
    }
    this.area = width * height;
    this.width = width;
    //console.log(width);
    this.height = height;
    //console.log(height);
    corners.push({x:0,y:0});
    corners.push({x:width,y:0});
    corners.push({x:width,y:height});
    corners.push({x:0,y:height});
    return corners;
};

/**
 * Draws the room in the given context
 * @param {Context} context The context in which the room is drawn
 */
Room.prototype.draw = function (context) {
    context.moveTo(this.locX * scale, this.locY * scale);
    for (var i = 0; i < this.corners.length; i++) {
        context.lineTo((this.locX + this.corners[i].x)  * scale, (this.locY + this.corners[i].y)  * scale)
    }
    context.lineTo(this.locX * scale, this.locY * scale);
    context.stroke();
    context.fillText(this.name, this.locX * scale, this.locY * scale);
};

/**
 * Prints all the variables to the console.
 */
Room.prototype.printToConsole = function () {
    console.log("proto: " + this.proto.name + "\n" +
        "locX: " + this.locX + "\n" +
        "locY: " + this.locY + "\n");
};

/**
 * Adds a room to the adjacent of this room
 * @param {Room} room the room to connect
 */
Room.prototype.connect = function (room) {
    //room.adjacent = typeof room.adjacent === 'undefined' ? [] : room.adjacent;
    //room.adjacent.push(this);
    //console.log("here");
    room.parent = this;
    this.adjacent.push(room);
};

/**
 * Adds a list of rooms to the adjacent of this room
 * @param {Array} rooms List of rooms to connect
 */
Room.prototype.connectAll = function (rooms) {
    for (var i = 0; i < rooms.length; i++) {
        this.connect(rooms[i]);
    }
};

/**
 * Sets the location to the given x and y values
 * @param x Value to set LocX to
 * @param y Value to set LocY to
 */
Room.prototype.setLocation = function (x, y) {
    this.locY = y;
    this.locX = x;
};

/**
 * Calculates the area of this room and all rooms it's connected to, excluding rooms given as a paremeter
 * @param usedRooms list of rooms to exclude
 * @returns {number|*} The area of this room and rooms that connect to it
 */
Room.prototype.calcTotalArea = function(usedRooms) {
    var toReturn = this.area;
    //console.log(this.name);
    //console.log(this.area);
    usedRooms.push(this);
    for (var i = 0; i < this.adjacent.length; i++) {
        var nextRoom = this.adjacent[i];
        //console.log(nextRoom);
        if (!usedRooms.includes(nextRoom)) {
            toReturn += nextRoom.calcTotalArea(usedRooms.slice());
            //console.log("here");
        }
    }
    this.totalArea = toReturn;
    return toReturn;
};

/**
 * Returns the area of the intersection between the given rectangle and the room
 * @param rectangle A rectangle of the the form: {right: *, left: *, top: *, bottom: *, area: *}
 * @returns {number} the area of the intersecting space
 */
Room.prototype.intersection = function (rectangle) {
    if (this.locX < -9999 || this.locY < -9999) return 0;
    var right = this.width + this.locX;
    var bottom = this.height + this.locY;
    var top = this.locY;
    var left = this.locX;

    var xOverlap = Math.max(0, Math.min(rectangle.right, right) - Math.max(rectangle.left, left));
    var yOverlap = Math.max(0, Math.min(rectangle.bottom, bottom) - Math.max(rectangle.top, top));

    return xOverlap * yOverlap;
};

/**
 * Rotates the room by 90 degrees
 */
Room.prototype.rotate = function () {
    this.corners = this.makeRectangle(this.height, this.width);
};

/**
 * Prints out the room and all of it's descendants
 */
Room.prototype.printTree = function(string) {
    var tab = typeof string != 'string' ? "" : string;
    console.log(tab + this.name);
    for (var i = 0; i < this.adjacent.length; i++) {
        var current = this.adjacent[i];
        current.printTree(tab + "   ");
    }
}
