import serial
import pynmea2
import requests
import time

# backend API URL
API_URL = "http://YOUR_PC_IP:3000/gps"

# GPS serial port
PORT = "/dev/serial0"

# Tracker ID from database
TRACKER_ID = 1

# Open GPS serial
ser = serial.Serial(PORT, baudrate=115200, timeout=1)

print("Tracker started...")

while True:

    try:

        line = ser.readline().decode(
            'utf-8',
            errors='ignore'
        ).strip()

        # Parse only GPS GGA lines
        if line.startswith("$GNGGA"):

            msg = pynmea2.parse(line)

            data = {
                "Tracker_ID": TRACKER_ID,
                "lat": msg.latitude,
                "lng": msg.longitude
            }

            print("Sending:", data)

            response = requests.post(
                API_URL,
                json=data
            )

            print(
                "Server response:",
                response.status_code
            )

            # Send every 5 sec
            time.sleep(5)

    except KeyboardInterrupt:

        print("Stopped.")
        break

    except Exception as e:

        print("Error:", e)