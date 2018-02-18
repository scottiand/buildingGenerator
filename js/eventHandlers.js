// Scotti Anderson
// eventHandlers
// Functions that respond to the use of UI controls
//

/**
 * Generates a new building based on the seed entry
 */
function generateButtonOnClick() {
    initRandom(seedEntry.value);
    failures = 0;
    //var success = false;
    currentBuilding = new Building();
    while (!currentBuilding.build()) {
        currentBuilding = new Building();
        failures++;
        initRandom(Math.random());
    }
    console.log("Failures: " + failures);
    return failures;
}

/**
 * Prints the mouse location out when the canvas is clicked
 */
function canvasClicked(event) {
    console.log("X: " + event.clientX / scale + " Y: " + event.clientY / scale);
}
