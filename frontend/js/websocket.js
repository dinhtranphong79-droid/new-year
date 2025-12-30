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
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        console.warn("⚠️ Invalid WS message", event.data);
        return;
      }

      this.handleMessage(data);
    };
  }

  handleMessage(data) {
    /* =========================
       ⏱ COUNTDOWN (SERVER AUTHORITATIVE)
    ========================= */
    if (data.type === "countdown" && typeof data.remaining === "number") {
      const remaining = data.remaining;

      // UI countdown
      if (typeof window.updateCountdown === "function") {
        window.updateCountdown(remaining);
      }

      // intensity + giao thừa logic
      if (typeof window.updateFireworkIntensity === "function") {
        window.updateFireworkIntensity(remaining);
      }

      return;
    }

    /* =========================
       🎆 FIREWORK EVENT (SYNC)
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
   INIT SOCKET (GLOBAL)
========================= */
(function initWebSocket() {
  const WS_URL =
    location.protocol === "https:"
      ? "wss://" + location.host + "/ws"
      : "ws://" + location.host + "/ws";

  const socket = new FireworkSocket(WS_URL);
  socket.connect();

  // expose global
  window.fireworkSocket = socket;
})();
