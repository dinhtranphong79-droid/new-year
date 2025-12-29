/* =========================================================
   WEBSOCKET CLIENT – Fireworks 2026
   Kết nối realtime tới backend FastAPI
========================================================= */

class FireworkSocket {
  constructor(url) {
    this.url = url;
    this.socket = null;
    this.connected = false;

    // callback do fireworks.js đăng ký
    this.onFireworkEvent = null;
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.connected = true;
      console.log("🔗 WebSocket connected");
    };

    this.socket.onclose = () => {
      this.connected = false;
      console.warn("❌ WebSocket disconnected – retrying...");
      setTimeout(() => this.connect(), 3000);
    };

    this.socket.onerror = (err) => {
      console.error("⚠️ WebSocket error", err);
      this.socket.close();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (e) {
        console.warn("Invalid WS message", event.data);
      }
    };
  }

  handleMessage(data) {
    /*
      Format chuẩn:
      {
        type: "firework",
        x: 0.5,        // normalized 0–1
        y: 0.6,
        color: "#ffcc00",
        pattern: "circle"
      }
    */
    if (data.type === "firework" && this.onFireworkEvent) {
      this.onFireworkEvent(data);
    }
  }

  sendFirework(x, y, color, pattern) {
    if (!this.connected) return;

    const payload = {
      type: "firework",
      x,
      y,
      color,
      pattern,
      timestamp: Date.now()
    };

    this.socket.send(JSON.stringify(payload));
  }
}

/* =========================
   INIT SOCKET
========================= */
(function initWebSocket() {
  // ⚠️ đổi URL khi deploy
  const WS_URL = "ws://localhost:8000/ws/fireworks";

  const socket = new FireworkSocket(WS_URL);
  socket.connect();

  // expose global để fireworks.js dùng
  window.fireworkSocket = socket;
})();
