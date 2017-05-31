function GraphicsManager() {
    this.div;       // DOM object to house the game
    this.lastFrame  // boolean signifying that this is the last render
}

/* Defines location to inject the canvases */
GraphicsManager.prototype.setContainer = function(containerId) {
    this.div = document.getElementById(containerId);
}

/* Builds the canvases and injects them into the container */
GraphicsManager.prototype.initialize = function() {
    this.div.innerText = 'GraphicsManager.initialize()';
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