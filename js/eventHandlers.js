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
}
