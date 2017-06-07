/* For storing signed, 8-bit integers */
function Queue(initialSize) {
    this.buffer = new Int8Array(new ArrayBuffer(initialSize));
    this.read = 0;
    this.write = 0;
}

Queue.prototype.push = function(val) {
    if (this.write == this.buffer.length)
        this.grow();
    this.buffer[this.write++] = val;
}

Queue.prototype.pop = function() {
    if (this.size() == 0) {
        this.clear();
        return undefined; 
    }
    return this.buffer[this.read++];
}

Queue.prototype.peek = function() {
    if (this.size() == 0)
        return undefined;
    return this.buffer[this.read];
}

Queue.prototype.size = function() {
    return this.write - this.read;
}

Queue.prototype.clear = function() {
    this.read = this.write = 0;
}

Queue.prototype.grow = function() {
    var old = this.buffer;
    this.buffer = new Int8Array(new ArrayBuffer(2*old.length));
    var i = 0;
    while (this.read < this.write)
        this.buffer[i++] = old[this.read++];
    this.read = 0;
    this.write = i;
}