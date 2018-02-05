// Scotti Anderson
// Room Prototypes
// Used by buildings when creating the room list
//

function ProtoRoom(type) {
    if (typeof type != 'undefined') {
        this.type = Object.assign(type);
        this.name = this.type.name;
        this.purpose = this.type.purpose;
        this.privacy = this.type.privacy;
        this.priority = randGauss(this.type.priority,3);
        this.delay = randGauss(this.type.delay,3);
        this.avgSize = this.type.avgSize; // Eventually, vary this based on the plot size and the scale factor
        this.minSize = this.type.minSize;
        this.maxSize = this.type.maxSize;
        this.sizeVariance = this.type.sizeVariance;
    } else {
        throw "no RoomType provided";
    }
}

// A function for comparing based on priority for sorting
function ComparePriority(a, b) {
    if (a.priority < b.priority) {
        return -1;
    }
    if (a.priority > b.priority) {
        return 1;
    }
    return 0;
}
