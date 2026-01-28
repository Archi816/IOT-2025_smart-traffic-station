import network
import time
from config import WIFI_SSID, WIFI_PASSWORD

def connect_wifi(timeout_s=20):
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)

    if wlan.isconnected():
        ip = wlan.ifconfig()[0]
        print("Wi-Fi already connected:", ip)
        return ip

    print("Connecting to Wi-Fi...")
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    t0 = time.time()
    while not wlan.isconnected():
        if time.time() - t0 > timeout_s:
            raise RuntimeError("Wi-Fi connect timeout")
        time.sleep(0.5)

    print("Wi-Fi connected:", wlan.ifconfig())
    return wlan.ifconfig()[0]
