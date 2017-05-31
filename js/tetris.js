function Tetris() {
    this.cf;            // configuration object
    this.km;            // key map
    this.accumulator;   // for drop timing (ms)
    this.treshold;      // drop period (ms)
    this.piece1;        // active piece
    this.piece2;        // next piece (for display)
    this.board;         // 1-D unsigned, 16-bit array
    this.data           // export data (for GraphicsManager)
    this.bag;           // randomized grab-bag of tetris pieces
    this.gameOver;      // boolean
    this.notifyEnd;     // callback to notify engine of ended game
}

/* Stores the default configurations */
Tetris.prototype.setConfig = function(config) {
    this.cf = config.tetris;
    this.km = config.keyMap;
}

/* Registers callbacks for game-related events */
Tetris.prototype.register = function(event, callback) {
    switch(event) {
        case 'gameover':
            this.notifyEnd = callback;
            break;
    }
}

/* One-time set-up */
Tetris.prototype.initialize = function() {
    this.piece1 = new this.Piece(this.START_J, this.START_I);
    this.piece2 = new this.Piece(this.START_J, this.START_I);
    this.bag = new RandomSack(this.SHAPES, this.cf.pieceFreq, true);
    this.board = this.buildBoard(this.cf.height);
    this.data = {
        active:{data:this.piece1,dirty:false},
        next:{data:this.piece2,dirty:false},
        static:{data:this.board,dirty:false},
        score:{data:0,dirty:false},
    };
}

/* Resets all game-state values */
Tetris.prototype.newState = function() {
    this.resetBoard();
    this.loadPieces();
    this.accumulator = 0;
    this.threshold = this.cf.dropPeriod;
    this.gameOver = false;
}

/* Clean-up duties to perform when ending a game */
Tetris.prototype.endState = function() {
    console.log('Tetris.endState()');
}