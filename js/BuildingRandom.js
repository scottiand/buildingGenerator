/*
Functions that deal with the random number generation
 */

// Used for the randGuass function
var useLast;
var y2;
var truncation = 1000;

/**
 * Returns a random value between 0 (inclusive) and 1 (exclusive), such that generates numbers have a normal distribution
 * Algorithm by Dr. Everett (Skip) Carter Jr.
 * http://www.design.caltech.edu/erik/Misc/Gaussian.html
 * @param mean The number at the height of the normal curve
 * @param standDev The size of a single standard deviation
 * @returns {number} A random number between 0 (inclusive) and 1 (exclusive)
 */
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
    return Math.round((mean + y1 * standDev) * truncation) / truncation;
}

/**
 * Initialize the Math.random function to work from a given string
 * Uses David Bau's seedrandom.js
 * https://github.com/davidbau/seedrandom
 * @param string The string to act as the random seed
 */
function initRandom(string) {
    Math.seedrandom(string);
}

/**
 * Returns a random int between 0 (inclusive) and max (exclusive)
 * @param max The limit for the number being generated
 * @returns {number} An integer between 0 (inclusive) and max (exclusive)
 */
function randInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Returns a random number between 0 (inclusive) and max (exclusive)
 * @param max The limit for the number being generated
 * @returns {number} A number between 0 (inclusive) and max (exclusive)
 */
function randDoub(max) {
    var num = Math.round(Math.random() * max * truncation) / truncation;
    if (num > max) {
        return randDoub(max);
    }
    return num;
}

/**
 * Has a chance of returning true based on the given percentage
 * A random number is generated. If it is lower than the given percentage, it returns true.
 * @param percent
 * @returns {boolean}
 */
function percentChance(percent) {
    var num = randDoub(100);
    return num < percent;
}
