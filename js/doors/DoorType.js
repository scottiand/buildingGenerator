
var smallDoor;
var singleDoor;
var singleDoorSideLight;
var singleDoorDoubleSidelight;
var doubleDoor;

function DoorType(size, privacy, draw) {
    this.size = size;
    this.privacy = privacy;
    this.draw = draw;
}

function initDoorTypes() {
    smallDoor = new DoorType(2, Infinity, drawDoor);
    singleDoor = new DoorType(3.2, Infinity, drawDoor);
    singleDoorSideLight = new DoorType(4.2, 0, drawDoor);
    singleDoorDoubleSidelight = new DoorType(5.25, 0, drawDoor);
    doubleDoor = new DoorType(6.2, 0, drawDoor);
}

function drawDoor() {

}
