const http = require('http');
const express = require('express');
const app = express();
const stockfish = require('stockfish');
const engine = stockfish();
const port = 8080;
const depth = 10;

var bestMove = null;
var foundBestMove = false;
var score = 0;
var oldScore = score;
var calculatedScore = false;

app.use(express.urlencoded({ extended: true }));

app.post('/bestMove', function (req, res) {
    engine.postMessage('position fen ' + req.body.fen);
    engine.postMessage('go depth ' + depth);
    waitForBestMove(res);
});

app.post('/evaluateMove', function (req, res) {
    engine.postMessage('position fen ' + req.body.fen);
    engine.postMessage('go depth ' + depth);
    waitForEvaluateMove(res);
});

engine.onmessage = function(line) {
    var split = line.split(' ');
    if (split.indexOf('info') > -1 && split[split.indexOf('depth')+1] == depth) {
        score = split[split.indexOf('cp')+1];
        calculatedScore = true;
    } else if (split.indexOf('bestmove') > -1) {
        bestMove = split[1];
        foundBestMove = true;
    }
}

// https://stackoverflow.com/questions/3635924/how-can-i-make-a-program-wait-for-a-variable-change-in-javascript
function waitForBestMove(res) {
    if (!foundBestMove) {
        console.log("thinking...")
        setTimeout(function() {
            waitForBestMove(res);
        }, 50); // wait 50 milliseconds then recheck
        return;
    }
    // we reach here once bestMove has been found
    foundBestMove = false;
    console.log("found best move:");
    console.log(bestMove);
    oldScore = score;

    // send data to HoloLens
    // var requestOptions = {
    //     hostname: 'serverB.com', // url or ip address
    //     port: 8080, // default to 80 if not provided
    //     method: 'POST' // HTTP Method
    // };

    // var externalRequest = http.request(requestOptions, (externalResponse) => {

    //     // ServerB done responding
    //     externalResponse.on('end', () => {

    //         // Response to client
    //         res.end('data was send to serverB');
    //     });
    // });

    // // send data
    // externalRequest.write({ evaluation: score,
    //                         bestMove: bestMove });
    // externalRequest.end();
    // send data
    res.json({ evaluation: score,
                bestMove: bestMove });
    res.end();
}

function waitForEvaluateMove(res) {
    if (!calculatedScore) {
        console.log("thinking...")
        setTimeout(function() {
            waitForEvaluateMove(res);
        }, 50); // wait 50 milliseconds then recheck
        return;
    }
    // we reach here once score has updated
    console.log("found move evaluation:");
    // evaluate last move
    var diff = score - oldScore; // positive if evaluation got better
    oldScore = score;
    var moveDesc = '';
    if (diff >= 50) {
        moveDesc = 'excellent';
    } else if (diff >= 0) {
        moveDesc = 'good';
    } else if (diff >= -40) {
        moveDesc = 'inaccuracy';
    } else if (diff >= -90) {
        moveDesc = 'mistake';
    } else if (diff >= -200) {
        moveDesc = 'blunder';
    }
    console.log(moveDesc);

    // send data to HoloLens
    // var requestOptions = {
    //     hostname: 'serverB.com', // url or ip address
    //     port: 8080, // default to 80 if not provided
    //     method: 'POST' // HTTP Method
    // };

    // var externalRequest = http.request(requestOptions, (externalResponse) => {

    //     // ServerB done responding
    //     externalResponse.on('end', () => {

    //         // Response to client
    //         res.end('data was send to serverB');
    //     });
    // });

    // // send data
    // externalRequest.write({ evaluation: score,
    //                         moveDesc: moveDesc });
    // externalRequest.end();
    // send data
    res.json({ evaluation: score,
                moveDesc: moveDesc });
    res.end();
}
 
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
})

// rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
// rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1
// rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2