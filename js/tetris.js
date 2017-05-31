function Tetris() {
    this.cf;
    this.treshold;
    this.accumulator;   // for drop timing (ms)
}

/* Stores the default configurations */
Tetris.prototype.setConfig = function(config) {
    this.cf = config;
    console.log('Tetris.setConfig()');
}

/* Registers callbacks for game-related events */
Tetris.prototype.register = function(event, callback) {
    switch(event) {
        case 'gameover':
            this.notifyEnd = callback;
            break;
    }
}

    this.accumulator = this.accumulator + delta;
    while (this.accumulator > this.threshold) {
        console.log('Tetris.update(): drop!');
        this.accumulator = this.accumulator - this.threshold;
    }
}

/* Resets all game-state values */
Tetris.prototype.newState = function() {
    this.accumulator = 0;
    this.threshold = this.cf.initialDropRate;
    console.log('Tetris.newState()');
}

/* Clean-up duties to perform when ending a game */
Tetris.prototype.endState = function() {
    console.log('Tetris.endState()');
}