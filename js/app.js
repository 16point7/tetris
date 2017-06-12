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
        lineColor:'#7986cb',
        fillColor:'#1a237e',
        borderColor:'#1a237e',
        borderWeight:8,
        lineWeight:1,
        tetris: 
            {
                pieceFreq: 2,
                height: 20,
                startLevel:8
            }
    };

    window.game = new Engine(InputManager, GraphicsManager, Tetris, Queue, config);
}