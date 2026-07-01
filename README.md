# Smart Traffic Station

A real-time IoT monitoring system for urban traffic and environmental sensing.

## Architecture

Raspberry Pi Pico → MQTT → Python Backend → Next.js Dashboard

## Features

- Real-time sensor data (temperature, humidity, sound, congestion)
- Interactive map with sensor locations
- Live charts and historical data visualization
- User authentication (register/login)
- Fully containerized with Docker

## Tech Stack

**Hardware:** Raspberry Pi Pico · Environmental & sound sensors  
**Protocol:** MQTT (Mosquitto broker)  
**Backend:** Python · FastAPI · Docker  
**Frontend:** Next.js · React · Tailwind CSS  
**Deployment:** Docker Compose  

## Run Locally

```bash
docker-compose up --build
```
