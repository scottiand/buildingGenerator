function nonZero(number) {
    return number != 0;
}

function testRun(tries) {
    var failure = 0;
    for (var i = 0; i < tries; i++) {
        seedEntry.value = i;
        failure += generateButtonOnClick(false);
    }
    console.log("Average Failure = " + failure / tries);
}
