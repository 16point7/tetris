# Tetris
A lightweight implementation of Classic Tetris

## Current Version
v1.0

## Installation
Clone the repository and open bin/index.html in a web browser.

## How to Play
* N: new
* Q: quit
* P: pause
* Left, Right, Down
* Space: drop
* Up: CW rotation
* Z: CCW rotation

## Implementation Details
Pieces are represented as 16-bit integers.

```javascript
Tetris.prototype.SHAPES = [
    [0x00F0, 0x2222, 0x00F0, 0x2222],   // shape-I
    [0x0E20, 0x44C0, 0x8E00, 0x6440],   // shape-J
    [0x0E80, 0xC440, 0x2E00, 0x4460],   // shape-L
    [0x0E40, 0x4C40, 0x4E00, 0x4640],   // shape-T
    [0x06C0, 0x4620, 0x06C0, 0x4620],   // shape-S
    [0x0C60, 0x2640, 0x0C60, 0x2640],   // shape-Z
    [0x0660, 0x0660, 0x0660, 0x0660]    // shape-O
];

/*
 * 0000
 * 1110
 * 0100    Tetris.prototype.SHAPES[3][0] = 0x0E40
 * 0000
 */
 ```
 The board is represented as an array of twenty 16-bit integers.
 ```javascript
 var board = Tetris.prototype.buildBoard(20);   // 4 lines spawn zone, 20 lines play, 4 lines bottom wall
 board.length == 28 // true
 board[0] == 2049   // true
 board[27] == 4095  // true
 
 /*
  * 0000100000000001    // board[0]
  * 0000100000000001
  * 0000100000000001
  * 0000100000000001
  * ...
  * 0000111111111111    // board[27]
  */
```
<code>i</code> and <code>j</code> describe position of the piece relative to the board.

Collision detection is a bit-wise <code>&</code> between board and piece rows.

```javascript
var frame = 0x0E40; // Tetris.prototype.SHAPES[3][0]

if(((0xF000 & frame ) >>> i ) & board[j])           // row 1
    return false;
if((((0x0F00 & frame) << 4) >>> i) & board[j+1])    // row 2
    return false;
if((((0x00F0 & frame) << 8) >>> i) & board[j+2])    // row 3 
    return false;
if((((0x000F & frame) << 12) >>> i) & board[j+3])   // row 4
    return false;
return true;    
```
Commiting piece to board is a bit-wise <code>|</code> between board and piece rows.

```javascript
var mask = 0xF000;
for (var j = 0; j < 4; j++) {
  board[piece.j+j] |= (((mask&piece.rotations[piece.rIdx])<<(4*j))>>>piece.i);
  mask >>>= 4;
}
```
Checking if a row is filled or empty is also simple.

```javascript
if (board[j] == 4095)   // filled
if (board[j] == 2049)   // empty
```
Game is rendered by 3 <code>canvas</code> layers. Only the layer that has changed is re-rendered.
* layer 1: board and grid lines
* layer 2: active piece
* layer 3: frozen pieces and next piece

Pieces are made "fair" by drawing from a grab-bag. This guarantees that every piece will be drawn at least once every 7 times (assuming piece frequency is 1). Piece frequency is 2 by defeault and can be configured. See <code>RandomSack</code> for implementation details.

## v2.0 Roadmap

* menu screen
* local storage
* music
* mobile support
* color themes