// Scotti Anderson
// Main
// Starting point for the program. Initializes important globals.
//


// Global Variables
var canvas;
var context;
var seedEntry;
var currentBuilding;
var scale = 6;

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
    currentBuilding.build();

    // Testing stuff
    //var roomType = new RoomType();
    //var room = new Room(testRoomType);
    //room.printToConsole();
    //room.draw(context);
};


