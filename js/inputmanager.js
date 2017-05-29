function InputManager() {
    this.km;

    this.notify;
    this.newGame;
    this.quitGame;
    this.pauseGame;
    
}

InputManager.prototype.setKeyMap = function(keyMap) {
    this.km = keyMap;
}

InputManager.prototype.register = function(event, callback) {
    switch(event) {
        case 'action':      this.notify = callback;     break;
        case 'newgame':     this.newGame = callback;    break;
        case 'quitgame':    this.quitGame = callback;   break;
        case 'pausegame':   this.pauseGame = callback;  break;
        
    }
}

InputManager.prototype.listen = function() {
    document.addEventListener('keydown', this.keyHandler.bind(this));
}

InputManager.prototype.keyHandler = function(e) {
    switch(e.keyCode) {
        case this.km.LEFT:
        case this.km.RIGHT:
        case this.km.DOWN:
        case this.km.DROP:
        case this.km.RTURN:
        case this.km.LTURN:
            this.notify(e.keyCode);
            break;
        case this.km.NEW:
            this.newGame();
            break;
        case this.km.QUIT:
            this.quitGame();
            break;
        case this.km.PAUSE:
            this.pauseGame();
            break;        
    }
}
