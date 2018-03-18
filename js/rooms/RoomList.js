// Scotti Anderson
// RoomList
// Wrapper for arrays that contains special function for extracting values
//

function RoomList() {
    this.content = [];
    this.length = this.content.length;
}

// Resets the length variable
RoomList.prototype.resetLength = function () {
    this.length = this.content.length;
};

// Pushes item into the list. Item should be a Room
RoomList.prototype.push = function (item) {
    this.content.push(item);
    this.resetLength();
};

// Returns the Room at the given index
RoomList.prototype.get = function (index) {
    return this.content[index];
};

// Returns the first Room (at index 0)
RoomList.prototype.peek = function () {
    return this.content[0];
};

// Returns true if any Room has the given purpose
RoomList.prototype.contains = function (purpose) {
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            return true;
        }
    }
    return false;
};

// Returns a list of all Rooms with the given purpose
RoomList.prototype.getAllOf = function (purpose) {
    var toReturn = [];
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            toReturn.push(this.content[i]);
        }
    }
    return toReturn;
};

// Removes and returns the Room at the given index
RoomList.prototype.remove = function (index) {
    var toReturn = this.content.splice(index,1)[0];
    this.resetLength();
    return toReturn;
};

// Removes and returns a list of all Rooms with the given purpose
RoomList.prototype.removeAllOf = function (purpose) {
    var toReturn = [];
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            toReturn.push(this.remove(i));
            i--;
        }
    }
    this.resetLength();
    return toReturn;
};

// Returns a count of all the Rooms with the given purpose
RoomList.prototype.countAllOf = function (purpose) {
    var toReturn = 0;
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            toReturn++;
        }
    }
    return toReturn;
};

// Returns [number] Rooms with the given purpose
RoomList.prototype.getSomeOf = function (purpose, number) {
    var toReturn = [];
    number = typeof number === 'undefined' ? 1 : number;
    if (number === 1) {
        return this.getFirstOf(purpose);
    }
    var count = 0;
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            toReturn.push(this.content[i]);
            count++;
        }
        if (count === number) {
            return toReturn;
        }
    }
    return toReturn;
};

// Returns the first Room with the given purpose
RoomList.prototype.getFirstOf = function(purpose) {
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            return this.content[i];
        }
    }
};

// Removes and returns [number] Rooms with the given purpose
RoomList.prototype.removeSomeOf = function (purpose, number) {
    var toReturn = [];
    number = typeof number === 'undefined' ? 1 : number;
    if (number === 1) {
        return this.removeFirstOf(purpose);
    }
    var count = 0;
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            toReturn.push(this.remove(i));
            count++;
        }
        if (count === number) {
            this.resetLength();
            return toReturn;
        }
    }
    this.resetLength();
    return toReturn;
};

/**
 * Removes the first Room with the given purpose
 * @param purpose The purpose of room to remove
 */
RoomList.prototype.removeFirstOf = function (purpose) {
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            var toReturn = this.remove(i);
            this.resetLength();
            return toReturn;
        }
    }
};

/**
 * Sorts the list by privacy
 */
RoomList.prototype.sort = function (func) {
    this.content.sort(func);
};

/**
 * Reverses the order of the list
 */
RoomList.prototype.reverse = function () {
    this.content.reverse();
};
