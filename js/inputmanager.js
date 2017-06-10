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
}

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
}

/* Registers the event filter with the browser. */
InputManager.prototype.listen = function() {
    document.addEventListener('keydown', this.keyHandler.bind(this));
}

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
}
