import os
import json
import time
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import paho.mqtt.client as mqtt

from auth import router as auth_router


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SENSORS_FILE = os.path.join(BASE_DIR, "sensors.json")
STATUS_FILE = os.path.join(BASE_DIR, "status.json")

OFFLINE_TIMEOUT = 60

TOPIC_SENSORS = "iot_station/sensors"
TOPIC_STATUS = "iot_station/status"

MQTT_HOST = os.getenv("MQTT_HOST", "192.168.1.40")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))


def load_json_file(filename: str, default):
    if not os.path.exists(filename):
        return default
    try:
        with open(filename, "r", encoding="utf-8") as f:
            raw = f.read().strip()
            if not raw:
                return default
            return json.loads(raw)
    except Exception:
        return default


def save_json_file(filename: str, data):
    tmp = filename + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, filename)


def on_connect(client, userdata, flags, rc, properties=None):
    print(f"Connected to MQTT {MQTT_HOST}:{MQTT_PORT} with code {rc}")
    client.subscribe([(TOPIC_SENSORS, 0), (TOPIC_STATUS, 0)])


def on_message(client, userdata, msg):
    payload = msg.payload.decode("utf-8", errors="ignore")

    if msg.topic == TOPIC_SENSORS:
        try:
            data = json.loads(payload)
            data["timestamp"] = datetime.utcnow().isoformat()

            history = load_json_file(SENSORS_FILE, [])
            history.append(data)
            save_json_file(SENSORS_FILE, history[-1000:])
        except Exception as e:
            print("Sensor JSON error:", e)

    elif msg.topic == TOPIC_STATUS:
        status_data = {
            "state": payload,
            "last_seen": datetime.utcnow().isoformat(),
            "last_seen_ts": time.time(),
        }
        save_json_file(STATUS_FILE, status_data)


mqttc = mqtt.Client(protocol=mqtt.MQTTv5)
mqttc.on_connect = on_connect
mqttc.on_message = on_message


@asynccontextmanager
async def lifespan(app: FastAPI):
    mqttc.connect(MQTT_HOST, MQTT_PORT, 60)
    mqttc.loop_start()
    try:
        yield
    finally:
        mqttc.loop_stop()
        mqttc.disconnect()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ключевой момент: подключаем auth router, иначе /auth/* не существует [web:29][web:30]
app.include_router(auth_router)


@app.get("/api/status")
def get_status():
    data = load_json_file(STATUS_FILE, None)
    if not data:
        return {"state": "offline", "reason": "no status data"}

    last_seen_ts = float(data.get("last_seen_ts", 0))
    now = time.time()

    if now - last_seen_ts > OFFLINE_TIMEOUT:
        return {
            "state": "offline",
            "last_seen": data.get("last_seen"),
            "seconds_since_last_seen": int(now - last_seen_ts),
        }

    return {"state": "online", "last_seen": data.get("last_seen")}


@app.get("/api/latest")
def get_latest():
    data = load_json_file(SENSORS_FILE, [])
    if not data:
        return {"message": "No sensor data yet"}
    return data[-1]


@app.get("/api/history")
def get_history(limit: int = 100):
    data = load_json_file(SENSORS_FILE, [])
    if not data:
        raise HTTPException(status_code=404, detail="No sensor data")
    return data[-limit:]
