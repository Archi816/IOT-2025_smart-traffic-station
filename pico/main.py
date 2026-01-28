import time
import machine

from wifi import connect_wifi
from mqtt_client import connect_mqtt, send_sensors, mqtt_poll
from sensors import read_sensors

connect_wifi()
connect_mqtt()

def main():
    while True:
        sensors = read_sensors()
        send_sensors(sensors)
        mqtt_poll()
        time.sleep(2)
    try:
        main()
    except Exception as e:
        print("Fatal error:", e)
        time.sleep(2)
        machine.reset()
