#include <string.h>

int const NUM_ROWS = 8, NUM_COLS = 8;
char board[NUM_ROWS][NUM_COLS] = {
    {'R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'},
    {'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'},
    {' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '},
    {' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '},
    {' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '},
    {' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '},
    {'p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'},
    {'r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'}
};
int rowVals[NUM_ROWS];
int colVals[NUM_COLS];
// initialize these arrays by reading analog pins
int rowCounts[NUM_ROWS] = {8, 8, 0, 0, 0, 0, 8, 8};
int colCounts[NUM_COLS] = {4, 4, 4, 4, 4, 4, 4, 4};
int epsilon = 5;
char player = 'w';
char playerTurn = 'w';
int rowPicked, colPicked;
int rowPlaced, colPlaced;
bool isPieceLifted = false;
bool isButtonPressed = false;
char pieceMoved;

void setup() {
  Serial.begin(9600);
  // init rowVals, colVals
  for (int i = 0; i < 8; i++) {
    rowVals[i] = analogRead(i);
  }
  for (int i = 0; i < 8; i++) {
    colVals[i] = analogRead(15-i); // pins are reversed
  }
  pinMode(13, INPUT_PULLUP);
}

void loop() {
  if (digitalRead(13) == LOW && !isButtonPressed) { // if button is pressed
        // Step 1: Check if a piece has been picked up or set down
        // loop through rowVals
        for(int i = 0; i < NUM_ROWS; i++) {
            if (analogRead(i) < rowVals[i] - epsilon) {
                rowCounts[i]--;
                rowPicked = i;
                isPieceLifted = true;
            } else if (analogRead(i) > rowVals[i] + epsilon) {
                rowCounts[i]++;
                rowPlaced = i;
                isPieceLifted = false;
            }
            rowVals[i] = analogRead(i);
        }
        // loop through colVals
        for(int i = 0; i < NUM_COLS; i++) {
            if (analogRead(15-i) < colVals[i] - epsilon) {
                colCounts[i]--;
                colPicked = i;
                isPieceLifted = true;
            } else if (analogRead(15-i) > colVals[i] + epsilon) {
                colCounts[i]++;
                colPlaced = i;
                isPieceLifted = false;
            }
            colVals[i] = analogRead(15-i);
        }
        // Step 2: If a piece was picked up this turn, save the piece
        if (isPieceLifted) {
            //Serial.println("piece lifted");
            pieceMoved = board[rowPicked][colPicked];
        } else { // if a piece is placed, update the board
            //delay(50);
            //Serial.println("piece placed");
            board[rowPlaced][colPlaced] = pieceMoved;
            board[rowPicked][colPicked] = ' ';
            isPieceLifted = false;
            playerTurn = playerTurn == 'w' ? 'b' : 'w';
            sendFen();
        }
        isButtonPressed = true;
        delay(400);
    }
    isButtonPressed = false;
}

void sendFen() {
    //Serial.println("send fen");
    //delay(50);
    String fen = "";
    int numEmpty = 0;
    for (int i = NUM_ROWS-1; i >= 0; i--) {
        for (int j = 0; j < NUM_COLS; j++) {
            if (board[i][j] == ' ') {
                numEmpty++;
            } else {
                // check if we need to add number
                if (numEmpty > 0) {
                    fen += String(numEmpty);
                }
                fen += board[i][j];
                numEmpty = 0;
            }
        }
          if (numEmpty > 0) {
              fen += String(numEmpty);
          }
          numEmpty = 0;
          if (i != 0) {fen += '/';};
    }
    fen += ' ';
    fen += playerTurn;
    fen += " - - 0 0";
    fen += player == playerTurn ? 'b' : 'e';
    //delay(200);
    Serial.println(fen); // the python script will read these values
}
