// Scotti Anderson
// eventHandlers
// Functions that respond to the use of UI controls
//

function generateButtonOnClick() {
    initRandom(seedEntry.value);
    currentBuilding = new Building();
    currentBuilding.build();
}
