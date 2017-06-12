/* Setup */
var Piece = Tetris.prototype.Piece;
var board = Tetris.prototype.buildBoard(24);

var I = [0x00F0, 0x2222, 0x00F0, 0x2222];
var J = [0x0E20, 0x22E0, 0x8E00, 0x6440];
var L = [0x0F80, 0xC440, 0x2E00, 0x4460];
var T = [0x0E40, 0x4C40, 0x4E00, 0x4640];
var S = [0x06C0, 0x4620, 0x06C0, 0x4620];
var Z = [0x0C60, 0x2640, 0x0C60, 0x2640];
var O = [0x0660, 0x0660, 0x0660, 0x0660];
var pieces = [I,J,L,T,S,Z,O];

var I_START = 7;
var J_START = 0;

var log = log;

/* Helper Methods */

/* 
 * 100000000001
 * 100000000001     <== a 4x10 board
 * 100000000001
 * 100000000001     (1's = wall, 0's = space)
 * 111111111111
 */
function buildBoard(height) {
    var board = new Int16Array(new ArrayBuffer(2*(height+4)));
    resetBoard(board);
    return board;
}

function resetBoard(board) {
    for (var j = 0; j < board.length-4; j++)
        board[j] = 245775;      //side walls
    for (var j = board.length-4; j < board.length; j++)
        board[j] = 262143;      //bottom wall
}

function printPiece(piece) {
    var result = '\n';
    var mask = 0xF000;
    for (var j = 0; j < 4; j++) {
        var row = ((piece&mask)>>(12-4*j));
        var submask = 8;
        for (var i = 0; i < 4; i++) {
            result += (submask & row) == 0 ? '0' : '1';
            submask >>= 1;
        }
        result += '\n';
        mask >>= 4;
    }
    log(result);
}

function printBoard(board) {
    var result = '\n';
    for (var j = 0; j < board.length; j++) {
        var mask = 0b100000000000000000;
        for (var i = 0; i < 18; i++) {
            result += (mask & board[j]) == 0 ? '0' : '1';
            mask >>= 1;
        }
        result += '\n';
    }
    log(result);
}

function writePieceToBoard(board, piece, j, i) {
    var mask = 0xF000;
    for (var k = 0; k < 4; k++) {
        var row = ((mask & piece) << (2+(4*k)));
        row >>= i;
        board[j+k] |= row;
        mask >>= 4;
    }
}

function printBoardAndPiece(board, piece, j, i) {
    writePieceToBoard(board,piece, j, i);
    printBoard(board);
    resetBoard(board);
}


/* TEST 1: Tetris.prototype.valid(j, i, frame, board) */
log('TEST 1: Tetris.prototype.valid(j, i, frame, board)');
var f = Tetris.prototype.valid;

/* TEST 1.1 - Place at starting point */
function testStartingPoint() {
    log('TEST 1.1 - Place at starting point');
    for (var i = 0; i < pieces.length; i++) {
        var result;
        if (f(J_START, I_START, pieces[i], 0))
            result = 'PASS';
        else
            result = 'FAIL';
        log('Piece ' + i + ' ' + result);
    }
    log('');
}

/* TEST 1.2 - Left boundary translational collision */
function testLeftBoundaryTranslationalCollision() {
    log('TEST 1.2 - Left boundary translational collision');
    for (var i = 0; i < pieces.length; i++) {
        log('Testing piece ' + i);
        for (var j = 0; j < pieces[i].length; j++) {
            var piece = pieces[i][j];
            log('Testing this orientation:');
            printPiece(piece);
            var k = I_START;
            while (f(J_START, k, piece, board)) {
                printBoardAndPiece(board, piece, J_START, k);
                k--;
            }
            log('Failed in ' + (I_START - k) + ' steps at position i = ' + k);
        }
    }
    log('');
}

/* TEST 1.3 - Right boundary translational collision */
function testRightBoundaryTranslationalCollision() {
    log('TEST 1.3 - Right boundary translational collision');
    for (var i = 0; i < pieces.length; i++) {
        log('Testing piece ' + i);
        for (var j = 0; j < pieces[i].length; j++) {
            var piece = pieces[i][j];
            log('Testing this orientation:');
            printPiece(piece);
            var k = I_START;
            while (f(J_START, k, piece, board)) {
                printBoardAndPiece(board, piece, J_START, k);
                k++;
            }
            log('Failed in ' + (k - I_START) + ' steps at position i = ' + k);
        }
    }
    log('');
}

/* TEST 1.4 - Bottom boundary translational collision */
function testBottomBoundaryTranslationalCollision() {
    log('TEST 1.4 - Bottom boundary translational collision');
    for (var i = 0; i < pieces.length; i++) {
        log('Testing piece ' + i);
        for (var j = 0; j < pieces[i].length; j++) {
            var piece = pieces[i][j];
            log('Testing this orientation:');
            printPiece(piece);
            var k = J_START;
            while (f(k, I_START, piece, board)) {
                printBoardAndPiece(board, piece, k, I_START);
                k++;
            }
            log('Failed in ' + (k - J_START) + ' steps at position j = ' + k);
        }
    }
    log('');
}

/* TEST 1.5 - Left boundary rotational collision */

/* TEST 1.6 - Right boundary rotational collision */

/* TEST 1.7 - Bottom boundary rotational collision */

