; // defensive programming: script may be concatenated with others

/*
 * Sliding Puzzle | v1.0
 * Copyright (c) 2014 Ole Frank Jensen
 * Licensed under the MIT license
 */

var slidingPuzzle;
slidingPuzzle = (function () {

    "use strict";

    var puzzle,
        solution,
        moveCount,
        timer,
        time,
        numRows,
        isFinish,
        clickedElement,
        emptyElement,
        timerText,
        moveCountText,
        puzzleElement,
        cellSize,
        puzzleSize;

    window.addEventListener("load", updateSizes, false);
    window.addEventListener("resize", updateSizes, false);


    function startingState(numPieces) {
        startGame(9, false);
        stopGame();
    }

    function initPuzzle(numPieces) {
        // warning if puzzle is not a square
        numRows = Math.sqrt(numPieces);
        checkIfPuzzleIsSquare(numRows);

        timerText = $("#time");
        moveCountText = $("#moveCount");
        puzzleElement = $("#puzzle");

        // init game
        time = 0;
        moveCount = 0;
        isFinish = false;

        // clear timer
        clearTimer();
    }

    function startGame(numPieces, shufflePieces) {
        // init
        initPuzzle(numPieces);

        // generate puzzle
        var generated = generatePuzzle(numPieces);
        solution = generated.solution;

        if (shufflePieces) {
            puzzle = generated.puzzle;
        }
        else {
            puzzle = generated.solution;
        }

        var html = createHTML(puzzle);
        drawPuzzle(html);
        updateSizes();

        TweenMax.to($(".start-help"),.5, {opacity:0, bottom: -100, ease: "Strong.easeIn"});

        $("#timeLabel").text("Time");
        updateTimerText(time);
        $("#moveCountLabel").text("Moves");
        updateMoveCountText(moveCount);
        $(".piece").removeClass("solved");

        // start timer
        startTimer();

        // piece click handler
        if (!isFinish) {
            //$("span.piece").on("mousedown touch", function() {
            $(".piece").on("vmousedown", function(e) {
                clickedElement = $(this);

                var piece = this.innerHTML;
                var p = findPiece(piece);
                var n = findEmptyNeighbour(p);

                if (n !== null) {
                    move(p, n);
                }
            });
        }
    }

    function updateSizes() {
        // update GUI
        cellSize = $(".piece").css("width");
        puzzleSize = $("#puzzle>div:first-of-type").css("width");
        $(".piece").css({
            "height": cellSize,
            "background-size": puzzleSize
        });
    }

    function stopGame() {
        clearTimer();

        // remove click handler
        //$("span.piece").off("mousedown touch");
        $(".piece").off("vmousedown");

        // update GUI
        $(".piece").addClass("solved");
        if (numRows === 3) $(".piece0").addClass("piece9").removeClass("piece0");
        else if (numRows === 4) $(".piece0").addClass("piece16").removeClass("piece0");
        else if (numRows === 5) $(".piece0").addClass("piece25").removeClass("piece0");

        TweenMax.to($(".start-help"),.4, {opacity:1, bottom: 0, delay:.5, ease: "Strong.easeOut"});
    }

    function startTimer() {
        timer = setInterval(function() {
            time++;
            updateTimerText(time);
        }, 1000);
    }

    function clearTimer() {
        clearInterval(timer);
    }

    function generatePuzzle(numPieces) {
        var solutionArr = createSolutionArray(numPieces);
        var solution = listToMatrix(solutionArr, numRows);

        // find valid solution
        var done = false;
        var puzzleArr;
        while (!done) {
            puzzleArr = shuffleArray(solutionArr);
            done = isSolutionValid(puzzleArr);
        }

        // convert to 2d array
        var puzzle = listToMatrix(puzzleArr, numRows);

        return {solution: solution, puzzle: puzzle};
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

    function createHTML(puzzleArr) {
        var html = "";
        var colClass = "";
        var pieceClass = "";

        // css column class
        if (numRows === 3) {
            colClass = "threeCol";
            html += "<div class='ui-grid-b'>";
        }
        else if (numRows === 4) {
            colClass = "fourCol";
            html += "<div class='ui-grid-c'>";
        }
        else {
            colClass = "fiveCol";
            html += "<div class='ui-grid-d'>";
        }

        var uiClassArr = ["ui-block-a", "ui-block-b", "ui-block-c", "ui-block-d", "ui-block-e"];
        var uiIndex = 0;
        for (var i = 0; i < puzzleArr.length; i++) {

            for (var j = 0; j < puzzleArr[i].length; j++) {

                pieceClass = (puzzleArr[i][j].text === "")
                    ? "piece0"
                    : pieceClass = "piece" + puzzleArr[i][j].id;

                uiIndex = j % numRows;

                html += "<div class='unselectable piece" +
                    " " + colClass +
                    " " + pieceClass +
                    " " + uiClassArr[uiIndex] +
                    " hideText" +
                    "'>" + puzzleArr[i][j].text +
                    "</div>";
            }
        }

        html += "</div>";

        return html;
    }

    function drawPuzzle(html) {
        puzzleElement.empty();
        puzzleElement.append(html);
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

    function animatePieces() {
        emptyElement = $(".piece0");

        var emptyPos = emptyElement.position();
        var curPos = clickedElement.position();

        var left = emptyPos.left - curPos.left;
        var top = emptyPos.top - curPos.top;

        // moving piece
        TweenLite.to(clickedElement,.3, {
            left:"+=" + left + "px",
            top: "+=" + top + "px",
            ease: "Strong.easeOut"
        });

        // empty piece
        TweenLite.to(emptyElement, 0, {
            left:"-=" + left + "px",
            top: "-=" + top + "px"
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
            rowNumber = numRows,
            isBlankOnEvenRow = false;

        // is grid width even
        gridWidth = Math.sqrt(puzzleArr.length);
        isGridWidthEven = (gridWidth % 2) === 0;

        // is number of inversions even
        for (var i = 0; i < puzzleArr.length; i++) {

            // is blank piece on even row from bottom
           if ( puzzleArr[i].text === "" && (rowNumber % 2 !== 0) ) {
                isBlankOnEvenRow = true;
            }

            if (i % gridWidth === 0) {
                rowNumber--;
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

    return {
        startingState: startingState,
        startGame: startGame
    };

})();
