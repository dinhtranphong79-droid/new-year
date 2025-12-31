/* =========================================================
   FIREWORKS ENGINE – Fireworks 2026
   Author: Fireworks 2026 Project
========================================================= */
let fireworkIntensity = 0.2;   // mật độ bắn
let hasCelebrated = false;    // chặn bắn lại khi reload
let afterParty = false; // 🎉 chế độ ăn mừng sau giao thừa

const GRAVITY = 0.06;
const FRICTION = 0.99;
const PARTICLE_LIFETIME = 120;

/* =========================
   UTILITIES
========================= */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

function degToRad(deg) {
  return deg * Math.PI / 180;
}
function randomBrightColor() {
  const colors = ["#ff0044", "#ffcc00", "#00ffcc", "#66ccff", "#ffffff"];
  return colors[Math.floor(Math.random() * colors.length)];
}

/* =========================
   PARTICLE
========================= */
class Particle {
  constructor(x, y, vx, vy, color, size = 2) {
    this.reset(x, y, vx, vy, color, size);
  }

  reset(x, y, vx, vy, color, size) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.alpha = 1;
    this.life = PARTICLE_LIFETIME;
    this.size = size;
  }

  update() {
    this.vx *= FRICTION;
    this.vy *= FRICTION;
    this.vy += GRAVITY;

    this.x += this.vx;
    this.y += this.vy;

    this.life--;
    this.alpha = this.life / PARTICLE_LIFETIME;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  get alive() {
    return this.life > 0;
  }
}

/* =========================
   FIREWORK
========================= */
class Firework {
  constructor(x, y, pattern, color) {
    this.particles = [];
    this.exploded = false;
    this.x = x;
    this.y = y;
    this.pattern = pattern;
    this.color = color;
    this.create();
  }

  create() {
    switch (this.pattern) {
      case "spiral":
        this.createSpiral();
        break;
      case "heart":
        this.createHeart();
        break;
      case "text2026":
        this.createText2026();
        break;
      default:
        this.createCircle();
    }
  }

  createCircle() {
    const count = 120;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const speed = random(2.5, 4.5);
      this.particles.push(
        new Particle(
          this.x,
          this.y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          this.color
        )
      );
    }
  }

  createSpiral() {
    const count = 140;
    for (let i = 0; i < count; i++) {
      const angle = i * 0.25;
      const speed = i * 0.04;
      this.particles.push(
        new Particle(
          this.x,
          this.y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          this.color,
          1.8
        )
      );
    }
  }

  createHeart() {
    const count = 160;
    for (let i = 0; i < count; i++) {
      const t = Math.PI * 2 * (i / count);
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y =
        -(13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t));
      this.particles.push(
        new Particle(
          this.x,
          this.y,
          x * 0.18,
          y * 0.18,
          this.color,
          2
        )
      );
    }
  }

  createText2026() {
    const points = [
      // crude point map of "2026"
      [-40, 0], [-20, 20], [0, 0], [-20, -20], // 2
      [20, 20], [20, -20],                    // 0
      [40, 20], [30, 0], [40, -20],            // 2
      [60, 20], [70, 0], [60, -20], [80, -20]  // 6
    ];

    points.forEach(p => {
      this.particles.push(
        new Particle(
          this.x,
          this.y,
          p[0] * 0.05,
          p[1] * 0.05,
          this.color,
          2.5
        )
      );
    });
  }

  update(ctx) {
    this.particles.forEach(p => {
      p.update();
      p.draw(ctx);
    });

    this.particles = this.particles.filter(p => p.alive);
  }

  get alive() {
    return this.particles.length > 0;
  }
}

/* =========================
   FIREWORK MANAGER
========================= */
class FireworkManager {
  constructor(ctx) {
    this.ctx = ctx;
    this.fireworks = [];
  }

  launch(x, y, pattern, color) {
    this.fireworks.push(new Firework(x, y, pattern, color));
  }

  update() {
    this.fireworks.forEach(fw => fw.update(this.ctx));
    this.fireworks = this.fireworks.filter(fw => fw.alive);
  }
}

/* =========================
   BOOTSTRAP
========================= */
 const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");
const manager = new FireworkManager(ctx);
const patternSelect = document.getElementById("patternSelect");
const colorPicker = document.getElementById("colorPicker");
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

(function () {
  function animate() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // auto fire
   let autoRate = fireworkIntensity * 0.02;

if (afterParty) {
  autoRate = 0.06; // 🎉 after-party bắn đều
}

if (Math.random() < autoRate) {
  manager.launch(
    Math.random() * canvas.width,
    Math.random() * canvas.height * 0.5,
    patternSelect.value,
    randomBrightColor()
  );
}

     

    manager.update();
    requestAnimationFrame(animate);
  }

  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    manager.launch(
      e.clientX - rect.left,
      e.clientY - rect.top,
      patternSelect.value,
      colorPicker.value
    );
  });

  animate();
})();

/* =========================
   NEW YEAR SPECIAL EFFECT
========================= */



function launchNewYearBurst() {
  const bursts = 25;

  for (let i = 0; i < bursts; i++) {
    setTimeout(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.6;

      manager.launch(
        x,
        y,
        ["circle", "spiral", "heart", "text2026"][Math.floor(Math.random() * 4)],
        randomBrightColor()
      );
    }, i * 120);
  }
}

function playFireworkSound() {
  const sound = document.getElementById("fireworkSound");
  if (!sound) return;

  sound.currentTime = 0;
  sound.volume = 0.7;
  sound.play().catch(() => {});
}

/* =========================
   NEW YEAR – COUNTDOWN CONTROL
========================= */

window.updateFireworkIntensity = function (remaining) {

  // 🔁 Nếu MỞ TRANG SAU GIAO THỪA
  if (remaining <= 0 && hasCelebrated) {
    afterParty = true;
    fireworkIntensity = 0.5;
    return;
  }

  // ⏱ ĐANG ĐẾM NGƯỢC
  if (remaining > 60) {
    fireworkIntensity = 0.2;
  } else if (remaining > 30) {
    fireworkIntensity = 0.4;
  } else if (remaining > 10) {
    fireworkIntensity = 0.7;
  } else if (remaining > 0) {
    fireworkIntensity = 1.0;
  }

  // 🎆 GIAO THỪA – CHỈ 1 LẦN DUY NHẤT
  if (remaining <= 0 && !hasCelebrated) {
    hasCelebrated = true;
    afterParty = true;

    console.log("🎆 HAPPY NEW YEAR 2026!");
    playFireworkSound();
    launchNewYearBurst();
  }
};

