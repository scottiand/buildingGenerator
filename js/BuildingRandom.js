// Scotti Anderson
// BuildingRandom
// A collection of functions regarding the production of random numbers
//
//

var useLast;
var y2;

// Returns a random value between 0 (inclusive) and 1 (exclusive), such that generates numbers have a normal distribution
// Algorithm by Dr. Everett (Skip) Carter Jr.
function randGauss(mean, standDev) {
    var x1, x2, w, y1;
    useLast = false;
    if (useLast) {
        y1 = y2;
        useLast = false;
    } else {
        do {
            x1 = 2.0 * Math.random() - 1.0;
            x2 = 2.0 * Math.random() - 1.0;
            w = x1 * x1 + x2 * x2;
        } while (w >= 1.0);
        w = Math.sqrt((-2.0 * Math.log(w))/w);
        y1 = x1 * w;
        y2 = x2 * w;
        useLast = true;
    }
    return (mean + y1 * standDev);
}

// Initialize the Math.random function to work from a given string
function initRandom(string) {
    Math.seedrandom(string);
}
