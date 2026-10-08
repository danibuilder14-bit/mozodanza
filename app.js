/* Mozodanza · Víspera de Mamá Pillicha 2026 */
(function () {
  "use strict";

  var CANONICAL = "https://mozodanza.vercel.app/";
  var EVENT_START = new Date("2026-10-23T10:00:00-05:00");
  var EVENT_END = new Date("2026-10-24T00:00:00-05:00");
  var INTRO_MS = 12000;

  var PLACES = {
    casa: {
      lat: -9.5231458, lng: -77.5336588,
      addr: "Pasaje Santiago Antúnez de Mayolo, Patay, Independencia – Huaraz. <strong>Al lado del colegio SANE.</strong>"
    },
    sagrario: {
      lat: -9.530606, lng: -77.5281559,
      addr: "Jirón Simón Bolívar, al costado de la Catedral. <strong>Plaza de Armas de Huaraz.</strong>"
    }
  };

  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var video = document.getElementById("dancerVideo");
  var opened = false;
  var introDone = false;
  var timers = [];

  body.classList.add("locked");

  /* ---------- Título en arco: letra por letra (1.5 s → 4 s) ---------- */
  var arcPath = document.getElementById("arcTextPath");
  var title = arcPath.textContent;
  arcPath.textContent = "";
  for (var i = 0; i < title.length; i++) {
    var t = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    t.textContent = title[i];
    t.style.transitionDelay = (1.5 + i * 2.4 / title.length).toFixed(2) + "s";
    arcPath.appendChild(t);
  }

  /* ---------- Arco de rosas alrededor de la Virgen (4.2 s → 6 s) ---------- */
  var roses = document.getElementById("archRoses");
  var spots = [];
  [92, 72, 53].forEach(function (y) { spots.push([-5, y]); });
  [165, 135, 105, 75, 45, 15].forEach(function (deg) {
    var r = deg * Math.PI / 180;
    spots.push([50 + 53 * Math.cos(r), 42 - 45 * Math.sin(r)]);
  });
  [53, 72].forEach(function (y) { spots.push([105, y]); });
  [14, 38, 62, 86].forEach(function (x) { spots.push([x, 101]); });
  spots.forEach(function (p, idx) {
    var img = new Image();
    var big = idx % 3 !== 1;
    img.src = big ? "assets/img/rosa-flor.webp" : "assets/img/rosa-boton.webp";
    img.alt = "";
    img.decoding = "async";
    img.style.setProperty("--x", p[0] + "%");
    img.style.setProperty("--y", p[1] + "%");
    img.style.setProperty("--s", (big ? 18 + (idx * 7) % 4 : 13 + (idx * 5) % 3) + "%");
    img.style.setProperty("--r", ((idx * 47) % 60 - 30) + "deg");
    img.style.setProperty("--rd", (4.2 + idx * 0.09).toFixed(2) + "s");
    roses.appendChild(img);
  });

  /* ---------- Abrir invitación ---------- */
  function playVideo() {
    if (!video || reduceMotion) return;
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* queda la imagen fija */ });
  }
  function openInvitation() {
    if (opened) return;
    opened = true;
    if (reduceMotion) body.classList.add("skip");
    body.classList.add("is-open");
    body.classList.remove("locked");
    playVideo();
    if (!reduceMotion) timers.push(setTimeout(startPetals, 4500));
    timers.push(setTimeout(finishIntro, reduceMotion ? 0 : INTRO_MS));
    window.scrollTo(0, 0);
  }
  function finishIntro() {
    introDone = true;
    petalSpeed = 0.45;
  }
  function skipIntro() {
    if (!opened || introDone) return;
    body.classList.add("skip");
    startPetals();
    timers.forEach(clearTimeout);
    timers = [setTimeout(finishIntro, 2500)];
  }
  document.getElementById("openBtn").addEventListener("click", openInvitation);
  document.getElementById("inicio").addEventListener("click", function (e) {
    if (e.target.closest("a, button")) return;
    skipIntro();
  });
  window.addEventListener("scroll", function () { if (window.scrollY > 120) skipIntro(); }, { passive: true });

  /* ---------- Pétalos ---------- */
  var canvas = document.getElementById("petals");
  var ctx = canvas.getContext("2d");
  var petals = [];
  var petalSpeed = 1;
  var running = false;
  var heroVisible = true;
  var lastT = 0;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var colors = [["#F7C6D0", "#E58CA0"], ["#F4B3C1", "#D96F88"], ["#FBE0E6", "#EFA6B6"]];

  function sizeCanvas() {
    var r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
  }
  function makePetal(top) {
    var w = canvas.width / dpr, h = canvas.height / dpr;
    return {
      x: Math.random() * w,
      y: top ? -20 - Math.random() * 80 : Math.random() * h,
      s: 6 + Math.random() * 6,
      vy: 18 + Math.random() * 20,
      sway: 14 + Math.random() * 20,
      ph: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - .5) * 1.2,
      c: colors[(Math.random() * colors.length) | 0]
    };
  }
  function startPetals() {
    if (running || reduceMotion) return;
    running = true;
    sizeCanvas();
    for (var k = 0; k < 14; k++) petals.push(makePetal(true));
    lastT = performance.now();
    requestAnimationFrame(tick);
  }
  function tick(now) {
    var dt = Math.min((now - lastT) / 1000, .05);
    lastT = now;
    if (heroVisible && !document.hidden) {
      var w = canvas.width / dpr, h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (var k = 0; k < petals.length; k++) {
        var p = petals[k];
        p.ph += dt * 1.4 * petalSpeed;
        p.y += p.vy * dt * petalSpeed;
        p.rot += p.vr * dt * petalSpeed;
        if (p.y > h + 20) { petals[k] = makePetal(true); continue; }
        ctx.save();
        ctx.translate(p.x + Math.sin(p.ph) * p.sway, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, .55 + .45 * Math.abs(Math.cos(p.ph)));
        var g = ctx.createLinearGradient(0, -p.s, 0, p.s);
        g.addColorStop(0, p.c[0]); g.addColorStop(1, p.c[1]);
        ctx.fillStyle = g;
        ctx.globalAlpha = .8;
        ctx.beginPath();
        ctx.moveTo(0, -p.s);
        ctx.bezierCurveTo(p.s * .9, -p.s * .6, p.s * .7, p.s * .7, 0, p.s);
        ctx.bezierCurveTo(-p.s * .7, p.s * .7, -p.s * .9, -p.s * .6, 0, -p.s);
        ctx.fill();
        ctx.restore();
      }
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener("resize", function () { if (running) sizeCanvas(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      heroVisible = es[0].isIntersecting;
      if (video && opened && !reduceMotion) { if (heroVisible) playVideo(); else video.pause(); }
    }).observe(document.getElementById("inicio"));
  }

  /* ---------- Aparición de las caras ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Cuenta regresiva (una línea) ---------- */
  var countEl = document.getElementById("countdown");
  function updateCountdown() {
    var now = new Date();
    if (now >= EVENT_END) { countEl.hidden = true; return; }
    if (now >= EVENT_START) { countEl.innerHTML = "<strong>¡Hoy celebramos!</strong> Los esperamos."; return; }
    var mins = Math.floor((EVENT_START - now) / 60000);
    var d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60);
    countEl.innerHTML = d > 0
      ? "Faltan <strong>" + d + (d === 1 ? " día" : " días") + "</strong>"
      : "Faltan <strong>" + h + (h === 1 ? " hora" : " horas") + "</strong>";
  }
  updateCountdown();
  setInterval(updateCountdown, 60000);

  /* ---------- Lugares: pestañas + mapa ---------- */
  var mapBox = document.getElementById("map");
  var addrEl = document.getElementById("placeAddr");
  var routeBtn = document.getElementById("routeBtn");
  var mapFrame = null;
  var mapReady = false;
  var current = "casa";
  var staticMaps = document.getElementById("main").hasAttribute("data-static-maps");
  function showPlace(key) {
    current = key;
    var p = PLACES[key];
    addrEl.innerHTML = p.addr;
    routeBtn.href = "https://www.google.com/maps/dir/?api=1&destination=" + p.lat + "," + p.lng;
    if (staticMaps) {
      mapBox.innerHTML = '<a href="' + routeBtn.href + '" target="_blank" rel="noopener" aria-label="Abrir en Google Maps">' +
        '<img src="assets/img/mapa-' + key + '.jpg" alt="Mapa con la ubicación" width="1000" height="600"></a>';
    } else if (mapReady) {
      if (!mapFrame) {
        mapFrame = document.createElement("iframe");
        mapFrame.title = "Mapa del lugar";
        mapFrame.referrerPolicy = "no-referrer-when-downgrade";
        mapBox.appendChild(mapFrame);
      }
      mapFrame.src = "https://maps.google.com/maps?q=" + p.lat + "," + p.lng + "&z=17&hl=es&output=embed";
    }
    document.querySelectorAll(".tab").forEach(function (b) {
      var on = b.dataset.place === key;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }
  document.querySelectorAll(".tab").forEach(function (b) {
    b.addEventListener("click", function () { showPlace(b.dataset.place); });
  });
  showPlace("casa");
  function enableMap() { if (mapReady) return; mapReady = true; showPlace(current); }
  if ("IntersectionObserver" in window) {
    var mo = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { enableMap(); mo.disconnect(); }
    }, { rootMargin: "500px 0px" });
    mo.observe(mapBox);
  } else { enableMap(); }

  /* ---------- Compartir ---------- */
  var local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || !/^https?:/.test(location.protocol);
  var shareUrl = local ? CANONICAL : location.origin + location.pathname;
  var shareText = "Invitación a la víspera de la fiesta de Mamá Pillicha · Mozo Danza\n" +
    "Viernes 23 de octubre de 2026 · Huaraz\n" +
    "Capitán Daniel Reeves Córdova y familia\n" + shareUrl;
  document.getElementById("waBtn").href = "https://wa.me/?text=" + encodeURIComponent(shareText);
})();
