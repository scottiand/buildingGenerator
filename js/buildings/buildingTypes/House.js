
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

function upstairsBedroomRule(building) {
    //console.log('upstairsBedroomRule');
    console.log('upstairsBedroomRule()');
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
    choice.elevate(2);
    choice.setPlacedForAll(false);
    building.push(stairwellOne);
    stairwellTwo.floor = building.numFloors;
    stairwellTwo.connect(choice);

    building.push(stairwellTwo);
    building.connectSubtrees(building.numFloors - 1);
}
