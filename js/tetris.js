function Tetris() {
    this.cf;            // configuration object
    this.km;            // key map
    this.accumulator;   // for drop timing (ms)
    this.treshold;      // drop period (ms)
    this.piece1;        // active piece
    this.piece2;        // next piece (for display)
    this.board;         // 1-D unsigned, 16-bit array
    this.data;          // export data (for GraphicsManager)
    this.bag;           // randomized grab-bag of tetris pieces
    this.gameOver;      // boolean
    this.notifyEnd;     // callback to notify engine of ended game
    this.score;         // game score
    this.lines;         // lines cleared
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
        score:{data:{score:0,lines:0},dirty:false},
    };
}

/* Resets all game-state values */
Tetris.prototype.newState = function() {
    this.resetBoard();
    this.loadPieces();
    this.accumulator = 0;
    this.threshold = this.cf.dropPeriod;
    this.score = 0;
    this.lines = 0;
    this.data.score.data.score = this.score;
    this.data.score.data.lines = this.lines;
    this.data.score.dirty = true;
    this.gameOver = false;
}

/* Clean-up duties to perform when ending a game */
Tetris.prototype.endState = function() {
    this.gameOver = true;
}

/* Updates the gamestate based on player inputs and elapsed time */
Tetris.prototype.update = function(moves, delta) {
    while(!this.gameOver && moves.size() > 0) {
        this.process(moves.pop());        
    }

    this.accumulator = this.accumulator + delta;
    while (!this.gameOver && (this.accumulator > this.threshold)) {
        this.moveDown(this.piece1);
        this.accumulator = this.accumulator - this.threshold;
    }
}

/* Action dispatcher */
Tetris.prototype.process = function(e) {
    switch(e) {
        case this.km.LEFT:
            this.moveLeft(this.piece1);
            break;
        case this.km.RIGHT:
            this.moveRight(this.piece1);
            break;
        case this.km.DOWN:
            this.moveDown(this.piece1);
            break;
        case this.km.DROP:
            this.drop(this.piece1);
            break;
        case this.km.RTURN:
            this.rotateR(this.piece1);
            break;
        case this.km.LTURN:
            this.rotateL(this.piece1);
            break;
    }
}

/* Try left */
Tetris.prototype.moveLeft = function(piece) {
    if (this.valid(piece.j, piece.i-1, piece.rotations[piece.rIdx], this.board)) {
        piece.i--;
        this.recordPiece1Update();
    }
}

/* Try right */
Tetris.prototype.moveRight = function(piece) {
    if (this.valid(piece.j, piece.i+1, piece.rotations[piece.rIdx], this.board)) {
        piece.i++;
        this.recordPiece1Update();
    }
}

/* Try down - the only way to lock a piece */
Tetris.prototype.moveDown = function(piece) {
    if (this.valid(piece.j+1, piece.i, piece.rotations[piece.rIdx], this.board)) {
        piece.j++;
        this.recordPiece1Update();
    } else {
        this.freeze(piece, this.board);
        this.recordBoardUpdate();
        this.checkForLines(this.board);
        this.loadPieces();
        this.resetDropPeriod();
        if (!this.valid(piece.j, piece.i, piece.rotations[piece.rIdx], this.board)) {
            this.notifyEnd();
        }
    }
}

/* Simulate drop by reducing the drop period */
Tetris.prototype.drop = function(piece) {
    this.threshold = 25;
}

/* Try CW rotation */
Tetris.prototype.rotateR = function(piece) {
    if (this.valid(piece.j, piece.i, piece.rotations[piece.getRight()], this.board)) {
        piece.rIdx = piece.getRight();
        this.recordPiece1Update();
    }
}

/* Try CCW rotation */
Tetris.prototype.rotateL = function(piece) {
    if (this.valid(piece.j, piece.i, piece.rotations[piece.getLeft()], this.board)) {
        piece.rIdx = piece.getLeft();
        this.recordPiece1Update();
    }
}

/* Collision detection */
Tetris.prototype.valid = function(j, i, frame, board) {
    if(((0xF000 & frame ) >>> i ) & board[j])           // row 1
        return false;
    if((((0x0F00 & frame) << 4) >>> i) & board[j+1])    // row 2
        return false;
    if((((0x00F0 & frame) << 8) >>> i) & board[j+2])    // row 3 
        return false;
    if((((0x000F & frame) << 12) >>> i) & board[j+3])   // row 4
        return false;
    return true;    
}

/*  Writes piece to board */
Tetris.prototype.freeze = function(piece, board) {
    var mask = 0xF000;
    for (var j = 0; j < 4; j++) {
        board[piece.j+j] |= (((mask&piece.rotations[piece.rIdx])<<(4*j))>>>piece.i);
        mask >>>= 4;
    }
}

/* Checks if any lines are filled. If so, clear them, and update score. */
Tetris.prototype.checkForLines = function(board) {
    var linesCleared = 0;
    for (var j = this.board.length-5; j > -1; j--) {
        if (board[j] == 2049)     // empty
            break;
        if (board[j] == 4095) {   // filled
            var slow = j;
            var fast = j-1;
            while (fast > -1)
                board[slow--] = board[fast--];
            board[0] = 2049;
            linesCleared++;
            j++;    // try line again
        }             
    }
    if (linesCleared > 0)
        this.updateScore(linesCleared);
}

/* Updates the score based on level */
Tetris.prototype.updateScore = function(linesCleared) {
    this.score += linesCleared*100; // just for now
    this.lines += linesCleared;
    this.recordScoreUpdate();
}

/* Invalidate piece1 */
Tetris.prototype.recordPiece1Update = function() {
    this.data.active.dirty = true;
}

/* Invalidate piece2 */
Tetris.prototype.recordPiece2Update = function() {
    this.data.next.dirty = true;
}

/* Invalidate board */
Tetris.prototype.recordBoardUpdate = function() {
    this.data.static.dirty = true;
}

/* Invalidate score */
Tetris.prototype.recordScoreUpdate = function() {
    this.data.score.data.score = this.score;
    this.data.score.data.lines = this.lines;
    this.data.score.dirty = true;
}

/* Constructs a play-area of 10xheight surrounded by 4 bits of barrier */
Tetris.prototype.buildBoard = function(height) {
    var board = new Int16Array(new ArrayBuffer(2*(height+8)));
    return board;
}

/* Clears out the board */
Tetris.prototype.resetBoard = function() {
    for (var j = 0; j < this.board.length-4; j++)
        this.board[j] = 2049;   //side walls
    for (var j = this.board.length-4; j < this.board.length; j++)
        this.board[j] = 4095;   //bottom wall
}

/* Piece1 <-- Piece2 <-- bag */
Tetris.prototype.loadPieces = function() {
    if (!this.piece2.rotations)
        this.piece1.rotations = this.bag.pop();
    else
        this.piece1.rotations = this.piece2.rotations;

    this.piece2.rotations = this.bag.pop();

    this.piece1.j = this.START_J;
    this.piece1.i = this.START_I;
    this.piece1.rIdx = 0;

    this.recordPiece1Update();
    this.recordPiece2Update();
}

Tetris.prototype.resetDropPeriod = function() {
    this.threshold = this.cf.dropPeriod     // scale with level in future
}

/* 16 bits to represent each 4x4 reference frame */
Tetris.prototype.SHAPES = [
    [0x00F0, 0x2222, 0x00F0, 0x2222],   // shape-I
    [0x0E20, 0x44C0, 0x8E00, 0x6440],   // shape-J
    [0x0E80, 0xC440, 0x2E00, 0x4460],   // shape-L
    [0x0E40, 0x4C40, 0x4E00, 0x4640],   // shape-T
    [0x06C0, 0x4620, 0x06C0, 0x4620],   // shape-S
    [0x0C60, 0x2640, 0x0C60, 0x2640],   // shape-Z
    [0x0660, 0x0660, 0x0660, 0x0660]    // shape-O
];

/* Default start location */
Tetris.prototype.START_J = 0;
Tetris.prototype.START_I = 8;

/* Inner-class */
Tetris.prototype.Piece = function(j, i) {
    this.j = j;                     // 0 --> max from top-to-bottom
    this.i = i;                     // 0 --> max from left-to-right
    this.rIdx = 0;                  // current index in the rotation array
    this.rotations;                 // an array of reference frames
}

/* Returns the rIdx corresponding to a CW rotation */
Tetris.prototype.Piece.prototype.getRight = function() {
    return this.rIdx == this.rotations.length-1 ? 0 : this.rIdx + 1;
}

/* Returns the rIdx corresponding to a CCW rotation */
Tetris.prototype.Piece.prototype.getLeft = function() {
    return this.rIdx == 0 ? this.rotations.length-1 : this.rIdx - 1;
}