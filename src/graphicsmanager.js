function GraphicsManager() {
    this.container;     // DOM element which houses the canvases
    this.height;        // # of cells
    this.square;        // width of cell in physical pixels (pp)
    this.space;         // distance between adjacent cells in pp
    this.squarespace;   // length of square + space in pp
    this.nSquare;       // width of cell in physical pp (next grid)
    this.nSpace;        // ditance between adjacent cells in pp (next grid)
    this.nSquareSpace;  // length of nSquare + nSpace in pp (next grid)
    this.activeLeft;    // pos of active pc rel coord left boundary in pp
    this.activeTop;     // pos of active pc rel coord top boundary in pp
    this.staticLeft;    // pos of grid left boundary in pp
    this.staticTop;     // pos of grid top boundary in pp
    this.nextLeft;      // pos of next pc left boundary in pp
    this.nextTop;       // pos of next pc top boundary in pp
    this.canvas1;       // active piece canvas
    this.canvas2;       // static pieces
    this.canvas3;       // grid canvas
    this.canvas4;       // next piece
    this.canvas5;       // next grid
    this.ctx1;          // 2D context
    this.ctx2;
    this.ctx3;
    this.ctx4;
    this.ctx5;
    this.output1;       // text field for score
    this.output2;       // text field for lines
    this.output3;       // text field for level
    this.lineWeight;
    this.themes;        // color themes
    this.lineColor;
    this.activeFillColor;
    this.staticFillColor;
}

/* Stores the default configurations */
GraphicsManager.prototype.setConfig = function(config) {
    this.container = document.getElementById(config.containerId);
    this.height = config.tetris.height;
    this.themes = config.themes;
};

GraphicsManager.prototype.initialize = function() {
    this.cacheOutputs();
    this.setCanvasDimensions();
    this.setThemeStyles(0);
    this.drawGrid();
};

GraphicsManager.prototype.setThemeStyles = function(option) {
    this.lineColor = this.themes[option].lineColor;
    this.activeFillColor = this.themes[option].activeFillColor;
    this.staticFillColor = this.themes[option].staticFillColor;
    this.ctx1.fillStyle = this.activeFillColor;
    this.ctx2.fillStyle = this.staticFillColor;
    this.ctx4.fillStyle = this.staticFillColor;
    this.ctx3.strokeStyle = this.lineColor;
    this.ctx5.strokeStyle = this.lineColor;
    this.ctx3.lineWidth = 1;
    this.ctx5.lineWidth = 1;
}

/* Finds and stores references to the outputs */
GraphicsManager.prototype.cacheOutputs = function () {
    this.canvas1 = document.getElementById('active');
    this.canvas2 = document.getElementById('static');
    this.canvas3 = document.getElementById('board');
    this.canvas4 = document.getElementById('next');
    this.canvas5 = document.getElementById('next-grid');
    this.output1 = document.getElementById('score');
    this.output2 = document.getElementById('lines');
    this.output3 = document.getElementById('level');
}

/* Sets the canvas dimensions based on screen dimensions and pixelRatio */
GraphicsManager.prototype.setCanvasDimensions = function() {
    var gridHeight = this.canvas1.clientHeight * window.devicePixelRatio;
    this.space = gridHeight / (5*this.height);
    this.square = this.space * 4;
    this.squarespace = this.square + this.space;
    this.canvas1.width =
    this.canvas3.width =
    this.canvas2.width = 10 * this.squarespace;
    this.canvas2.height =
    this.canvas3.height =
    this.canvas1.height = this.height * this.squarespace;
    this.activeLeft = 0.5*this.space - 5*this.squarespace;
    this.activeTop = 0.5*this.space - 4*this.squarespace;
    this.staticLeft = 0.5*this.space;
    this.staticTop = 0.5*this.space - 4*this.squarespace;
    this.ctx1 = this.canvas1.getContext('2d');
    this.ctx2 = this.canvas2.getContext('2d');
    this.ctx3 = this.canvas3.getContext('2d');

    var nextHeight = this.canvas4.clientHeight * window.devicePixelRatio;
    this.nSpace = nextHeight / 20;
    this.nSquare = this.nSpace * 4;
    this.nSquareSpace = this.nSquare + this.nSpace;
    this.canvas4.width =
    this.canvas5.width =
    this.canvas4.height =
    this.canvas5.height = 4 * this.nSquareSpace;
    this.nextLeft =
    this.nextTop = 0.5*this.nSpace;
    this.ctx4 = this.canvas4.getContext('2d');
    this.ctx5 = this.canvas5.getContext('2d');
}

/* Clears the gameplay canvases, but not the grid canvas */
GraphicsManager.prototype.newState = function() {
    this.clearActive();
    this.clearNext();
    this.clearStatic();
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
        this.drawScore(data.score.data);
        data.score.dirty = false;
    }
};

/* Clears the active piece */
GraphicsManager.prototype.clearActive = function() {
    this.clear(this.ctx1, 0, 0, this.canvas1.width, this.canvas1.height);
};

/* Clears the next piece */
GraphicsManager.prototype.clearNext = function() {
    this.clear(this.ctx4, 0, 0, this.canvas4.width, this.canvas4.height);
};

/* Clears the static pieces */
GraphicsManager.prototype.clearStatic = function() {
    this.clear(this.ctx2, 0, 0, this.canvas2.width, this.canvas2.height);
};

/* Clears a region of the canvas */
GraphicsManager.prototype.clear = function(ctx, left, top, width, height) {
    ctx.clearRect(left, top, width, height);
};

/* Draws the active piece  */
GraphicsManager.prototype.drawActive = function(frame, relJ, relI) {
    this.ctx1.beginPath();
    var mask = 32768;       // left-most bit
    for (var j = 0; j < 4; j++) {
        var absJ = j + relJ;
        if (absJ < 4) {     // gutter zone
            mask >>>= 4;
            continue;
        }
        for (var i = 0; i < 4; i++) {
            var absI = i + relI;
            if (mask & frame) {
                this.ctx1.rect(this.activeLeft+this.squarespace*absI,
                    this.activeTop+this.squarespace*absJ,
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
    this.ctx4.beginPath();
    var mask = 32768;
    for (var j = 0; j < 4; j++) {
        for (var i = 0; i < 4; i++) {
            if (mask & frame) {
                this.ctx4.rect(this.nextLeft+this.nSquareSpace*i,
                    this.nextTop+this.nSquareSpace*j,
                    this.nSquare,
                    this.nSquare);
            }
            mask >>>= 1;
        }
    }
    this.ctx4.fill();
};

/* Draws the static pieces */
GraphicsManager.prototype.drawStatic = function(grid) {
    this.ctx2.beginPath();
    for (var j = grid.length-5; j > 3; j--) {
        var row = grid[j];
        if (row == 2049)    // empty row
            break;
        var mask = 1024;    // left-most bit
        for (var i = 0; i < 10; i++) {
            if (mask & grid[j]) {
                this.ctx2.rect(this.staticLeft+this.squarespace*i,
                    this.staticTop+this.squarespace*j,
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
    this.output1.innerText = data.score;
    this.output2.innerText = data.lines;
    this.output3.innerText = data.level;
};

/* Draws the background grids */
GraphicsManager.prototype.drawGrid = function() {
    this.ctx3.beginPath();
    for (var j = 0; j < this.height; j ++) {
        for (var i = 0; i < 10; i++) {
            this.ctx3.rect(0.5*this.space+i*this.squarespace,
                            0.5*this.space+j*this.squarespace,
                            this.square,
                            this.square);
        }
    }
    this.ctx3.stroke();
    this.ctx5.beginPath();
    for (var j = 0; j < 4; j ++) {
        for (var i = 0; i < 4; i++) {
            this.ctx5.rect(0.5*this.nSpace+i*this.nSquareSpace,
                            0.5*this.nSpace+j*this.nSquareSpace,
                            this.nSquare,
                            this.nSquare);
        }
    }
    this.ctx5.stroke();

};

/* Renders the end-game message */
GraphicsManager.prototype.drawGameOver = function() {
    console.log('GAME OVER');
};

module.exports.GraphicsManager = GraphicsManager;