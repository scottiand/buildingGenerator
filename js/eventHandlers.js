// Scotti Anderson
// eventHandlers
// Functions that respond to the use of UI controls
//

/**
 * Generates a new building based on the seed entry
 */
function generateButtonOnClick(draw) {
    draw = typeof draw === 'undefined' ? true : draw;
    initRandom(seedEntry.value);
    failures = 0;
    //var success = false;
    currentBuilding = new Building();
    currentBuilding.draw = draw;
    while (!currentBuilding.build()) {
        currentBuilding = new Building();
        currentBuilding.draw = draw;
        failures++;
        initRandom(Math.random());
    }
    if (currentBuilding.draw) console.log("Failures: " + failures);
    return failures;
}

/**
 * Prints the mouse location out when the canvas is clicked
 */
function canvasClicked(event) {
    var rect = canvas.getBoundingClientRect();
    console.log("X: " + (event.clientX - rect.left - 3) / scale + " Y: " + (event.clientY - rect.top - 3)/ scale);
}

function canvasMouseOver(event) {
    var output = document.getElementById('output');
    var rect = canvas.getBoundingClientRect();
    var room = currentBuilding.getRoomAtPoint((event.clientX - rect.left - 3) / scale, (event.clientY - rect.top - 3)/ scale);
    if (room != null) {
        output.innerText = room.name;
    } else {
        output.innerText = "Outside";
    }

}

/**
 * Initializes controlls (Currently only the scale slider)
 */
function initControls() {
    var slider = document.getElementById("myRange");
    slider.oninput = function () {
        scale = this.value / 10;
        canvas.width = currentBuilding.plot.width * scale;
        canvas.height =  currentBuilding.plot.height * scale;
        //canvas.clear();
        currentBuilding.drawRooms(context);
    };

}
