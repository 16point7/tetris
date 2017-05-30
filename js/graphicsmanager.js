function GraphicsManager() {
    this.div;       // DOM object to house the game
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
    console.log('GraphicsManager.newState()');
}

/* Display end-game graphics */
GraphicsManager.prototype.endState = function() {
    console.log('GraphicsManager.endState()');
}

/* Re-renders canvases that have changed */
GraphicsManager.prototype.render = function(data, delta) {
    console.log('GraphicsManager.render()');
}