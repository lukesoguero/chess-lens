import serial
import requests

url = "https://chess-engine-306911.uc.r.appspot.com"

try:
    arduino = serial.Serial("COM3", 9600)
except:
    print("Failed to connect Arduino")

while True:
    fen = str(arduino.readline())
    endpoint = fen[-6]
    fen = fen[:-6]
    print(fen)
    print(endpoint)
    # create request
    data = {"fen": fen}
    if endpoint == 'b':
        r = requests.post(url = url+"/bestMove", data = data)
    else:
        r = requests.post(url = url+"/evaluateMove", data = data)
    print(r.text)