/*
RoomList
The RoomList is a list that contains functions for extracting certain values based on room purpose
 */

/**
 * The RoomList is a list that contains functions for extracting certain values based on room purpose
 * @constructor
 */
function RoomList() {
    this.content = [];
    this.length = this.content.length;
}

/**
 * Sets length equal to the length of the content
 */
RoomList.prototype.resetLength = function () {
    this.length = this.content.length;
};

/**
 * Pushes item into this.content. Item should be a Room
 * @param item
 */
RoomList.prototype.push = function (item) {
    this.content.push(item);
    this.resetLength();
};

/**
 *  Returns the Room at the given index
 * @param index
 * @returns {Room}
 */
RoomList.prototype.get = function (index) {
    return this.content[index];
};

/**
 * Returns the first Room (at index 0)
 * @returns {Room}
 */
RoomList.prototype.peek = function () {
    return this.content[0];
};

/**
 * Returns true if any Room has the given purpose
 * @param purpose
 * @returns {boolean}
 */
RoomList.prototype.contains = function (purpose) {
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            return true;
        }
    }
    return false;
};

/**
 * Returns a list of all Rooms with the given purpose
 * @param purpose
 * @returns {Array}
 */
RoomList.prototype.getAllOf = function (purpose) {
    var toReturn = [];
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            toReturn.push(this.content[i]);
        }
    }
    return toReturn;
};

/**
 * Removes and returns the Room at the given index
 * @param index
 * @returns {Room}
 */
RoomList.prototype.remove = function (index) {
    var toReturn = this.content.splice(index,1)[0];
    this.resetLength();
    return toReturn;
};

/**
 * Removes and returns a list of all Rooms with the given purpose
 * @param purpose
 * @returns {Array}
 */
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

/**
 * Returns a count of all the Rooms with the given purpose
 * @param purpose
 * @returns {number}
 */
RoomList.prototype.countAllOf = function (purpose) {
    var toReturn = 0;
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            toReturn++;
        }
    }
    return toReturn;
};

/**
 * Returns [number] Rooms with the given purpose
 * @param purpose
 * @param number
 * @returns {Array}
 */
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

/**
 * Returns the first Room with the given purpose
 * @param purpose
 * @returns {Room}
 */
RoomList.prototype.getFirstOf = function(purpose) {
    for (var i = 0; i < this.length; i++) {
        if (this.content[i].purpose === purpose) {
            return this.content[i];
        }
    }
};

/**
 * Removes and returns [number] Rooms with the given purpose
 * @param purpose
 * @param number
 * @returns {Array}
 */
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
 * @param purpose
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
 * Sorts the list using the given comparison function
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

/**
 * Returns a copy of this roomList
 * @returns {RoomList}
 */
RoomList.prototype.copy = function() {
    var list = new RoomList();
    list.content = this.content.slice();
    list.resetLength();
    return list;
};

/**
 * Returns the index of the given room
 * @param room
 * @returns {number}
 */
RoomList.prototype.getIndexOf = function (room) {
    return this.content.indexOf(room);
};

/**
 * Returns a String representation of the room
 * @returns {string}
 */
RoomList.prototype.toString = function() {
  return this.content.toString();
};

/**
 * Return true if this.content contains the given Room
 * @param room
 * @returns {boolean}
 */
RoomList.prototype.includes = function (room) {
    return this.content.includes(room);
};

/**
 * Returns an array containing all the Rooms that match the given filter function
 * @param func
 * @returns {Array}
 */
RoomList.prototype.filter = function (func) {
    return this.content.filter(func);
};

/**
 * Creates a new Roomlist combining this list with the given list
 * @param roomList Roomlist is added to the end of this.content
 * @returns {RoomList} A new RoomList
 */
RoomList.prototype.concat = function (roomList) {
    var newList = new RoomList();
    newList.content = this.content.concat(roomList.content);
    newList.resetLength();
  return newList;
};
