function Engine(InputManager, GraphicsManager, Tetris, Queue, config) {
    this.im = new InputManager();
    this.gm = new GraphicsManager();
    this.tt = new Tetris();

    this.cf = config;

    this.moves = new Queue(32);

    this.activeGame;        // boolean
    this.loopId;            // id of a running loop
    this.prev;              // start time of the previous frame

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
    this.tt.register('gameover', this.endGame.bind(this));

    this.loop = this.loop.bind(this);   // so RAF has access to this
}

/* Game Loop */
Engine.prototype.loop = function(time) {
    var delta = time - this.prev;
    this.tt.update(this.moves, delta);
    this.gm.render(this.tt.data, delta);
    this.prev = time;
    this.loopId = requestAnimationFrame(this.loop);
}

/* Callback for action events */
Engine.prototype.action = function(e) {    
    if (this.loopId != null)
        this.moves.push(e);
}

/* Callback for new game event */
Engine.prototype.newGame = function() {
    if (!this.activeGame) {
        this.tt.newState();
        this.gm.newState();
        this.resetInputQueue();
        this.startLoop();        
    }
}

/* Callback for pause game event */
Engine.prototype.pauseGame = function() {
    if (this.activeGame) {
        if (this.loopId == null)
            this.startLoop();
        else
            this.endLoop();
    }
}

/* Callback for end game event */
Engine.prototype.endGame = function() {
    if (this.activeGame) {
        this.tt.endState();
        this.gm.endState();
        this.endLoop();
        this.activeGame = false;        
    }
}

/* Kicks off the game loop */
Engine.prototype.startLoop = function() {
    this.prev = window.performance.now();
    this.loopId = this.loop(this.prev);
    this.activeGame = true;
}

/* Stops the game loop */
Engine.prototype.endLoop = function() {
    cancelAnimationFrame(this.loopId);
    this.loopId = null;
}

/* Clears the input queue */
Engine.prototype.resetInputQueue = function() {
    this.moves.clear();
}