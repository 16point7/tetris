function GraphicsManager() {
    this.container;     // DOM element which houses the canvases
    this.height;        // # of cells
    this.square;        // width of cell in physical pixels (pp)
    this.gridLeft;      // pos of grid left boundary in pp
    this.gridTop;       // pos of grid top boundary in pp
    this.nextLeft;      // pos of next pc left boundary in pp
    this.nextTop        // pos of next pc top boundary in pp
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
}

/* Builds canvases and draw grids */
GraphicsManager.prototype.initialize = function() {
    this.container.style.padding = '0px';

    var trueWidth = this.container.clientWidth * window.devicePixelRatio;

    this.square = trueWidth / 24;
    this.gridLeft = this.square * 7;
    this.gridTop = this.square;
    this.nextLeft = this.square * 19;
    this.nextTop = this.square * (1 +((Math.max(this.height,4)-4)/2));
    this.activeLeft = this.gridLeft - this.square * 5;
    this.activeTop = this.gridTop - this.square * 4;

    this.canvas1 = document.createElement('canvas');
    this.canvas2 = document.createElement('canvas');
    this.canvas3 = document.createElement('canvas');
    this.canvas4 = document.createElement('canvas');

    // backing store width
    this.canvas1.width =
    this.canvas2.width =
    this.canvas3.width =
    this.canvas4.width = trueWidth

    // backing store height
    this.canvas1.height =
    this.canvas2.height =
    this.canvas3.height =
    this.canvas4.height = this.square * (Math.max(this.height+2, 6));

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
}

/* Clears the gameplay canvases, but not the static canvases */
GraphicsManager.prototype.newState = function() {
    this.lastFrame = false;
}

/* Display end-game graphics */
GraphicsManager.prototype.endState = function() {
    this.lastFrame = true;
}

/* Re-renders canvases that have changed */
GraphicsManager.prototype.render = function(data, delta) {    
    if (data.active.dirty) {
        // render canvas 1
        data.active.dirty = false;
    }
    if (data.static.dirty) {        
        // render canvas 2
        data.static.dirty = false;
    }
    if (data.score.dirty) {
        // render canvas 3
        data.score.dirty = false;
    }
    if (data.next.dirty) {
        // render canvas 4
        data.next.dirty = false;
    }
    if (this.lastFrame) {
        // render end-game message
    }
}