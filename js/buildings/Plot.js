
function Plot(avgPlotSize) {
    this.width = randGauss(avgPlotSize,5);
    this.height = randGauss(avgPlotSize,5);
    this.area = this.width * this.height;
}

/**
 * Returns the location of the side based on the given direction
 * @param direction
 * @returns {*}
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

