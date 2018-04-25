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

/**
 * Setup function; initializes global variables and generates the default building
 */
window.onload = function init() {
    // Initialize global variables, DO NOT DELETE
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    seedEntry = document.getElementById("seedEntry");
    initRoomTypes();
    initBuildingTypes();
    initRandom(seedEntry.value);
    initDoorTypes();
    initControls();
    // Create the first Building, from the default values
    currentBuilding = new Building(house);

    // while (!currentBuilding.build()) {
    //    currentBuilding = new Building();
    //    failures++;
    //    initRandom(Math.random());
    // }
    // console.log("Failures: " + failures);
    //testRun(10000);

    // Testing stuff
    //var roomType = new RoomType();
    //var room = new Room(testRoomType);
    //room.printToConsole();
    //room.draw(context);

    // var test = [canvas, seedEntry, currentBuilding, scale];
    // console.log(test.includes(currentBuilding));
    // console.log(test.includes(new Building()));

    // context.moveTo(30, 30);
    // context.lineTo(30, 35);
    // context.moveTo(30, 40);
    // context.lineTo(30,50);
    // context.stroke();
};


