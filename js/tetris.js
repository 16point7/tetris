function Tetris() {
    this.cf;
    this.accu;
    this.treshold;
}

/* Stores the default configurations */
Tetris.prototype.setConfig = function(config) {
    this.cf = config;
    console.log('Tetris.setConfig()');
}

/* Updates the gamestate based on player inputs and elapsed time */
Tetris.prototype.update = function(moves, delta) {
    while(moves.size() > 0) {
        console.log('Tetris.update(): ' + moves.pop());
    }

    this.accu = this.accu + delta;
    while (this.accu > this.threshold) {
        console.log('Tetris.update(): drop!');
        this.accu = this.accu - this.threshold;
    }
}

/* Resets all game-state values */
Tetris.prototype.newState = function() {
    this.accu = 0;
    this.threshold = this.cf.initialDropRate;
    console.log('Tetris.newState()');
}

/* Clean-up duties to perform when ending a game */
Tetris.prototype.endState = function() {
    console.log('Tetris.endState()');
}