/*
The plot represents the space that the building can be placed in
 */

/**
 * Creates a plot with random dimension based on the average plot size.
 * @param avgPlotSize
 * @constructor
 */
function Plot(avgPlotSize) {
    this.width = randGauss(avgPlotSize, avgPlotSize / 10);
    this.height = randGauss(avgPlotSize,avgPlotSize / 10);
    this.area = this.width * this.height;
}

/**
 * Returns the location of the side based on the given direction
 * @param direction
 * @returns {number}
 */
Plot.prototype.getSide = function (direction) {
    switch (direction) {
        case 'north':
            return 0;
        case 'south':
            return this.height;
        case 'east':
            return this.width;
        case 'west':
            return 0;
        default:
            throw("invalid direction: " + this.direction);
    }
};

