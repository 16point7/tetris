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
                        initialDropRate: 500
                    }           
                };
    window.game = new Engine(InputManager, GraphicsManager, Tetris, Queue, config);
}