function Engine(InputManager, GraphicsManager, Tetris, Queue, config) {
    this.im = new InputManager();
    this.gm = new GraphicsManager();
    this.tt = new Tetris();

    this.cf = config;

    this.moves = new Queue(32);
    this.prev;

    this.setup();
}

/* One-time initialization of the game engine */
Engine.prototype.setup = function() {
    this.im.setKeyMap(this.cf.keyMap);
    this.im.register('action', this.action.bind(this));
    this.im.register('newgame', this.newGame.bind(this));
    this.im.register('quitgame', this.endGame.bind(this));
    this.im.register('pausegame', this.pauseGame.bind(this));    
    this.im.listen();

    this.gm.setContainer(this.cf.containerId);
    this.gm.initialize();

    this.tt.setConfig(this.cf.tetris);

    this.loop = this.loop.bind(this);
}

/* Things to do in every frame */
Engine.prototype.loop = function(time) {
    var delta = time - this.prev;
    this.tt.update(this.moves, delta);
    this.gm.render(this.tt.data, delta);
    this.prev = time;
    requestAnimationFrame(this.loop);
}

/* Pipeline for gameplay events to flow from KeyboardManager to Engine */
Engine.prototype.action = function(e) {
    console.log('Engine.action()');
    this.moves.push(e);
}

/* Pipeline for new game event to flow from KeyboardManager to Engine */
Engine.prototype.newGame = function() {
    this.tt.newState();
    this.gm.newState();
    this.launchGame();
    console.log('Engine.newGame()');
}

/* Pipeline for pause game event to flow from KeyboardManager to Engine */
Engine.prototype.pauseGame = function() {
    console.log('Engine.pauseGame()');
}

/* Pipeline for end game event to flow from KeyboardManager to Engine */
Engine.prototype.endGame = function() {
    console.log('Engine.endGame()');
}

/* Kicks off the event loop */
Engine.prototype.launchGame = function() {
    this.prev = window.performance.now();
    this.loop(this.prev);
}