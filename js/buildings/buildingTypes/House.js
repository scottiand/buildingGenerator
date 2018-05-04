
function initHouse() {
    var house = new BuildingType('House', 50, 4, 8, 50, 40, 0.5, 2);
    //house.addRoomTypes(greatRoom,bathroom,bedroom,kitchen,diningRoom);
    house.addRoomTypes(greatRoom,bathroom,bedroom,kitchen,diningRoom, garage,
        laundryRoom, familyRoom, livingRoom, mudRoom, foyer, study, office);
    var roomChoiceRules = [];
    roomChoiceRules.push(new RoomChoiceRule('lounge', 0, 1));
    roomChoiceRules.push(new RoomChoiceRule('bathroom', 1, Infinity));
    roomChoiceRules.push(new RoomChoiceRule('bedroom', 1, Infinity));
    roomChoiceRules.push(new RoomChoiceRule('kitchen', 1, 1));
    roomChoiceRules.push(new RoomChoiceRule('dining', 1, 1));
    //roomChoiceRules.push(new RoomChoiceRule('garage', 0, 1));
    roomChoiceRules.push(new RoomChoiceRule('laundry', 0, 1));
    roomChoiceRules.push(new RoomChoiceRule('entrance', 0, 1));
    roomChoiceRules.push(new RoomChoiceRule('office', 0, 1));
    house.roomChoiceRules = roomChoiceRules;
    house.addConnectivityRules(bedBathAndBeyondRule, diningAndKitchenRule);
    house.addConnectivityRulesUpstairs(upstairsBedroomRule);
    house.addOutsideDoors = outsideDoorsRuleHouse;
    house.fillSmallGaps = fillGapWithClosets;
    house.placeFirstRoom = placeFirstRoomHouse;
    return house;
}


// CONNECTIVITY RULES
function bedBathAndBeyondRule(building) {
    var roomList = building.getFloor(1);
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
        //building.area += hall.area;
        building.push(hall);
    }
}

function diningAndKitchenRule(building) {
    var roomList = building.getFloor(1);
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

// UPSTAIRS RULES
function upstairsBedroomRule(building) {
    //console.log('upstairsBedroomRule');
    var roomList = building.getFloor(building.numFloors - 1);
    var candidates = [];
    for (var i = 0; i < roomList.length; i++) {
        var room = roomList.get(i);
        var score = 0;
        if (room.purpose === 'bedroom') score += 15;
        if (room.purpose === 'hallway') score += 10;
        if (room.purpose === 'kitchen') score -= 100;
        score += purposeCount(room.adjacent, 'bedroom') * 10;
        score -= purposeCount(room.adjacent, 'kitchen') * 40;
        candidates.push({room: room, score: score});
    }
    candidates.sort(compareScore);
    candidates.reverse();
    var choice = candidates[0].room;
    //console.log(choice);

    roomList.remove(roomList.getIndexOf(choice));
    var stairwellOne = stairwellRoom();
    stairwellOne.floor = building.numFloors - 1;
    var stairwellTwo = stairwellRoom();
    choice.elevate(2, building);
    choice.setPlacedForAll(false);
    building.push(stairwellOne);
    stairwellTwo.floor = building.numFloors;
    stairwellTwo.connect(choice);

    building.push(stairwellTwo);
    building.connectRoom(stairwellOne, building.getAllRooms(building.numFloors - 1));
    //building.connectSubtrees(building.numFloors - 1);
}

// OUTSIDE DOORS RULE
function outsideDoorsRuleHouse(building, yardList) {
    if (yardList.length === 1) {
        outsideDoorsRuleHouseSingleYard(building);
    } else {
        outsideDoorsRuleHouseMultipleYards(building, yardList);
    }
}

function outsideDoorsRuleHouseSingleYard(building) {
    var edges = building.getOutsideEdges(1);
    edges.sort(sortEdgesByRoomPrivacy);
    if (edges[0].room.purpose === 'wall') edges.splice(0, 1);
    addOutsideDoor(edges[0]);
    edges.splice(0,1);
    if (Math.random() > 0.5) addOutsideDoor(edges[0]);
}

function outsideDoorsRuleHouseMultipleYards(building, yardList) {
    for (var i = 0; i < yardList.length; i++) {
        var yard = yardList[i];
        var currentLocation = {x: yard.x2, y: yard.y2};
        var adjacentEdges = [];
        var edges = building.getOutsideEdges(1);
        var currentEdge = removeEdge(edges, currentLocation);
        // console.log("Edges");
        // console.log(edges.toString());
        if (currentEdge !== null) {
            while (currentLocation.x !== yard.x1 || currentLocation.y !== yard.y1) {
                if (currentEdge === null) break;
                if (!(currentEdge.room.purpose === 'wall')) adjacentEdges.push(currentEdge);
                currentLocation = currentEdge.getOtherPoint(currentLocation);
                currentEdge = removeEdge(edges, currentLocation);

            }
            adjacentEdges.sort(sortEdgesByRoomPrivacy);
            var publicEdges = [adjacentEdges[0]];
            var count = 1;
            while (count < adjacentEdges.length && adjacentEdges[0].room.privacy === adjacentEdges[count].room.privacy) {
                publicEdges.push(adjacentEdges[count]);
                count++;
            }
            var edgeToPlaceDoor = publicEdges[randInt(publicEdges.length)];
            addOutsideDoor(edgeToPlaceDoor);
        }
    }
}

// FILL GAPS WITH CLOSETS
function fillGapWithClosets(building, rect, floor) {
    if (typeof(floor) === "undefined") floor = 1;
    while (rect.area > 0) {
        // Create a closet room to put into the gap
        var newRoom = new Room(new ProtoRoom(closet));
        newRoom.setLocation(rect.left, rect.top);
        newRoom.floor = floor;
        var filledGap = false;

        // If the closet can fill the space, stretch it to fit and move on
        if (rect.width <= newRoom.proto.maxSize) {
            newRoom.stretch(rect.right, 'east', true);
            filledGap = true;
        } else {
            rect = new Rectangle(newRoom.right(), rect.top, rect.width - newRoom.width, rect.height);
        }
        if (rect.height <= newRoom.proto.maxSize) {
            newRoom.stretch(rect.bottom, 'south', true);
            if (filledGap) {
                rect = new Rectangle(0,0,0,0);
            }
        } else {
            rect = new Rectangle(rect.left, newRoom.bottom(), rect.width, rect.height - newRoom.height);
        }
        building.push(newRoom);
        newRoom.isPlaced = true;
        // Select an adjacent room and add a door
        var connectedRooms = newRoom.getContactingRooms(this);
        var candidates = [];
        for (var i = 0; i < connectedRooms.length; i++) {
            var room = connectedRooms[i];
            var direction = room.getDirectionFrom(newRoom);
            var overlap = getOverlap(newRoom, room, direction);
            if (overlap.length >= 3) {
                var score = 0;
                if (room.purpose === 'bedroom') score += 10;
                if (room.purpose === 'kitchen') score += 20;
                if (room.purpose === 'hallway') score += 20;
                if (room.purpose === 'storage') score -= 1000;
                if (room.purpose === 'bathroom') score -= 20;
                if (hasPurpose(room.adjacent, 'storage')) score -= 50;
                score -= room.doorCount() * 10;
                candidates.push({room: room, score: score});
            }
        }

        if (candidates.length > 0) {

            candidates.sort(compareScore);
            candidates.reverse();
            var choice = candidates[0].room;

            var newDoor = new Door(choice, newRoom,  choice.getDirectionFrom(newRoom));

            if (choice.purpose === 'kitchen' || choice.purpose === 'dining') newRoom.name = 'Pantry';
            if (purposeCount(choice.adjacent, 'storage') > 0) { // If a room would gain additional closet, expand that room instead
                //console.log('here');
                newDoor.expanded = true;
                newRoom.name = "";
                newRoom.purpose = choice.purpose;
                if (!(rect.area === 0)) {
                    if (rect.width !== newRoom.width) newRoom.stretch(newRoom.getSide('east') + rect.width, 'east',true);
                    if (rect.height !== newRoom.height) newRoom.stretch(newRoom.getSide('south') + rect.height, 'south',true);
                    rect = new Rectangle(0,0,0,0);
                }
                newDoor.overlap = newDoor.calcOverlap();
                takeDownWall(newDoor);
            }

            building.doors.push(newDoor);
            choice.connect(newRoom);

        }

    }
}

// PLACE FIRST ROOM
function placeFirstRoomHouse(building, firstRoom) {
    var floor = firstRoom.floor;
    if (floor === 1) {
        var validPlacement = false;
        while (!validPlacement) {
            var XCenter = building.plot.width / 2;
            var XOffset = randGauss(0, 5) - (firstRoom.width / 2);
            var YOffset = Math.abs(randGauss(0, 10)) + firstRoom.height;
            firstRoom.setLocation(XCenter + XOffset, building.plot.height - YOffset);
            validPlacement = (firstRoom.locX >= 0) && (firstRoom.locX <= this.plot.width - firstRoom.width) && (firstRoom.locY >= 0) && (firstRoom.locY <= this.plot.height - firstRoom.height);
        }
    } else {
        var longList = building.getFloor(floor - 1);
        //console.log(longList);
        var shortList = [];
        for (var i = 0; i < longList.length; i++) {
            if (longList.get(i).purpose === 'stairwell') shortList.push(longList.get(i));
        }
        if (shortList.length > 0) {
            var stairwell = shortList[0];
            firstRoom.setLocation(stairwell.locX, stairwell.locY);
            firstRoom.setSize(stairwell.width, stairwell.height);
        }

    }
    firstRoom.isPlaced = true;
}
