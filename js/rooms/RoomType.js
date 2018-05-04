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
var garage;
var laundryRoom;
var familyRoom;
var livingRoom;
var foyer;
var mudRoom;
var study;
var office;
var masterBedroom;
var masterBathroom;

var hallway;
var closet;
var stairwell;
var dummy;

// Must call to initialize global RoomType variables
// ("Name", "Purpose", privacy, priority, delay, avgSize, minSize, maxSize, sizeVariance, scaleFactor)
function initRoomTypes() {
    testRoomType = new RoomType("Test","test",0,0,10,10,10,100,10,1);
    testRoomTypeEmpty = new RoomType();

    greatRoom = new RoomType("Great Room","lounge",20,20,9999, 18, 15, 30, 4, 1);
    bathroom = new RoomType("Bathroom","bathroom",80,0,60,6, 4, 12, 1, 1);
    bedroom = new RoomType("Bedroom","bedroom",100, 0, 40, 10, 8, 16, 2, 1);
    kitchen = new RoomType("Kitchen","kitchen",40,0,9999,10,5,20,2,1);
    diningRoom = new RoomType("Dining Room","dining",30,20,200,13,10,20,3,1);
    // New Rooms
    garage = new RoomType("Garage", 'garage', 10, 40, 9999, 25, 20, 35, 5, 1);
    laundryRoom = new RoomType('Laundry', 'laundry', 50, 30, 200, 6, 4, 8, 1, 1);
    familyRoom = new RoomType('Family Room', 'lounge', 25, 20, 9999, 18, 15, 30, 4, 1);
    livingRoom = new RoomType('Living Room', 'lounge', 15, 20, 9999, 18, 15, 30, 4, 1);
    foyer = new RoomType('Foyer', 'entrance', 0, 30, 9999, 9, 6, 15, 2, 1);
    mudRoom = new RoomType('Mudroom', 'entrance', 0, 25, 9999, 4, 6, 10, 1, 1);
    study = new RoomType('Study', 'office', 75, 40, 150, 10, 5, 15, 2, 1);
    office = new RoomType('Office', 'office', 85, 40, 150, 8, 5, 12, 2, 1);
    masterBedroom = new RoomType("Master Bedroom", "bedroom", 100, 0, 9999, 12, 10, 18, 2, 1);
    masterBathroom = new RoomType("Master Bath","bathroom",80,0,9999,8, 6, 16, 1, 1);

    // Special Rooms
    hallway = new RoomType("Hallway","hallway",50,200,100,6,4,8,1,1);
    closet = new RoomType("Closet","storage", 80, 100, 50, 4, 3, 8, 1, 1);
    stairwell = new RoomType("Stairwell", 'stairwell', 50, 200, 100, 6, 4, 8, 1, 1);
    dummy = new RoomType("Dummy", "dummy", 0, 0,0,1,0,1000,1,1);
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


