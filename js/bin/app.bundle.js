/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

const InputManager  = __webpack_require__(4).InputManager;
const GraphicsManager = __webpack_require__(3).GraphicsManager;
const Tetris = __webpack_require__(7).Tetris;
const Queue = __webpack_require__(5).Queue;
const config = __webpack_require__(2);

function Engine() {
    this.im = new InputManager();
    this.gm = new GraphicsManager();
    this.tt = new Tetris();
    this.cf = config;
    this.moves = new Queue(32);
    this.activeGame;                    // boolean
    this.loopId;                        // id of a running loop
    this.prev;                          // start time of the previous frame

    this.setup();
}

/* One-time initialization of the game engine */
Engine.prototype.setup = function() {
    this.im.setKeyMap(this.cf.keyMap);
    this.im.register('action', this.action.bind(this));
    this.im.register('newgame', this.newGame.bind(this));
    this.im.register('quitgame', this.endGame.bind(this));
    this.im.register('pausegame', this.pauseGame.bind(this));    
    this.im.listen();

    this.gm.setConfig(this.cf);
    this.gm.initialize();

    this.tt.setConfig(this.cf);
    this.tt.register('gameover', this.endGame.bind(this));
    this.tt.initialize();

    this.loop = this.loop.bind(this);   // so RAF has access to this
};

/* Game Loop */
Engine.prototype.loop = function(time) {
    this.loopId = requestAnimationFrame(this.loop);
    let delta = time - this.prev;
    this.tt.update(this.moves, delta);
    this.gm.render(this.tt.data, delta);
    this.prev = time;    
};

/* Callback for action events */
Engine.prototype.action = function(e) {    
    if (this.loopId != null)
        this.moves.push(e);
};

/* Callback for new game event */
Engine.prototype.newGame = function() {
    if (!this.activeGame) {
        this.tt.newState();
        this.gm.newState();
        this.resetInputQueue();
        this.startLoop();        
    }
};

/* Callback for pause game event */
Engine.prototype.pauseGame = function() {
    if (this.activeGame) {
        if (this.loopId == null)
            this.startLoop();
        else
            this.endLoop();
    }
};

/* Callback for end game event */
Engine.prototype.endGame = function() {
    if (this.activeGame) {
        this.tt.endState();
        this.gm.endState();
        this.endLoop();
        this.activeGame = false;        
    }
};

/* Kicks off the game loop */
Engine.prototype.startLoop = function() {
    this.prev = window.performance.now();
    this.loop(this.prev);
    this.activeGame = true;
};

/* Stops the game loop */
Engine.prototype.endLoop = function() {
    cancelAnimationFrame(this.loopId);
    this.loopId = null;
};

/* Clears the input queue */
Engine.prototype.resetInputQueue = function() {
    this.moves.clear();
};

module.exports.Engine = Engine;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const Engine = __webpack_require__(0).Engine;

window.onload = function() {
    window.game = new Engine();
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = {
    keyMap: {
        LEFT:37,
        RIGHT:39,
        DOWN:40,
        DROP:32,
        RTURN:38,
        LTURN:90,
        NEW:78,
        PAUSE:80,
        QUIT:81
    },
    tetris: {
        pieceFreq: 2,
        height: 20,
        startLevel:8
    },
    containerId:'zone',
    lineColor:'#7986cb',
    fillColor:'#1a237e',
    borderColor:'#1a237e',
    borderWeight:8,
    lineWeight:1
};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

function GraphicsManager() {
    this.container;     // DOM element which houses the canvases
    this.height;        // # of cells
    this.square;        // width of cell in physical pixels (pp)
    this.gridLeft;      // pos of grid left boundary in pp
    this.gridTop;       // pos of grid top boundary in pp
    this.nextLeft;      // pos of next pc left boundary in pp
    this.nextTop;        // pos of next pc top boundary in pp
    this.activeLeft;    // pos of active pc rel coord left boundary in pp
    this.activeTop;     // pos of active pc rel coord top boundary in pp
    this.canvas1;       // active piece canvas
    this.canvas2;       // static pieces, next piece canvas
    this.canvas3;       // grid canvas
    this.canvas4;       // score, message canvas
    this.ctx1;          // 2D context
    this.ctx2;
    this.ctx3;
    this.ctx4;
    this.borderWeight;
    this.borderColor;
    this.lineWeight;
    this.lineColor;
    this.fillColor;
}

/* Stores the default configurations */
GraphicsManager.prototype.setConfig = function(config) {
    this.container = document.getElementById(config.containerId);
    this.height = config.tetris.height;
    this.borderWeight = config.borderWeight;
    this.borderColor = config.borderColor;
    this.lineWeight = config.lineWeight;
    this.lineColor = config.lineColor;
    this.fillColor = config.fillColor;
};

/* Builds canvases and draw grids */
GraphicsManager.prototype.initialize = function() {
    this.container.style.padding = '0px';

    let trueWidth = this.container.clientWidth * window.devicePixelRatio;

    this.square = trueWidth / 24;
    this.gridLeft = this.square * 7;
    this.gridTop = this.square;
    this.nextLeft = this.square * 19;
    this.nextTop = this.square * (1+((Math.max(this.height,4)-4)/2));
    this.activeLeft = this.gridLeft - this.square*5;
    this.activeTop = this.gridTop - this.square*4;

    this.canvas1 = document.createElement('canvas');
    this.canvas2 = document.createElement('canvas');
    this.canvas3 = document.createElement('canvas');
    this.canvas4 = document.createElement('canvas');

    // backing store width
    this.canvas1.width =
    this.canvas2.width =
    this.canvas3.width =
    this.canvas4.width = trueWidth;

    // backing store height
    this.canvas1.height =
    this.canvas2.height =
    this.canvas3.height =
    this.canvas4.height = this.square * (Math.max(this.height+2,6));

    this.canvas1.style.position =
    this.canvas2.style.position =
    this.canvas3.style.position =
    this.canvas4.style.position = 'absolute';

    this.canvas1.style.zIndex = 1;
    this.canvas2.style.zIndex = 2;
    this.canvas3.style.zIndex = 3;
    this.canvas4.style.zIndex = 4;  

    this.container.appendChild(this.canvas1);
    this.container.appendChild(this.canvas2);
    this.container.appendChild(this.canvas3);
    this.container.appendChild(this.canvas4);

    this.ctx1 = this.canvas1.getContext('2d');
    this.ctx2 = this.canvas2.getContext('2d');
    this.ctx3 = this.canvas3.getContext('2d');
    this.ctx4 = this.canvas4.getContext('2d');

    this.drawGrid();
};

/* Clears the gameplay canvases, but not the grid canvas */
GraphicsManager.prototype.newState = function() {
    this.clearActive();
    this.clearNext();
    this.clearStatic();
    this.clearScore();
};

/* Displays end-game graphics */
GraphicsManager.prototype.endState = function() {
    this.drawGameOver();
};

/* Re-renders canvases that have changed */
GraphicsManager.prototype.render = function(data) {
    if (data.active.dirty) {
        this.clearActive();
        this.drawActive(data.active.data.rotations[data.active.data.rIdx],
            data.active.data.j,
            data.active.data.i);
        data.active.dirty = false;
    }

    if (data.next.dirty) {
        this.clearNext();
        this.drawNext(data.next.data.rotations[data.next.data.rIdx]);
        data.next.dirty = false;
    }

    if (data.static.dirty) {
        this.clearStatic();
        this.drawStatic(data.static.data);
        data.static.dirty = false;
    }

    if (data.score.dirty) {
        this.clearScore();
        this.drawScore(data.score.data);
        data.score.dirty = false;
    }
};

/* Clears the active piece */
GraphicsManager.prototype.clearActive = function() {
    this.clear(this.ctx1, this.gridLeft, this.gridTop,
        this.square*10, this.square*this.height);
};

/* Clears the next piece */
GraphicsManager.prototype.clearNext = function() {
    this.clear(this.ctx2, this.nextLeft, this.nextTop,
        this.square*4, this.square*4);
};

/* Clears the static pieces */
GraphicsManager.prototype.clearStatic = function() {
    this.clear(this.ctx2, this.gridLeft, this.gridTop,
        this.square*10, this.square*this.height);
};

/* Clears the score canvas */
GraphicsManager.prototype.clearScore = function() {
    this.clear(this.ctx4, 0, 0,
        this.canvas4.width, this.canvas4.height);
};

/* Clears a region of the canvas */
GraphicsManager.prototype.clear = function(ctx, left, top, width, height) {
    ctx.clearRect(left, top, width, height);
};

/* Draws the active piece  */
GraphicsManager.prototype.drawActive = function(frame, relJ, relI) {
    this.ctx1.beginPath();
    this.ctx1.fillStyle = this.fillColor;
    let mask = 32768;       // left-most bit
    for (let j = 0; j < 4; j++) {
        let absJ = j + relJ;
        if (absJ < 4) {     // gutter zone
            mask >>>= 4;
            continue;
        }
        for (let i = 0; i < 4; i++) {
            let absI = i + relI;
            if (absI > 4 && (mask & frame)) {
                this.ctx1.rect(this.activeLeft+this.square*absI,
                    this.activeTop+this.square*absJ,
                    this.square,
                    this.square);
            }                
            mask >>>= 1;
        }
    }
    this.ctx1.fill();
};

/* Draws the next piece */
GraphicsManager.prototype.drawNext = function(frame) {
    this.ctx2.beginPath();
    this.ctx2.fillStyle = this.fillColor;
    let mask = 32768;
    for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
            if (mask & frame) {
                this.ctx2.rect(this.nextLeft+this.square*i,
                    this.nextTop+this.square*j,
                    this.square,
                    this.square);
            }
            mask >>>= 1;
        }
    }
    this.ctx2.fill();
};

/* Draws the static pieces */
GraphicsManager.prototype.drawStatic = function(grid) {
    this.ctx2.beginPath();
    this.ctx2.fillStyle = this.fillColor;
    for (let j = grid.length-5; j > 3; j--) {
        let row = grid[j];
        if (row == 2049)    // empty row
            break;
        let mask = 1024;    // left-most bit
        for (let i = 0; i < 10; i++) {
            if (mask & grid[j]) {
                this.ctx2.rect(this.gridLeft+this.square*i,
                    this.gridTop+this.square*(j-4),
                    this.square,
                    this.square);
            }
            mask >>>= 1;
        }
    }
    this.ctx2.fill();
};

/* Draws the score */
GraphicsManager.prototype.drawScore = function(data) {
    this.ctx4.beginPath();
    this.ctx4.font = '14px monospace';
    this.ctx4.textAlign = 'left';
    this.ctx4.fillStyle = this.borderColor;
    this.ctx4.textBaseline = 'top';
    this.ctx4.fillText('Score: ' + data.score,
        this.nextLeft,
        this.nextTop+this.square*5,
        this.canvas4.width-this.nextLeft);
    this.ctx4.fillText('Lines: ' + data.lines,
        this.nextLeft,
        this.nextTop+this.square*5 + 14*window.devicePixelRatio,
        this.canvas4.width-this.nextLeft);
    this.ctx4.fillText('Level: ' + data.level,
        this.nextLeft,
        this.nextTop+this.square*5 + 28*window.devicePixelRatio,
        this.canvas4.width-this.nextLeft);
};

/* Draws the background grids */
GraphicsManager.prototype.drawGrid = function() {
    this.ctx3.beginPath();

    this.ctx3.strokeStyle = this.lineColor;
    this.ctx3.lineWidth = this.lineWeight;
    for (let j = 0; j < this.height-1; j++) {
        this.ctx3.moveTo(this.gridLeft, this.gridTop+this.square*(1+j));
        this.ctx3.lineTo(this.gridLeft+this.square*10,
            this.gridTop+this.square*(1+j));
    }
    for (let i = 0; i < 9; i++) {
        this.ctx3.moveTo(this.gridLeft+this.square*(1+i), this.gridTop);
        this.ctx3.lineTo(this.gridLeft+this.square*(1+i),
            this.gridTop+this.square*this.height);
    }
    for (let j = 0; j < 3; j++) {
        this.ctx3.moveTo(this.nextLeft, this.nextTop+this.square*(1+j));
        this.ctx3.lineTo(this.nextLeft+this.square*4,
            this.nextTop+this.square*(1+j));
    }
    for (let i = 0; i < 3; i++) {
        this.ctx3.moveTo(this.nextLeft+this.square*(1+i), this.nextTop);
        this.ctx3.lineTo(this.nextLeft+this.square*(1+i),
            this.nextTop+this.square*4);
    }
    this.ctx3.stroke();

    this.ctx3.strokeStyle = this.borderColor;
    this.ctx3.lineWidth = this.borderWeight;
    this.ctx3.strokeRect(this.gridLeft, this.gridTop,
        this.square*10, this.square*this.height);
    this.ctx3.strokeRect(this.nextLeft, this.nextTop,
        this.square*4, this.square*4);
};

/* Renders the end-game message */
GraphicsManager.prototype.drawGameOver = function() {
    this.ctx4.beginPath();
    this.ctx4.font = '60px monospace';
    this.ctx4.textAlign = 'center';
    this.ctx4.fillStyle = '#b71c1c';
    this.ctx4.fillText('GAME OVER',
        this.canvas4.width/2,
        this.canvas4.height/2,
        this.square*10);
};

module.exports.GraphicsManager = GraphicsManager;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

function InputManager() {
    this.km;            // key map
    this.notify;        // callback for game action key event
    this.newGame;       // callback for new game key event
    this.quitGame;      // callback for quit key event
    this.pauseGame;     // callback for pause key event    
}

/* Defines the game-related inputs */
InputManager.prototype.setKeyMap = function(keyMap) {
    this.km = keyMap;
};

/* Used to register callbacks for game-related events */
InputManager.prototype.register = function(event, callback) {
    switch(event) {
        case 'action':
            this.notify = callback;     
            break;
        case 'newgame':
            this.newGame = callback;
            break;
        case 'quitgame':
            this.quitGame = callback;
            break;
        case 'pausegame':
            this.pauseGame = callback;
            break;
    }
};

/* Registers the event filter with the browser. */
InputManager.prototype.listen = function() {
    document.addEventListener('keydown', this.keyHandler.bind(this));
};

/* Filter which is used to catch and dispatch game-related events. */
InputManager.prototype.keyHandler = function(e) {
    switch(e.keyCode) {
        case this.km.LEFT:
        case this.km.RIGHT:
        case this.km.DOWN:
        case this.km.DROP:
        case this.km.RTURN:
        case this.km.LTURN:
            this.notify(e.keyCode);
            e.preventDefault();
            break;
        case this.km.NEW:
            this.newGame();
            e.preventDefault();
            break;
        case this.km.QUIT:
            this.quitGame();
            e.preventDefault();
            break;
        case this.km.PAUSE:
            this.pauseGame();
            e.preventDefault();
            break;        
    }
};

module.exports.InputManager = InputManager;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

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
};

Queue.prototype.pop = function() {
    if (this.size() == 0) {
        this.clear();
        return undefined; 
    }
    return this.buffer[this.read++];
};

Queue.prototype.peek = function() {
    if (this.size() == 0)
        return undefined;
    return this.buffer[this.read];
};

Queue.prototype.size = function() {
    return this.write - this.read;
};

Queue.prototype.clear = function() {
    this.read = this.write = 0;
};

Queue.prototype.grow = function() {
    let old = this.buffer;
    this.buffer = new Int8Array(new ArrayBuffer(2*old.length));
    let i = 0;
    while (this.read < this.write)
        this.buffer[i++] = old[this.read++];
    this.read = 0;
    this.write = i;
};

module.exports.Queue = Queue;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

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
};

RandomSack.prototype.peek = function() {
    if (this.size() == 0) {
        if (!this.autoReload)
            return undefined;
        this.shuffle();
    }
    return this.data[this.top];
};

RandomSack.prototype.shuffle = function() {
    for (let i = this.data.length-1; i > -1; i--) {
        let rand = (Math.random()*(i+1)) | 0;
        let temp = this.data[i];
        this.data[i] = this.data[rand];
        this.data[rand] = temp;
    }
    this.top = this.data.length-1;
};

RandomSack.prototype.size = function() {
    return this.top + 1;
};

/*  Internal helper method */
RandomSack.prototype.build = function(dataSet, freq) {
    let output = new Array(dataSet.length * freq);
    for (let i = 0; i < dataSet.length; i++) {
        for (let j = 0; j < freq; j++) {
            output[freq*i + j] = dataSet[i];
        }
    }
    return output;
};

module.exports.RandomSack = RandomSack;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

const RandomSack = __webpack_require__(6).RandomSack;

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
};

/* Resets all game-state values */
Tetris.prototype.newState = function() {
    this.gameOver = false;
    this.accumulator = 0;
    this.score = 0;
    this.totalLines = 0;
    this.lines = 0;
    this.level = this.cf.startLevel;
    this.minLines = this.getMinLines(this.level);
    this.data.score.data.score = this.score;
    this.data.score.data.lines = this.totalLines;
    this.data.score.data.level = this.level;
    this.data.score.dirty = true;
    this.resetBoard();
    this.loadPieces();
    this.resetDropPeriod();
};

/* Clean-up duties to perform when ending a game */
Tetris.prototype.endState = function() {
    this.gameOver = true;
};

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
    let mask = 0xF000;
    for (let j = 0; j < 4; j++) {
        board[piece.j+j] |= (((mask&piece.rotations[piece.rIdx])<<(4*j))>>>piece.i);
        mask >>>= 4;
    }
};

/* Checks if any lines are filled. If so, clear them, and update score. */
Tetris.prototype.checkForLines = function(board) {
    let linesCleared = 0;
    for (let j = this.board.length-5; j > -1; j--) {
        if (board[j] == 2049)     // empty
            break;
        if (board[j] == 4095) {   // filled
            let slow = j;
            let fast = j-1;
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
    let board = new Int16Array(new ArrayBuffer(2*(height+8)));
    return board;
};

/* Clears out the board */
Tetris.prototype.resetBoard = function() {
    for (let j = 0; j < this.board.length-4; j++)
        this.board[j] = 2049;   //side walls
    for (let j = this.board.length-4; j < this.board.length; j++)
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

/***/ })
/******/ ]);