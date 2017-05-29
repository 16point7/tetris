function Engine(InputManager, GraphicsManager, Tetris, Queue, config) {
    this.im = new InputManager();
    this.gm = new GraphicsManager();
    this.tt = new Tetris();

    this.cf = config;

    this.moves = new Queue(32);

    this.activeGame;
    this.loopId;
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
    console.log('Engine.setup()');
}

/* Things to do in every frame */
Engine.prototype.loop = function(time) {
    var delta = time - this.prev;
    this.tt.update(this.moves, delta);
    this.gm.render(this.tt.data, delta);
    this.prev = time;
    this.loopId = requestAnimationFrame(this.loop);
}

/* Pipeline for gameplay events to flow from KeyboardManager to Engine */
Engine.prototype.action = function(e) {    
    if (this.loopId != null)
        this.moves.push(e);
    console.log('Engine.action()');
}

/* Pipeline for new game event to flow from KeyboardManager to Engine */
Engine.prototype.newGame = function() {
    if (!this.activeGame) {
        this.tt.newState();
        this.gm.newState();
        this.resetInputQueue();
        this.activeGame = true;
        this.startLoop();        
    }
    console.log('Engine.newGame()');
}

/* Pipeline for pause game event to flow from KeyboardManager to Engine */
Engine.prototype.pauseGame = function() {
    if (this.activeGame) {
        if (this.loopId == null)
            this.startLoop();
        else
            this.endLoop();
    }
    console.log('Engine.pauseGame()');
}

/* Pipeline for end game event to flow from KeyboardManager to Engine */
Engine.prototype.endGame = function() {
    if (this.activeGame) {
        this.tt.endState();
        this.gm.endState();
        this.endLoop();
        this.activeGame = false;        
    }
    console.log('Engine.endGame()');
}

/* Kicks off the event loop */
Engine.prototype.startLoop = function() {
    this.prev = window.performance.now();
    this.loopId = this.loop(this.prev);
    this.activeGame = true;
    console.log('Engine.launchGame()');
}

/* Stops the event loop */
Engine.prototype.endLoop = function() {
    cancelAnimationFrame(this.loopId);
    this.loopId = null;
    console.log('Engine.endLoop()');
}

/* Clear the game input queue */
Engine.prototype.resetInputQueue = function() {
    this.moves.clear();
}