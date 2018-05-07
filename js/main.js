/*
The starting point for the program. Call the many initiation function that must occur for the program to function
 */

// Global Variables
var canvas;
var context;
var seedEntry;
var currentBuilding;
var scale = 8;
var failures = 0;

/**
 * Setup function; initializes global variables
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

};


