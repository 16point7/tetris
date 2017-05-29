function GraphicsManager() {
    this.div;
}

GraphicsManager.prototype.setContainer = function(containerId) {
    this.div = document.getElementById(containerId);
}

GraphicsManager.prototype.initialize = function() {
    this.div.innerText = 'GraphicsManager.initialize()';
}