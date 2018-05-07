
/*
Represents different sizes of doors
Could be modified to allow different doors to draw differently as well
 */

// DoorTypes
var smallDoor;
var singleDoor;
var singleDoorSideLight;
var singleDoorDoubleSidelight;
var doubleDoor;

/**
 * Defines a door type
 * @param size The length of the door
 * @param privacy How public a room must be to use the doortype
 * @param draw The function used draw this DoorType
 * @constructor
 */
function DoorType(size, privacy, draw) {
    this.size = size;
    this.privacy = privacy;
    this.draw = draw;
}

/*
Initializes the DoorTypes
 */
function initDoorTypes() {
    smallDoor = new DoorType(2, Infinity, drawDoor);
    singleDoor = new DoorType(3.2, Infinity, drawDoor);
    singleDoorSideLight = new DoorType(4.2, 0, drawDoor);
    singleDoorDoubleSidelight = new DoorType(5.25, 0, drawDoor);
    doubleDoor = new DoorType(6.2, 0, drawDoor);
}

/**
 * Draws the door in the given context
 * But doors aren't drawn in this version, so really does nothing
 * @param context
 */
function drawDoor(context) {

}
