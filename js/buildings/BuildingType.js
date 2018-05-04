
var house;

/**
 * Initializes the buildingTypes
 */
function initBuildingTypes() {
    house = initHouse();
}

/**
 * Initializes a BuildingType with no rules or roomTypes
 * @param name
 * @param avgPlotSize
 * @param plotSnap
 * @param roomSnap
 * @param cyclingPrivacy
 * @param cyclingChance
 * @param doorSpace
 * @param maxFloors
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
