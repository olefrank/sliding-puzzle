"use strict";

var puzzle;
var solution;
var moveCount = 0;
var timer;
var time = 0;
var isStarted = false;
var timerText;
var moveCountText;
var numPieces = 9;
var numRows;
var isFinish = false;
var clickedElement;
var emptyElement;

$(document).ready(function() {
    timerText = $("#time");
    moveCountText = $("#moveCount");

    // first show solution
    var solutionArr = createSolutionArray(9);
    numRows = 3;
    solution = listToMatrix(solutionArr, numRows);
    var html = createHTMLPuzzle(solution);
    drawPuzzle(html);
    stopGame();

    // button handlers
    $("a.grid_3").on("click", function() {
        numPieces = 9;
        initPuzzle(numPieces);
    });
    $("a.grid_4").on("click", function() {
        numPieces = 16;
        initPuzzle(numPieces);
    });
    $("a.grid_5").on("click", function() {
        numPieces = 25;
        initPuzzle(numPieces);
    });
});

function initPuzzle(numPieces) {
    // warning if puzzle is not a square
    numRows = Math.sqrt(numPieces);
    checkIfPuzzleIsSquare(numRows);

    // puzzle
    puzzle = generatePuzzle(numPieces);
    var html = createHTMLPuzzle(puzzle);
    drawPuzzle(html);

    // init game
    time = 0;
    moveCount = 0;
    isFinish = false;
    isStarted = false;

    // update GUI
    updateTimerText(time);
    updateMoveCountText(moveCount);
    $(".piece").css("border", "1px solid black");
    $(".piece").css("padding", "0");

    if (!isFinish) {
        $("span.piece").on("click", function() {
            clickedElement = $(this);

            if(!isStarted) {
                startTimer();
                isStarted = true;
            }

            var piece = this.innerHTML;
            var p = findPiece(piece);

            var n = findEmptyNeighbour(p);

            if (n !== null) {
                move(p, n);
            }
        });
    }
}

function generatePuzzle(numPieces) {
    var solutionArr = createSolutionArray(numPieces);
    solution = listToMatrix(solutionArr, numRows);

    // find valid solution
    var done = false;
    var puzzleArr;
    while (!done) {
        puzzleArr = shuffleArray(solutionArr);
        done = isSolutionValid(puzzleArr);
    }

    // convert to 2d array
    var puzzle = listToMatrix(puzzleArr, numRows);

    return puzzle;
}

function createSolutionArray(numPieces) {
    var puzzle = [];
    var piece;
    var yCounter = -1;

    for (var i = 0; i < numPieces; i++) {
        if (i % numRows == 0) {
            yCounter++;
        }
        piece = {
            id: i+1,
            text: i+1
        };
        puzzle.push(piece);
    }

    // last piece is empty
    puzzle[numPieces-1].text = "";

    return puzzle;
}

function createHTMLPuzzle(puzzleArr) {
    var html = "";
    var colClass = ""
    var pieceClass = "";

    // css column class
    if (numRows === 3) { colClass = "threeCol"; }
    else if (numRows === 4) { colClass = "fourCol"; }
    else { colClass = "fiveCol"; }

    for (var i = 0; i < puzzleArr.length; i++) {
        html += "<div>"
        
        for (var j = 0; j < puzzleArr[i].length; j++) {
            pieceClass = (puzzleArr[i][j].text === "")
                ? "piece0"
                : pieceClass = "piece" + puzzleArr[i][j].id;

            html += "<span class='unselectable piece" +
                        " " + colClass +
                        " " + pieceClass +
                        "'>" + puzzleArr[i][j].text +
                    "</span>";
        }
        html += "</div>";
    }

    return html;
}

function drawPuzzle(html) {
    $("span.piece").off("click");

    $("#puzzle").empty();
    $("#puzzle").append(html);
}

function move(piece, neighbour) {
    moveCount++;

    var pX = piece.x,
        pY = piece.y,
        nX = neighbour.x,
        nY = neighbour.y;

    var b = puzzle[nY][nX];
    puzzle[nY][nX] = puzzle[pY][pX];
    puzzle[pY][pX] = b;

    puzzle[pY][pX].x = pX;
    puzzle[pY][pX].y = pY;
    puzzle[nY][nX].x = nX;
    puzzle[nY][nX].y = nY;

    animatePieces();
    updateMoveCountText(moveCount);

    isFinish = isSolved();
    if (isFinish) {
        stopGame();
    }
}

// todo
function startGame() {
    updateMoveCountText(moveCount);
    updateTimerText(time);
    startTimer();

    $(".piece").css("border", "1px solid black");
    $(".piece").css("padding", "0");
    $(".piece9").addClass("piece0").removeClass("piece9");
    isStarted = true;

}

function stopGame() {
    stopTimer();
    $(".piece").css("border", "none");
    $(".piece").css("padding", "1px");
    $(".piece0").addClass("piece9").removeClass("piece0");
    isStarted = false;
}

function animatePieces() {
    emptyElement = $(".piece0");
    var emptyPos = emptyElement.position();
    var curPos = clickedElement.position();

    var left = emptyPos.left - curPos.left;
    var top = emptyPos.top - curPos.top;

    // moving piece
    TweenLite.to(clickedElement, .2, {
        left:"+=" + left + "px",
        top: "+=" + top + "px",
        ease:Strong.easeOut
    });

    // empty piece
    TweenLite.to(emptyElement, 0, {
        left:"+=" + -left + "px",
        top: "+=" + -top + "px"
    });
}

function isSolved() {
    for (var i = 0; i < puzzle.length; i++) {
        for (var j = 0; j < puzzle[i].length; j++) {
            if (puzzle[i][j].text !== solution[i][j].text) {
                return false;
            }
        }
    }

    return true;
}

function findPiece(text) {
    var piece = {};

    for (var i = 0; i < puzzle.length; i++) {
        for (var j = 0; j < puzzle[i].length; j++) {
            if (puzzle[i][j].text == text) {
                piece = puzzle[i][j];
            }
        }
    }

    return piece;
}

function findEmptyNeighbour(piece) {
    var result = null,
        x = piece.x,
        y = piece.y;

    // left
    if (x > 0 && puzzle[y][x-1].text == "") {
        result = puzzle[y][x-1];
    }
    // right
    else if (x < puzzle.length-1 && puzzle[y][x+1].text == "") {
        result = puzzle[y][x+1];
    }
    // top
    else if (y > 0 && puzzle[y-1][x].text == "") {
        result = puzzle[y-1][x];
    }
    // bottom
    else if (y < puzzle.length-1 && puzzle[y+1][x].text == "") {
        result = puzzle[y+1][x];
    }

    return result;
}



function startTimer() {
    timer = setInterval(function() {
        time++;
        updateTimerText(time);
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}



function updateTimerText(secs) {
    timerText.html(secsToMMSS(secs));
}

function updateMoveCountText(moveCount) {
    moveCountText.html(moveCount);
}



function listToMatrix(list, elementsPerSubArray) {
    var matrix = [], i, k, elem, xCount = -1 ;

    for (i = 0, k = -1; i < list.length; i++) {
        if (i % elementsPerSubArray === 0) {
            k++;
            xCount = -1;
            matrix[k] = [];
        }

        xCount++;

        elem = list[i];
        elem.x = xCount;
        elem.y = k;

        matrix[k].push(elem);
    }

    return matrix;
}

function shuffleArray(arr) {
    for (var j, x, i = arr.length; i; j = Math.floor(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;
}

function isSolutionValid(puzzleArr) {
    var gridWidth,
        isGridWidthEven,
        numInversions = 0,
        isNumInversionsEven,
        rowNumber = 0,
        isBlankOnEvenRow = false;

    // is grid width even
    gridWidth = Math.sqrt(puzzleArr.length);
    isGridWidthEven = (gridWidth % 2) === 0;

    // is number of inversions even
    for (var i = 0; i < puzzleArr.length; i++) {

        // is blank piece on even row from bottom
        if (i % gridWidth === 0) {
            rowNumber++;
        }
        if ( puzzleArr[i].text === "" && (rowNumber % 2 === 0) ) {
            isBlankOnEvenRow = true;
        }

        for (var j = i; j < puzzleArr.length; j++) {
            var num1 = parseInt(puzzleArr[i].text);
            var num2 = parseInt(puzzleArr[j].text);

            if (num1 > num2) {
                numInversions++;
            }
        }
    }
    isNumInversionsEven = (numInversions % 2) === 0;

    return (
        (!isGridWidthEven && isNumInversionsEven)  ||
            ( isGridWidthEven && (!isBlankOnEvenRow == isNumInversionsEven) )
        );
}

function checkIfPuzzleIsSquare(numRows) {
    try {
        if (numRows !== parseInt(numRows)) {
            throw "Puzzle must be square";
        }
    }
    catch(e) {
        alert(e);
        return;
    }
}

function secsToMMSS(d) {
    d = Number(d);

    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    return ((m > 0 ? (m >= 10 ? m : '0' + m): '00') + ':' + (s > 0 ? (s >= 10 ? s : '0' + s): '00')  );
}