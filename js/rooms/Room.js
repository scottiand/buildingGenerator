// Scotti Anderson
// Room
// Setup for Rooms, which represent individual rooms
//

// Generates a room based on a given room proto, with randomized size
// proto: RoomTypes, determines many aspects of the room
// privacy: determines the order of placement of rooms
// priority: determines the order in which the room is placed
// delay: determines the frequency of this room
// length: the length of one side of the room
// width: the width of one side of the rom
// locX: the horizontal position of the room. -1 means not yet placed
// locY: the vertical position of the room. -1 means not yet placed
// adjacent: a list a rooms to connect to this room
// isPlaced: keeps track of if the room has been placed in space yet (maybe unnecessary)
function Room(proto) {

    if (typeof proto != 'undefined') {
        this.proto = Object.assign(proto);;
        this.name = this.proto.name;
        this.purpose = this.proto.purpose;
        this.privacy = this.proto.privacy;
        this.area = 0;
        this.width = 0;
        this.height = 0;
        this.corners = this.makeRectangle();
        this.locX = -1;// Change these to negative one later on
        this.locY = -1;
        this.adjacent = [];
        this.isPlaced = false;
    } else {
        throw "no ProtoRoom provided";
    }
}

// Returns a list of points that represent the corners of a rectangle, with randomly determined length and width
Room.prototype.makeRectangle = function () {
    var corners = [];
    var width = -1;
    while (width < this.proto.minSize || width > this.proto.maxSize) {
        width = randGauss(this.proto.avgSize,this.proto.sizeVariance);
    }
    var height = -1;
    while (height < this.proto.minSize || height > this.proto.maxSize) {
        height = randGauss(this.proto.avgSize,this.proto.sizeVariance)
    }
    this.area = width * height;
    this.width = width;
    this.height = height;
    corners.push({x:0,y:0});
    corners.push({x:width,y:0});
    corners.push({x:width,y:height});
    corners.push({x:0,y:height});
    return corners;
}

// Draws the room in the given context
Room.prototype.draw = function (context) {
    context.moveTo(this.locX * scale, this.locY * scale);
    for (var i = 0; i < this.corners.length; i++) {
        context.lineTo((this.locX + this.corners[i].x)  * scale, (this.locY + this.corners[i].y)  * scale)
    }
    context.lineTo(this.locX * scale, this.locY * scale);
    context.stroke();
};

// Prints all the variables to the console.
Room.prototype.printToConsole = function () {
    console.log("proto: " + this.proto.name + "\n" +
        "locX: " + this.locX + "\n" +
        "locY: " + this.locY + "\n");
};

// Adds a room to the adjacent of this room
Room.prototype.connect = function (room) {
    room.adjacent = typeof room.adjacent === 'undefined' ? [] : room.adjacent;
    room.adjacent.push(this);
    this.adjacent.push(room);
};

// Adds a list of rooms to the adjacent of this room
Room.prototype.connectAll = function (rooms) {
    for (var i = 0; i < rooms.length; i++) {
        //console.log(rooms[i]);
        this.connect(rooms[i]);
    }
};

// Sets the location to the given x and y values
Room.prototype.setLocation = function (x, y) {
    this.locY = y;
    this.locX = x;
}

// A function for comparing based on privacy for sorting
function ComparePrivacy(a, b) {
    if (a.privacy < b.privacy) {
        return -1;
    }
    if (a.privacy > b.privacy) {
        return 1;
    }
    return 0;
}
