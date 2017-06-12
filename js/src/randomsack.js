/* A randomized grab-bag containing N number of each item.
 * Elements are not cloned. Can be re-used by manually calling
 * shuffle() or initializing with autoReload set to True.
 * 
 * dataSet      - an array containing elements to put in the sack
 * freq         - number of occurances of each element. non-zero integer
 * autoReload   - automatically refresh the bag when empty if True
 */

function RandomSack(dataSet, freq, autoReload) {
    this.autoReload = autoReload;
    this.data = this.build(dataSet, freq);
    this.top = this.data.length-1;
    this.shuffle();
}

RandomSack.prototype.pop = function() {
    if (this.size() == 0) {
        if (!this.autoReload) 
            return undefined;
        this.shuffle();
    }
    return this.data[this.top--];
}

RandomSack.prototype.peek = function() {
    if (this.size() == 0) {
        if (!this.autoReload)
            return undefined;
        this.shuffle();
    }
    return this.data[this.top];
}

RandomSack.prototype.shuffle = function() {
    for (var i = this.data.length-1; i > -1; i--) {
        var rand = (Math.random()*(i+1)) | 0;
        var temp = this.data[i];
        this.data[i] = this.data[rand];
        this.data[rand] = temp;
    }
    this.top = this.data.length-1;
}

RandomSack.prototype.size = function() {
    return this.top + 1;
}

/*  Internal helper method */
RandomSack.prototype.build = function(dataSet, freq) {
    var output = new Array(dataSet.length * freq);
    for (var i = 0; i < dataSet.length; i++) {
        for (var j = 0; j < freq; j++) {
            output[freq*i + j] = dataSet[i];
        }
    }
    return output;
}

module.exports.RandomSack = RandomSack;