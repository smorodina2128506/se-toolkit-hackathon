# FridgeTracker

A web app that tracks expiry dates of your fridge items and warns you before they go bad.

## Demo

![Dashboard](screenshots/Снимок%20экрана%202026-04-09%20145308.png)
![Products list](screenshots/Снимок%20экрана%202026-04-09%20145534.png)

## Product Context

**End users:** Anyone who buys groceries and stores food at home.

**Problem:** People forget about products in the fridge and throw them away after the expiry date — wasting money and food.

**Solution:** FridgeTracker lets you add products with expiry dates and instantly see what needs to be used soon. Items are color-coded by urgency: 🔴 red (expires today or tomorrow), 🟡 yellow (within 3 days), 🟢 green (safe).

## Features

### Implemented
- Add a product with a name, expiry date, and optional category
- View all products sorted by urgency
- Color-coded status: red / yellow / green
- Delete a product once it has been used
- Summary counters: urgent / expiring soon / fine

### Not yet implemented
- LLM-powered nanobot to add products via natural language
- Push notifications when items are about to expire
- Recipe suggestions based on expiring products
- Multi-user support (shared fridge)

## Usage

1. Open the app in your browser
2. Enter a product name, select an expiry date, and optionally pick a category
3. Click **+ Add** to save it to your list
4. The list shows all products sorted by expiry date with color-coded status
5. Click **×** on any row to remove a product you have used

## Deployment

### Requirements

- Ubuntu 24.04
- Docker and Docker Compose

Install Docker on a fresh VM:
```bash
apt update && apt install -y docker.io docker-compose-plugin
```

### Step-by-step

**1. Clone the repository:**
```bash
git clone https://github.com/smorodina2128506/se-toolkit-hackathon.git
cd se-toolkit-hackathon
```

**2. Find your VM's IP address:**
```bash
hostname -I
```

**3. Start all services:**
```bash
VM_IP=<your-vm-ip> docker compose up --build -d
```

**4. Open in browser:**
```
http://<your-vm-ip>:3000
```

### Services

| Service  | Port | Description           |
|----------|------|-----------------------|
| frontend | 3000 | React web app         |
| backend  | 8000 | FastAPI REST API      |
| db       | —    | PostgreSQL (internal) |

### Stop the app
```bash
docker compose down
```

### Stop and delete all data
```bash
docker compose down -v
```
