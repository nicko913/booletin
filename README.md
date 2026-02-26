# 📡 Booletin

> **Real-time ephemeral broadcasting for people in the same place.**

[![Live Demo](https://img.shields.io/badge/live-demo-4ADE80?style=flat-square)](https://booletin.onrender.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-4ADE80?style=flat-square)](#license)
[![Built with](https://img.shields.io/badge/built%20with-React%20%2B%20Socket.io-4ADE80?style=flat-square)](#tech-stack)

Booletin lets anyone create a live broadcast channel and share it instantly via QR code. Nearby people scan it and receive your messages in real time — no accounts, no sign-ups, no data stored anywhere.

---

## ✨ What it's for

- 🎤 **Event hosts** broadcasting updates to an audience
- 🏫 **Teachers** pushing notes or links to a classroom
- 🧭 **Tour guides** keeping a group informed
- 🏕️ **Organizers** coordinating people in the same space
- 🚨 **Any situation** where you need to reach a group right now

---

## 🔑 Key Features

- **Instant channels** — create a broadcast in one tap, share via QR code
- **Real-time** — messages appear live on all connected devices
- **Zero accounts** — no sign-up, no login, no passwords
- **No data stored** — messages exist only while the channel is live
- **PWA ready** — installable on iPhone and Android home screens
- **Works on any network** — just needs a shared WiFi or internet connection

---

## 📱 How it works

```
  BROADCASTER                        SUBSCRIBERS
  ┌─────────────┐                   ┌─────────────┐
  │  Create     │                   │  Scan QR    │
  │  Channel    │──── QR Code ────▶ │  Code       │
  │             │                   │             │
  │  Type a     │                   │  Receive    │
  │  message ───│──── Socket.io ──▶ │  messages   │
  │             │      (live)       │  live       │
  └─────────────┘                   └─────────────┘
```

1. Open Booletin and tap **Broadcast**
2. A channel is created instantly with a shareable QR code
3. Your audience scans the QR code with their phone camera
4. Type messages — they appear on every screen in real time
5. End the channel when you're done — everything disappears

---

## 🚀 Try it now

**[booletin.onrender.com](https://booletin.onrender.com)**

> **Note:** Hosted on Render's free tier — first load after inactivity may take ~30 seconds to wake up.

---

## 🛠 Run it locally

**Requirements:** Node.js 18+

```bash
# Clone the repo
git clone https://github.com/nicko913/booletin.git
cd booletin

# Install all dependencies
npm install

# Terminal 1 — start the server
npm run dev:server

# Terminal 2 — start the client
npm run dev:client
```

Open **http://localhost:5173** in your browser.

To test on a phone (same WiFi):
```bash
npm run dev:client -- --host
```
Then use the **Network** URL Vite shows (e.g. `http://192.168.x.x:5173`).

---

## 🏗 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Real-time | Socket.io |
| Backend | Node.js + Express |
| PWA | vite-plugin-pwa |
| QR | qrcode.react + html5-qrcode |
| Hosting | Render |

---

## 📁 Project Structure

```
booletin/
├── client/          # React PWA (Vite)
│   └── src/
│       ├── App.jsx
│       ├── socket.js
│       └── components/
│           ├── BroadcasterView.jsx
│           ├── SubscriberView.jsx
│           ├── SettingsView.jsx
│           ├── QRModal.jsx
│           ├── QRScanner.jsx
│           └── Nav.jsx
└── server/
    └── index.js     # Express + Socket.io
```

---

## ☁️ Deploy your own

Booletin is ready to deploy to [Render](https://render.com) or [Railway](https://railway.app) in minutes.

**Render settings:**
| Field | Value |
|---|---|
| Runtime | Node |
| Build Command | `npm install && npm install --prefix client && npm run build --prefix client` |
| Start Command | `npm start` |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

## ☕ Support

If Booletin is useful to you, a coffee is always appreciated!

**[buymeacoffee.com/nickenbacker12](https://buymeacoffee.com/nickenbacker12)**
