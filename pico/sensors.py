import time
import dht
from machine import Pin, ADC

from config import (
    VIB_SAMPLES, MIC_SAMPLES,
    VIB_ON_DELTA, VIB_OFF_DELTA,
    VIB_DO_CONSECUTIVE,
    VIB_EVENT_COOLDOWN_MS
)

# DHT22
dht_sensor = dht.DHT22(Pin(27))

# Vibration
vib_digital = Pin(7, Pin.IN)
vib_analog = ADC(Pin(28))

# Mic (MAX9814)
mic_sensor = ADC(Pin(26))

_vib_baseline = None
_vib_state = False
_last_event_ms = 0
_do_ones = 0

def _median(values):
    s = sorted(values)
    return s[len(s)//2]

def _read_adc_median(adc, n):
    vals = [adc.read_u16() for _ in range(n)]
    return _median(vals)

def _update_baseline(value):
    global _vib_baseline
    if _vib_baseline is None:
        _vib_baseline = value
    else:
        _vib_baseline = int(_vib_baseline * 0.98 + value * 0.02)

def read_sensors():
    global _vib_state, _last_event_ms, _do_ones

    data = {}

    # DHT22
    try:
        dht_sensor.measure()
        data["temperature"] = dht_sensor.temperature()
        data["humidity"] = dht_sensor.humidity()
    except Exception as e:
        data["temperature"] = None
        data["humidity"] = None
        data["dht_error"] = str(e)

    # Vibration
    try:
        if vib_digital.value():
            _do_ones += 1
        else:
            _do_ones = 0
        do_event = _do_ones >= VIB_DO_CONSECUTIVE

        vib_value = _read_adc_median(vib_analog, VIB_SAMPLES)
        _update_baseline(vib_value)
        delta = vib_value - _vib_baseline

        if (not _vib_state) and (delta > VIB_ON_DELTA):
            _vib_state = True
        elif _vib_state and (delta < VIB_OFF_DELTA):
            _vib_state = False

        now_ms = time.ticks_ms()
        can_fire = time.ticks_diff(now_ms, _last_event_ms) > VIB_EVENT_COOLDOWN_MS

        vibration_event = False
        if can_fire and (do_event or _vib_state):
            vibration_event = True
            _last_event_ms = now_ms

        data["vibration_raw"] = vib_value
        data["vibration_baseline"] = _vib_baseline
        data["vibration_delta"] = delta
        data["vibration_detected"] = bool(_vib_state)
        data["vibration_event"] = bool(vibration_event)

    except Exception as e:
        data["vibration_event"] = None
        data["vibration_detected"] = None
        data["vibration_raw"] = None
        data["vib_error"] = str(e)

    # Mic
    try:
        mic_val = _read_adc_median(mic_sensor, MIC_SAMPLES)
        data["sound_raw"] = mic_val
        data["sound_level"] = mic_val
    except Exception as e:
        data["sound_raw"] = None
        data["sound_level"] = None
        data["mic_error"] = str(e)

    return data
