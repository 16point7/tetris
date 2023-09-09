var RandomSack = require('./randomsack').RandomSack;

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
    this.totalLines;    // total lines cleared
    this.lines;         // line clear accumulator
    this.minLines;      // lines to reach next lvl. after, +1 lvl per 10 lines
    this.level;         // scoring level
    this.levelSelect;   // level-selection list

}

/* Stores the default configurations */
Tetris.prototype.setConfig = function(config) {
    this.cf = config.tetris;
    this.km = config.keyMap;
};

/* Registers callbacks for game-related events */
Tetris.prototype.register = function(event, callback) {
    switch(event) {
        case 'gameover':
            this.notifyEnd = callback;
            break;
    }
};

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
        score:{data:{score:0,lines:0,level:0},dirty:false},
    };
    this.setupLevels();
};

/* Resets all game-state values */
Tetris.prototype.newState = function() {
    this.gameOver = false;
    this.accumulator = 0;
    this.score = 0;
    this.totalLines = 0;
    this.lines = 0;
    this.level = parseInt(this.levelSelect.value);
    this.minLines = this.getMinLines(this.level);
    this.data.score.data.score = this.score;
    this.data.score.data.lines = this.totalLines;
    this.data.score.data.level = this.level;
    this.data.score.dirty = true;
    this.levelSelect.blur();
    this.levelSelect.disabled = true;
    this.resetBoard();
    this.loadPieces();
    this.resetDropPeriod();
};

/* Clean-up duties to perform when ending a game */
Tetris.prototype.endState = function() {
    this.gameOver = true;
    this.levelSelect.disabled = false;
};

/* Updates the gamestate based on player inputs and elapsed time */
Tetris.prototype.update = function(moves, delta) {
    while(!this.gameOver && moves.size() > 0) {
        this.process(moves.poll());        
    }
    this.accumulator = this.accumulator + delta;
    while (!this.gameOver && (this.accumulator > this.threshold)) {
        this.accumulator = this.accumulator - this.threshold;
        this.moveDown(this.piece1);
    }
};

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
            this.drop();
            break;
        case this.km.RTURN:
            this.rotateR(this.piece1);
            break;
        case this.km.LTURN:
            this.rotateL(this.piece1);
            break;
    }
};

/* Try left */
Tetris.prototype.moveLeft = function(piece) {
    if (this.valid(piece.j, piece.i-1, piece.rotations[piece.rIdx], this.board)) {
        piece.i--;
        this.recordPiece1Update();
    }
};

/* Try right */
Tetris.prototype.moveRight = function(piece) {
    if (this.valid(piece.j, piece.i+1, piece.rotations[piece.rIdx], this.board)) {
        piece.i++;
        this.recordPiece1Update();
    }
};

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
};

/* Simulate drop by reducing the drop period */
Tetris.prototype.drop = function() {
    this.threshold = 2;
};

/* Try CW rotation */
Tetris.prototype.rotateR = function(piece) {
    if (this.valid(piece.j, piece.i, piece.rotations[piece.getRight()], this.board)) {
        piece.rIdx = piece.getRight();
        this.recordPiece1Update();
    }
};

/* Try CCW rotation */
Tetris.prototype.rotateL = function(piece) {
    if (this.valid(piece.j, piece.i, piece.rotations[piece.getLeft()], this.board)) {
        piece.rIdx = piece.getLeft();
        this.recordPiece1Update();
    }
};

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
};

/*  Writes piece to board */
Tetris.prototype.freeze = function(piece, board) {
    var mask = 0xF000;
    for (var j = 0; j < 4; j++) {
        board[piece.j+j] |= (((mask&piece.rotations[piece.rIdx])<<(4*j))>>>piece.i);
        mask >>>= 4;
    }
};

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
};

/* Updates the score, lines, and level */
Tetris.prototype.updateScore = function(linesCleared) {
    this.score += this.scoring[linesCleared-1]*(this.level+1);
    this.totalLines += linesCleared;
    this.lines += linesCleared;
    while (this.lines >= this.minLines) {
        this.level++;
        this.lines -= this.minLines;
        this.minLines = 10;
    }
    this.recordScoreUpdate();
};

/* Calculates # lines needed to reach next lvl. After, +1 lvl per 10 lines */
Tetris.prototype.getMinLines = function(startLevel) {
    return Math.min(startLevel*10+10,Math.max(100,startLevel*10-50));
};

/* Invalidates piece1 */
Tetris.prototype.recordPiece1Update = function() {
    this.data.active.dirty = true;
};

/* Invalidates piece2 */
Tetris.prototype.recordPiece2Update = function() {
    this.data.next.dirty = true;
};

/* Invalidates board */
Tetris.prototype.recordBoardUpdate = function() {
    this.data.static.dirty = true;
};

/* Invalidates score */
Tetris.prototype.recordScoreUpdate = function() {
    this.data.score.data.score = this.score;
    this.data.score.data.lines = this.totalLines;
    this.data.score.data.level = this.level;
    this.data.score.dirty = true;
};

/* Constructs a play-area of 10xheight surrounded by 4 bits of barrier */
Tetris.prototype.buildBoard = function(height) {
    var board = new Int16Array(new ArrayBuffer(2*(height+8)));
    return board;
};

/* Clears out the board */
Tetris.prototype.resetBoard = function() {
    for (var j = 0; j < this.board.length-4; j++)
        this.board[j] = 2049;   //side walls
    for (var j = this.board.length-4; j < this.board.length; j++)
        this.board[j] = 4095;   //bottom wall
};

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
};

/* Sets drop period based on level. Capped at level 29 */
Tetris.prototype.resetDropPeriod = function() {
    switch(true) {
        case this.level < 8:
            this.threshold = ((48-this.level*5)/60) * 1000;
            break;
        case this.level < 10:
            this.threshold = ((8-(this.level-8)*2)/60) * 1000;
            break;
        case this.level < 13:
            this.threshold = (5/60) * 1000;
            break;
        case this.level < 16:
            this.threshold = (4/60) * 1000;
            break;
        case this.level < 19:
            this.threshold = (3/60) * 1000;
            break;
        case this.level < 29:
            this.threshold = (2/60) * 1000;
            break;
        default:
            this.threshold = (1/60) * 1000;
            break;
    }
};

/* Builds drop down list for level selction */
Tetris.prototype.setupLevels = function() {
    this.levelSelect = document.getElementById('levels');
    for (var i = 0; i < 30; i++) {
        var option = document.createElement('option');
        option.text = 'level: ' + i;
        option.value = i;
        this.levelSelect.appendChild(option);
    }
};

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

/* Scoring System */
Tetris.prototype.scoring = [40,100,300,1200];

/* Inner-class */
Tetris.prototype.Piece = function(j, i) {
    this.j = j;                     // 0 --> max from top-to-bottom
    this.i = i;                     // 0 --> max from left-to-right
    this.rIdx = 0;                  // current index in the rotation array
    this.rotations;                 // an array of reference frames
};

/* Returns the rIdx corresponding to a CW rotation */
Tetris.prototype.Piece.prototype.getRight = function() {
    return this.rIdx == this.rotations.length-1 ? 0 : this.rIdx + 1;
};

/* Returns the rIdx corresponding to a CCW rotation */
Tetris.prototype.Piece.prototype.getLeft = function() {
    return this.rIdx == 0 ? this.rotations.length-1 : this.rIdx - 1;
};

module.exports.Tetris = Tetris;