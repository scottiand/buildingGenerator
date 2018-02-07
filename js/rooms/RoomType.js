// Scotti Anderson
// RoomType
// Setup for RoomTypes, which will be an attribute of rooms
//
//

// Room Types
var testRoomType;
var testRoomTypeEmpty;
var greatRoom;
var bathroom;
var bedroom;
var kitchen;
var diningRoom;
var hallway;

// Must call to initialize global RoomType variables
// ("Name", "Purpose", privacy, priority, delay, avgSize, minSize, maxSize, sizeVariance, scaleFactor)
function initRoomTypes() {
    testRoomType = new RoomType("Test","test",0,0,10,50,35,100,10,1);
    testRoomTypeEmpty = new RoomType();
    greatRoom = new RoomType("Great Room","lounge",20,20,9999, 20, 10, 50, 4, 1);
    bathroom = new RoomType("Bathroom","bathroom",80,0,60,8, 4, 12, 1, 1);
    bedroom = new RoomType("Bedroom","bedroom",100, 0,40, 12, 8, 18, 2, 1);
    kitchen = new RoomType("Kitchen","kitchen",40,0,9999,15,10,40,2,1);
    diningRoom = new RoomType("Dining Room","dining",30,0,200,20,10,40,3,1);
    hallway = new RoomType("Hallway","hallway",60,200,100,6,4,8,1,1);
}

// name: the name of the proto of room, e.g. "foyer", "dining room", "bedroom"
// privacy: rooms with higher privacy are placed deeper in the house
// priority: rooms with lower priority are placed sooner
// delay: added to priority after room is placed, controls the likelihood of having multiple of the same room
// avgSize: the average size of a room
// minSize: the smallest dimension a room of this proto can have
// maxSize: the largest dimension a room of this proto can have
// sizeVariance: How much the room can vary from the average, represented as a standard deviation
// scaleFactor: determine if the room gets larger when the Building does, or stays the same regardless

function RoomType(name, purpose,privacy, priority, delay, avgSize, minSize, maxSize, sizeVariance, scaleFactor) {
    // Members:
    this.name = typeof name === 'undefined' ? "" : name;
    this.purpose = typeof purpose === 'undefined' ? "" : purpose;
    this.privacy = typeof privacy === 'undefined' ? 0 : privacy;
    this.priority = typeof priority === 'undefined' ? 0 : priority;
    this.delay = typeof delay === 'undefined' ? 20 : delay;
    this.avgSize = typeof avgSize === 'undefined' ? 75 : avgSize;
    this.minSize = typeof minSize === 'undefined' ? 20 : minSize;
    this.maxSize = typeof maxSize === 'undefined' ? 100 : maxSize;
    this.sizeVariance = typeof sizeVariance === 'undefined' ? 60 : sizeVariance;
    this.scaleFactor = typeof scaleFactor === 'undefined' ? 1 : scaleFactor;
}

//Prints all the variables to the console.
RoomType.prototype.printToConsole = function () {
    console.log("name: " + this.name + "\n" +
        "purpose: " + this.purpose + "\n" +
        "privacy: " + this.privacy + "\n" +
        "priority: " + this.priority + "\n" +
        "delay: " + this.delay + "\n" +
        "avgSize: " + this.avgSize + "\n" +
        "sizeVariance: " + this.sizeVariance + "\n" +
        "scaleFactor: " + this.scaleFactor + "\n");
};


