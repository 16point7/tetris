require('../style/base.css');
require('../style/themes.css');
var Engine = require('./engine.js').Engine;

window.onload = function() {
    window.activePage = document.getElementById('menu');
    window.addEventListener('keypress', function(e){
        switch(e.key) {
            case '1':
                document.body.classList.remove(document.body.classList[0]);
                document.body.classList.add('theme1');
                break;
            case '2':
                document.body.classList.remove(document.body.classList[0]);
                document.body.classList.add('theme2');
                break;
            case '3':
                document.body.classList.remove(document.body.classList[0]);
                document.body.classList.add('theme3');
                break;
            case '4':
                document.body.classList.remove(document.body.classList[0]);
                document.body.classList.add('theme4');
                break;
            case '5':
                window.activePage.classList.toggle('show');
                window.activePage = document.getElementById('menu');
                window.activePage.classList.toggle('show');
                break;
            case '6':
                window.activePage.classList.toggle('show');
                window.activePage = document.getElementById('game');
                window.activePage.classList.toggle('show');
                break;
            case '7':
                window.activePage.classList.toggle('show');
                window.activePage = document.getElementById('options');
                window.activePage.classList.toggle('show');
                break;
            case '8':
                window.activePage.classList.toggle('show');
                window.activePage = document.getElementById('high-scores');
                window.activePage.classList.toggle('show');
                break;75
                   break;
            case '9':
                window.activePage.classList.toggle('show');
                window.activePage = document.getElementById('credits');
                window.activePage.classList.toggle('show');
                break;
            case '0':
                window.activePage.classList.toggle('show');
                window.activePage = document.getElementById('paused');
                window.activePage.classList.toggle('show');
                break;
        }
    });
    window.game = new Engine();
};