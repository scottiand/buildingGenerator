// Scotti Anderson
// Room Prototypes
// Used by buildings when creating the room list
//

/**
 * Prototype for rooms.
 * The midpoint between room types and rooms. Prototypes have randomized priority and delay values, to increase the variety of house layouts
 * @param type The RoomType that the prototype is based on
 * @constructor
 */
function ProtoRoom(type) {
    if (typeof type != 'undefined') {
        this.type = Object.assign(type);
        this.name = this.type.name;
        this.purpose = this.type.purpose;
        this.privacy = this.type.privacy;
        this.priority = randGauss(this.type.priority,5);
        this.delay = randGauss(this.type.delay,5);
        this.avgSize = this.type.avgSize; // Eventually, vary this based on the plot size and the scale factor
        this.minSize = this.type.minSize;
        this.maxSize = this.type.maxSize;
        this.sizeVariance = this.type.sizeVariance;
    } else {
        throw "no RoomType provided";
    }
}

/**
 * Calculates the avg area based on the average size
 * @returns {number} The average area
 */
ProtoRoom.prototype.avgArea = function () {
    return this.avgSize * this.avgSize;
};
