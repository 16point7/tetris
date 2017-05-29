function Engine(InputManager, GraphicsManager, Tetris, Queue, config) {
    this.im = new InputManager();
    this.gm = new GraphicsManager();
    this.tt = new Tetris();

    this.cf = config;

    this.moves = new Queue(32);

    this.setup();
}

Engine.prototype.setup = function() {
    this.im.setKeyMap(this.cf.keyMap);
    this.im.register('action', this.action.bind(this));
    this.im.register('newgame', this.newGame.bind(this));
    this.im.register('quitgame', this.endGame.bind(this));
    this.im.register('pausegame', this.pauseGame.bind(this));    
    this.im.listen();

    this.gm.setContainer(this.cf.containerId);
    this.gm.initialize();
}

Engine.prototype.action = function(e) {
    console.log('Engine.action()');
}

Engine.prototype.newGame = function() {
    console.log('Engine.newGame()');
}

Engine.prototype.pauseGame = function() {
    console.log('Engine.pauseGame()');
}

Engine.prototype.endGame = function() {
    console.log('Engine.endGame()');
}