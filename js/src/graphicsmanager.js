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