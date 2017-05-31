window.onload = function() {
    var config = {
        keyMap:
            {
                LEFT:37,
                RIGHT:39,
                DOWN:40,
                DROP:32,
                RTURN:38,
                LTURN:90,
                NEW:78,
                PAUSE:80,
                QUIT:81
            },
        containerId:'zone',
        tetris: 
            {
                dropPeriod: 250,
                pieceFreq: 1,
                height: 24
            }           
    };
    window.console.lag = window.console.log;
    window.console.log = function(){};
    window.game = new Engine(InputManager, GraphicsManager, Tetris, Queue, config);
}