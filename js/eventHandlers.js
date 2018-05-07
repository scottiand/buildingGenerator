/*
Event handlers and other function dealing with the user interface
 */

/**
 * Generates a new building based on the seed entry
 */
function generateButtonOnClick(draw) {

    draw = typeof draw === 'undefined' ? true : draw;
    initRandom(seedEntry.value);
    failures = 0;
    currentBuilding = new Building(house);
    currentBuilding.draw = draw;
    while (!currentBuilding.build()) {
        currentBuilding = new Building(house);
        currentBuilding.draw = draw;
        failures++;
        initRandom(Math.random());
    }
    if (currentBuilding.draw) console.log("Failures: " + failures);
    return failures;
}

/**
 * Prints the mouse location to the console when the canvas is clicked
 */
function canvasClicked(event) {
    var rect = canvas.getBoundingClientRect();
    console.log("X: " + (event.clientX - rect.left - 3) / scale + " Y: " + (event.clientY - rect.top - 3)/ scale);
}

/**
 * Fires when the mouse is over the canvas.
 * Prints out the name of the room that that the mouse is over, or outside if there is no room
 * @param event
 */
function canvasMouseOver(event) {
    var output = document.getElementById('output');
    var rect = canvas.getBoundingClientRect();
    var room = currentBuilding.getRoomAtPoint((event.clientX - rect.left - 3) / scale, (event.clientY - rect.top - 3)/ scale, currentBuilding.selectedFloor);
    if (room != null) {
        output.innerText = room.name;
    } else {
        output.innerText = "Outside";
    }

}

/**
 * Initializes controls, must be called for the slider to funciton
 */
function initControls() {
    var slider = document.getElementById("myRange");
    slider.oninput = function () {
        scale = this.value / 10;
        canvas.width = currentBuilding.plot.width * scale;
        canvas.height =  currentBuilding.plot.height * scale;
        currentBuilding.drawRooms(context);
    };
}

/**
 * Shows the given floor in the canvas
 * @param event
 * @param number
 */
function openFloor(event, number) {
    context.clearRect(0,0,canvas.width,canvas.height);
    currentBuilding.selectedFloor = number;
    currentBuilding.drawRooms(context);
}

/**
 * Sets the floor tabs depending on the number of floors in the current building
 * Must be called each time a building is generated
 */
function setTabs() {
    var div = document.getElementById('tabs');
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    for (var i = 1; i <= currentBuilding.numFloors; i++) {
        //var num = i;
        var button = document.createElement('button');
        button.id = i.toString();
        button.innerText = 'Floor ' + i;
        div.appendChild(button);
        button.addEventListener('click', function (event) {
            var id = this.id;
            var num = parseInt(id);
            openFloor(event, num);
        });
    }
}
