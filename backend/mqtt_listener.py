import json
import time
from datetime import datetime
import paho.mqtt.client as mqtt
import os

BROKER = "192.168.1.40" 
PORT = 1883

TOPIC_SENSORS = "iot_station/sensors"
TOPIC_STATUS  = "iot_station/status"

SENSORS_FILE = "sensors.json"
STATUS_FILE  = "status.json"

def load_json(filename, default):
    if os.path.exists(filename):
        try:
            with open(filename, "r") as f:
                content = f.read().strip()
                if not content:
                    return default
                return json.loads(content)
        except json.JSONDecodeError:
            print(f"Warning: {filename} ")
            return default
    return default

def save_json(filename, data):
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)

def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT with code", rc)
    client.subscribe([(TOPIC_SENSORS, 0), (TOPIC_STATUS, 0)])

def on_message(client, userdata, msg):
    payload = msg.payload.decode()
    print(f"{msg.topic} → {payload}")

    if msg.topic == TOPIC_SENSORS:
        try:
            data = json.loads(payload)
            data["timestamp"] = datetime.utcnow().isoformat()

            history = load_json(SENSORS_FILE, [])
            history.append(data)
            history = history[-1000:] 

            save_json(SENSORS_FILE, history)

        except Exception as e:
            print("Sensor JSON error:", e)

    elif msg.topic == TOPIC_STATUS:
        status = {
            "state": payload,
            "last_seen": datetime.utcnow().isoformat(),
            "last_seen_ts": time.time()
        }
        save_json(STATUS_FILE, status)

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(BROKER, PORT, 60)
client.loop_forever()
