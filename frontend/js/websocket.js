/* =========================================================
   WEBSOCKET CLIENT – Fireworks 2026
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
    /* =========================
       ⏱ COUNTDOWN (UTC+11)
    ========================= */
    if (data.type === "countdown") {
      const remaining = data.remaining;

      // cập nhật đồng hồ
      if (typeof window.updateCountdown === "function") {
        window.updateCountdown(remaining);
      }

      // 🔥 TĂNG CƯỜNG ĐỘ PHÁO HOA THEO THỜI GIAN
      if (typeof window.updateFireworkIntensity === "function") {
        window.updateFireworkIntensity(remaining);
      }

      return;
    }

    /* =========================
       🎆 FIREWORK EVENT
    ========================= */
    if (data.type === "firework" && this.onFireworkEvent) {
      this.onFireworkEvent(data);
    }
  }

  sendFirework(x, y, color, pattern) {
    if (!this.connected) return;

    this.socket.send(
      JSON.stringify({
        type: "firework",
        x,
        y,
        color,
        pattern,
        timestamp: Date.now()
      })
    );
  }
}

/* =========================
   INIT SOCKET
========================= */
(function initWebSocket() {
  const WS_URL = "ws://localhost:8000/ws/fireworks";
  const socket = new FireworkSocket(WS_URL);
  socket.connect();

  window.fireworkSocket = socket;
})();
