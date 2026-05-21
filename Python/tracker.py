import websocket
import json
import serial
import pynmea2
import time

WS_URL = "ws://YOUR_PC_IP:5000"

TRACKER_ID = 1

PORT = "/dev/serial0"

ser = serial.Serial(
    PORT,
    baudrate=115200,
    timeout=1
)

ws = websocket.WebSocket()

ws.connect(WS_URL)

print("Connected to websocket")

while True:

    try:

        line = ser.readline().decode(
            'utf-8',
            errors='ignore'
        ).strip()

        if "GGA" in line:

            msg = pynmea2.parse(line)

            data = {
                "event": "gps",
                "data": {
                    "trackerId": TRACKER_ID,
                    "lat": msg.latitude,
                    "lng": msg.longitude
                }
            }

            ws.send(json.dumps({"event": "gps", "data": data}))

            print("GPS sent:", data)

            time.sleep(5)

    except KeyboardInterrupt:

        ws.close()

        print("Stopped")

        break

    except Exception as e:

        print("Error:", e)