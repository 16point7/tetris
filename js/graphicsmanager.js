function GraphicsManager() {
    this.div;
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

/* Re-renders canvases that have changed */
GraphicsManager.prototype.render = function(data, delta) {
    console.log('GraphicsManager.render()');
}