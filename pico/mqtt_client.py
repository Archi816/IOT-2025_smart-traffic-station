from umqtt.simple import MQTTClient
import time
import ujson
import machine

from config import (
    MQTT_BROKER, MQTT_PORT, MQTT_USER, MQTT_PASSWORD,
    MQTT_TOPIC_SENSORS, MQTT_TOPIC_STATUS
)

CLIENT_ID = b"pico_client"
KEEPALIVE = 60
PING_EVERY = 20

_client = None
_last_ping = 0

def _b(s):
    return s if isinstance(s, (bytes, bytearray)) else str(s).encode("utf-8")

def connect_mqtt():
    global _client, _last_ping

    print("Connecting to MQTT:", MQTT_BROKER, MQTT_PORT)

    _client = MQTTClient(
        client_id=CLIENT_ID,
        server=MQTT_BROKER,
        port=MQTT_PORT,
        user=(MQTT_USER or None),
        password=(MQTT_PASSWORD or None),
        keepalive=KEEPALIVE
    )

    _client.set_last_will(_b(MQTT_TOPIC_STATUS), b"offline", retain=True)
    _client.connect(clean_session=True)
    _client.publish(_b(MQTT_TOPIC_STATUS), b"online", retain=True)

    _last_ping = time.time()
    print("Connected to MQTT broker")
    return _client

def _ensure():
    global _client
    if _client is None:
        return connect_mqtt()
    return _client

def mqtt_poll():
    global _last_ping
    c = _ensure()
    now = time.time()

    if now - _last_ping >= PING_EVERY:
        try:
            c.ping()
            c.check_msg()
            _last_ping = now
        except Exception as e:
            print("MQTT ping failed:", e)
            machine.reset()

def send_sensors(data: dict):
    c = _ensure()
    try:
        payload = ujson.dumps(data).encode("utf-8")
        c.publish(_b(MQTT_TOPIC_SENSORS), payload)
    except Exception as e:
        print("Publish failed:", e)
        machine.reset()

def send_heartbeat():
    c = _ensure()
    try:
        c.publish(_b(MQTT_TOPIC_STATUS), b"online", retain=True)
    except Exception:
        machine.reset()
