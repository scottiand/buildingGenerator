// Scotti Anderson
// eventHandlers
// Functions that respond to the use of UI controls
//

function generateButtonOnClick() {
    initRandom(seedEntry.value);
    failures = 0;
    var success = false;
    while (!success) {
        currentBuilding = new Building();
        success = currentBuilding.build();
        failures++;
        initRandom(Math.random());
    }
    console.log("Failures: " + failures);
}
