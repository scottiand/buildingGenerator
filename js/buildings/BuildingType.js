/*
Defines parameters for a given type of building, including rules for room selection and placement
 */

//BuildingTypes
var house;

/**
 * Initializes the buildingTypes
 */
function initBuildingTypes() {
    house = initHouse();
}

/**
 * Initializes a BuildingType with no rules or roomTypes
 * @param name The string name of the building
 * @param avgPlotSize The average plot size of this building
 * @param plotSnap How far a room can stretch to touch the plot
 * @param roomSnap How far a room can stretch to match other rooms
 * @param cyclingPrivacy How public a room must be to add cycling
 * @param cyclingChance How likely an extra door is to be added when possible
 * @param doorSpace How much space doors must be given
 * @param maxFloors The maximum number of floors
 * @constructor
 */
function BuildingType(name, avgPlotSize, plotSnap, roomSnap, cyclingPrivacy, cyclingChance, doorSpace, maxFloors) {
    this.name = name;
    this.avgPlotSize = avgPlotSize;
    this.plotSnap = plotSnap;
    this.roomSnap = roomSnap;
    this.cyclingPrivacy = cyclingPrivacy;
    this.cyclingChance = cyclingChance;
    this.doorSpace = doorSpace;
    this.maxFloors = maxFloors;
    this.roomTypes = [];
    this.roomChoiceRules = []; // Use the RoomChoiceRule function
    this.connectivityRules = [];
    this.connectivityRulesUpstairs = [];
    this.addOutsideDoors = function (building, yardList) {
        // Replace with a function that does something in the init function for this buildingType
    };
    this.fillSmallGaps = function (building, rect, floor) {
        // Replace with a function that does something in the init function for this buildingType
    };
    this.finalRules = [];
}

/**
 * Adds given roomTypes to the RoomType list
 */
BuildingType.prototype.addRoomTypes = function() {
    for (var i = 0; i < arguments.length; i++) this.roomTypes.push(arguments[i]);
};

/**
 * Adds given functions to the connectivityRule list
 */
BuildingType.prototype.addConnectivityRules = function() {
    for (var i = 0; i < arguments.length; i++) this.connectivityRules.push(arguments[i]);
};

/**
 * Adds given functions to the connectivityRulesUpstairs list
 */
BuildingType.prototype.addConnectivityRulesUpstairs = function() {
    for (var i = 0; i < arguments.length; i++) this.connectivityRulesUpstairs.push(arguments[i]);
};

/**
 * Adds given functions to the finalRules list
 */
BuildingType.prototype.addFinalRules = function() {
    for (var i = 0; i < arguments.length; i++) this.finalRules.push(arguments[i]);
};
