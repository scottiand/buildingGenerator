// Scotti Anderson
// Building
// Buildings represent the entire plot and contain functions to generate the floor plan
//

var plotSize = 50;

function Building() {
    this.plot = {width:0, height:0, area: 0};
    this.minPlotPortion = 0;
    this.maxPlotPortion = 0;
    this.area = 0;
    this.roomTypes = [greatRoom,bathroom,bedroom,kitchen,diningRoom]; // Eventually get this from BuildingType
    this.rules = [bedBathAndBeyondRule, diningAndKitchenRule]; // Eventually get this from BuildingType
    this.protoRooms = [];
    this.roomList = new RoomList();
    this.entry;
    //this.build();
}

// Creates the Building and draws it into the canvas
Building.prototype.build = function () {
    this.addPlot(plotSize);
    this.generateRoomList();
    this.generateConnectivityGraph();
    this.placeRooms();
    this.drawRooms(context);
}

// Generates the plot and calculates the minPlotPortion and maxPlotPortion
Building.prototype.addPlot = function (plotSize) {
    this.plot.width = randGauss(plotSize,5);
    this.plot.height = randGauss(plotSize,5);
    this.plot.area = this.plot.width * this.plot.height;
    canvas.width = this.plot.width * scale;
    canvas.height = this.plot.height * scale;
    this.minPlotPortion = this.plot.area * 0.6; // Calculate this based on density at a later date
    //console.log("height: " + this.plot.height);
    //console.log("width: " + this.plot.width);
    //console.log("area: " + this.plot.area);
    //console.log("minPlotPortion: " + this.minPlotPortion);
    this.maxPlotPortion = this.plot.area * 0.8 // Calculate this based on density at a later date
}

Building.prototype.generateRoomList = function () {
    this.initializeRoomPrototypes();
    this.addRoomsToList();
    //console.log(this.roomList);
    if (this.area > this.maxPlotPortion) {
        this.trimSize(); // So far, does absolutely nothing
    }
}

Building.prototype.generateConnectivityGraph = function () {
    this.createSubtrees();
    this.connectSubtrees();
}

Building.prototype.placeRooms = function () {
    var roomQueue = [];

    // Place the first room
    var firstRoom = this.roomList.peek();
    var XCenter = this.plot.width / 2;
    var XOffset =  randGauss(0, 5) - (firstRoom.width / 2);
    var YOffset = Math.abs(randGauss(5, 5)) + firstRoom.height;
    firstRoom.setLocation(XCenter + XOffset, this.plot.height - YOffset);
    firstRoom.isPlaced = true;


    for (var i = 0; i < firstRoom.adjacent.length; i++) {
        var room = firstRoom.adjacent[i];
        if (!room.isPlaced()) {
            roomQueue.push(room);
        }
    }
}

Building.prototype.drawRooms = function (context) {
    for (var i = 0; i < this.roomList.length; i++) {
        this.roomList.get(i).draw(context);
    }
}

// Creates ProtoRooms for use in addRoomsToList
Building.prototype.initializeRoomPrototypes = function () {
    for (var i = 0; i< this.roomTypes.length; i++) {
        this.protoRooms.push(new ProtoRoom(this.roomTypes[i]));
    }
    //console.log(this.protoRooms);
}

// Adds rooms to the list such that the total room size fits inside the given percentage of the plot
Building.prototype.addRoomsToList = function () {
    while (this.area < this.minPlotPortion) {
        this.protoRooms.sort(ComparePriority);
        var room = new Room(this.protoRooms[0]);
        this.roomList.push(room);
        this.protoRooms[0].priority += this.protoRooms[0].delay;
        this.area += room.area;
    }
}

Building.prototype.trimSize = function () {
    // To do at a later date
}

// Builds subtrees based on the building's rules
Building.prototype.createSubtrees = function () {
    for (var i = 0; i < this.rules.length; i++) {
        this.rules[i](this);
    }
}

// Connects the subtrees based on privacy
Building.prototype.connectSubtrees = function () {
    this.roomList.sort();
    this.entry = this.roomList.peek();
    //console.log(this.roomList);
    for (var i = 1; i < this.roomList.length; i++) {
        var toConnect;
        var lowScore = Infinity;
        for (var j = 0; j < this.roomList.length; j++) {
            if (j != i) {
                var currentRoom = this.roomList.get(j);
                var score = currentRoom.privacy;
                score += currentRoom.adjacent.length * 10;
                if (currentRoom.purpose === "hallway") {
                    score -= 50;
                }
                if (score < lowScore) {
                    lowScore = score;
                    toConnect = currentRoom;
                }
            }
        }
        this.roomList.get(i).connect(toConnect);
    }
}

function bedBathAndBeyondRule(building) {
    var roomList = building.roomList;
    while (roomList.contains("bedroom")) {
        var num = roomList.countAllOf("bedroom");
        var shortList = [];
        var rand = Math.random();
        // Get some number of bedrooms and remove them from the list
        if (num <= 2) {
            shortList = roomList.removeAllOf("bedroom");
        } else if (rand < 0.1) {
            shortList = roomList.removeSomeOf("bedroom",5);
        } else if (Math.random() < 0.3) {
            shortList = roomList.removeSomeOf("bedroom",4);
        } else if (Math.random() < 0.6) {
            shortList = roomList.removeSomeOf("bedroom",3);
        } else {
            shortList = roomList.removeSomeOf("bedroom",2);
        }
        // Get a bathroom and remove it to the list
        var bath = roomList.contains("bathroom") ? roomList.removeFirstOf("bathroom") : null;
        if (bath != null) {
            shortList.push(bath);
        }
        var hall = new Room(new ProtoRoom(hallway));
        hall.connectAll(shortList);
        building.area += hall.area;
        roomList.push(hall);
    }
}

function diningAndKitchenRule(building) {
    var roomList = building.roomList;
    var i = roomList.countAllOf("kitchen");
    var j = roomList.countAllOf("dining");
    if (j < i) {
        i = j;
    }
    // Do until we run out of dining rooms or kitchens
    for (var k = 0; k < i; k++){
        var kitch = roomList.removeFirstOf("kitchen");
        var din = roomList.getFirstOf("dining");
        din.connect(kitch);
    }
}
