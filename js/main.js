// Scotti Anderson
// Main
// Starting point for the program. Initializes important globals.
//


// Global Variables
var canvas;
var context;
var seedEntry;
var currentBuilding;
var scale = 8;
var failures = 0;

// Start here
window.onload = function init() {
    // Initialize global variables, DO NOT DELETE
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    seedEntry = document.getElementById("seedEntry")
    initRoomTypes();
    initRandom(seedEntry.value);

    // Create the first Building, from the default values
    currentBuilding = new Building();

    // var room = new Room(new ProtoRoom(testRoomType));
    // room.locY = 5;
    // room.locX = 5;
    // room.draw(context);
    // //console.log(room.corners);
    // for (var i = 0; i < room.corners.length; i++) {
    //     console.log(room.corners[i]);
    // }
    // room.rotate();
    // for (var i = 0; i < room.corners.length; i++) {
    //     console.log(room.corners[i]);
    // }
    // room.draw(context);

   while (!currentBuilding.build()) {
       currentBuilding = new Building();
       failures++;
       initRandom(Math.random());
    }
    console.log("Failures: " + failures);

    // Testing stuff
    //var roomType = new RoomType();
    //var room = new Room(testRoomType);
    //room.printToConsole();
    //room.draw(context);

    // var test = [canvas, seedEntry, currentBuilding, scale];
    // console.log(test.includes(currentBuilding));
    // console.log(test.includes(new Building()));
};


