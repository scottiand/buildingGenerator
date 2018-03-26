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
    console.log("X: " + event.clientX / scale + " Y: " + event.clientY / scale);
}

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
