/*
  The night sea behind the hero: stars, swell rolling in from the horizon,
  the moon's glitter path, and a tide washing up the sand.
  Plain 2D canvas, no libraries.
*/
(function () {
  "use strict";

  var canvas = document.getElementById("sea");
  var hero = document.querySelector(".hero");
  var seaEl = document.querySelector(".hero-sea");
  var moonEl = document.querySelector(".moon-disc");
  if (!canvas || !canvas.getContext || !hero || !seaEl || !moonEl) return;

  var ctx = canvas.getContext("2d");

  // People who ask their system for less motion get a slower, flatter sea.
  var calm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var PACE = calm ? 0.5 : 1;

  var ROWS = 46;          // lines of swell between horizon and shore
  var SWELL = 0.012;      // share of the horizon-to-shore trip a row covers per second
  var TIDE = 11;          // seconds for one wash up the sand and back
  var RISE = 0.36;        // share of that spent running up
  var FAR = 0.2;          // how narrow the swell is drawn at the horizon
  var NEAR = 2.3;         // and how wide at the shore

  var W = 0, H = 0, horizon = 0, shore = 0, reach = 0, moonX = 0;
  var stars = [], rows = [], grains = [];

  function seeded(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function smooth(x) {
    x = x < 0 ? 0 : x > 1 ? 1 : x;
    return x * x * (3 - 2 * x);
  }

  function layout() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth;
    H = hero.clientHeight;
    if (!W || !H) return;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    horizon = seaEl.offsetTop;
    var depth = H - horizon;
    shore = horizon + depth * 0.6;
    reach = depth * 0.15;

    var m = moonEl.getBoundingClientRect();
    var h = hero.getBoundingClientRect();
    moonX = m.left - h.left + m.width / 2;

    build();
    draw(lastTime);
  }

  function build() {
    var rand = seeded(11);
    var i, j;

    stars = [];
    var starCount = Math.round((W * horizon) / 8200);
    for (i = 0; i < starCount; i++) {
      stars.push({
        x: rand() * W,
        y: Math.pow(rand(), 1.3) * (horizon - 16),
        r: 0.35 + rand() * rand() * 1.1,
        a: 0.18 + rand() * 0.6,
        p: rand() * 6.283,
        twinkle: rand() < 0.35
      });
    }

    // Each row is a set of short crests. They are laid out once and then
    // spread apart around the moon's column as the row travels to the shore.
    var perRow = Math.max(30, Math.min(120, Math.round(W / 19)));
    var left = moonX / W / FAR;
    var right = (W - moonX) / W / FAR;
    rows = [];
    for (i = 0; i < ROWS; i++) {
      var row = { t: i / ROWS, phase: rand() * 6.283, crests: [], glints: [] };
      for (j = 0; j < perRow; j++) {
        row.crests.push({
          u: -left + ((j + rand()) / perRow) * (left + right),
          len: 0.45 + rand() * 1.15,
          a: 0.35 + rand() * 0.65,
          p: rand() * 6.283
        });
      }
      for (j = 0; j < 5; j++) {
        row.glints.push({
          o: (rand() + rand() + rand() - 1.5) / 1.5,
          len: 0.5 + rand(),
          p: rand() * 6.283,
          speed: 0.9 + rand() * 1.6
        });
      }
      rows.push(row);
    }

    grains = [];
    var grainCount = Math.round((W * (H - shore)) / 210);
    for (i = 0; i < grainCount; i++) {
      grains.push({ x: rand() * W, y: rand(), a: 0.25 + rand() * 0.75 });
    }
  }

  function draw(ms) {
    if (!W || !H) return;
    var T = (ms / 1000 + 4) * PACE;
    var depth = shore - horizon;
    var i, j, x, y;

    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = "round";

    // ── Sky: haze over the horizon, a wash of moonlight, stars ──
    var haze = ctx.createLinearGradient(0, horizon - 170, 0, horizon);
    haze.addColorStop(0, "rgba(70,130,185,0)");
    haze.addColorStop(1, "rgba(70,130,185,0.14)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, horizon - 170, W, 170);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, horizon);
    ctx.clip();
    ctx.translate(moonX, horizon);
    ctx.scale(1, 0.3);
    var wash = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.45);
    wash.addColorStop(0, "rgba(175,222,255,0.24)");
    wash.addColorStop(1, "rgba(175,222,255,0)");
    ctx.fillStyle = wash;
    ctx.beginPath();
    ctx.arc(0, 0, W * 0.45, 0, 6.2832);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#cfe8ff";
    for (i = 0; i < stars.length; i++) {
      var s = stars[i];
      ctx.globalAlpha = s.a * (s.twinkle ? 0.55 + 0.45 * Math.sin(T * 0.9 + s.p) : 1);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // ── Where the water ends on the sand right now ──
    var p = (T % TIDE) / TIDE;
    var run = p < RISE ? 1 - Math.pow(1 - p / RISE, 3) : 1 - smooth((p - RISE) / (1 - RISE));
    var wet = p < RISE ? 0.25 : 1 - 0.75 * ((p - RISE) / (1 - RISE));

    function edge(px, amount) {
      return shore + amount * reach * (0.72 + 0.28 * Math.sin(px * 0.0042 + 1.3)) +
        5 * Math.sin(px * 0.011 + T * 0.22) + 2.5 * Math.sin(px * 0.027 - T * 0.37);
    }
    function traceEdge(amount, lift, backwards) {
      var step = 8, n = Math.ceil(W / step) + 1, k;
      for (k = 0; k <= n; k++) {
        var px = (backwards ? n - k : k) * step;
        ctx.lineTo(px, edge(px, amount) - lift);
      }
    }

    // ── Water ──
    var body = ctx.createLinearGradient(0, horizon, 0, shore + reach);
    body.addColorStop(0, "rgba(30,84,128,0.34)");
    body.addColorStop(0.5, "rgba(18,52,84,0.2)");
    body.addColorStop(1, "rgba(14,40,66,0.14)");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(W, horizon);
    traceEdge(run, 0, true);
    ctx.closePath();
    ctx.fill();

    // ── Sand: dry, then the darker band the last wave left wet ──
    var sand = ctx.createLinearGradient(0, shore, 0, H);
    sand.addColorStop(0, "rgba(156,186,210,0.2)");
    sand.addColorStop(0.55, "rgba(156,186,210,0.09)");
    sand.addColorStop(1, "rgba(156,186,210,0)");
    ctx.fillStyle = sand;
    ctx.beginPath();
    ctx.moveTo(0, edge(0, run));
    traceEdge(run, 0, false);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, edge(0, run));
    traceEdge(run, 0, false);
    traceEdge(1, 0, true);
    ctx.closePath();
    ctx.fillStyle = "rgba(2,7,12," + (0.62 * wet).toFixed(3) + ")";
    ctx.fill();
    ctx.clip();
    // moonlight on the wet sand
    ctx.translate(moonX, edge(moonX, run));
    ctx.scale(1, 0.55);
    var sheen = ctx.createRadialGradient(0, 0, 0, 0, 0, 150);
    sheen.addColorStop(0, "rgba(200,235,255," + (0.3 * wet).toFixed(3) + ")");
    sheen.addColorStop(1, "rgba(200,235,255,0)");
    ctx.fillStyle = sheen;
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, 6.2832);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#b9d6ee";
    for (i = 0; i < grains.length; i++) {
      var g = grains[i];
      y = shore + g.y * (H - shore);
      if (y < edge(g.x, run) + 3) continue;
      ctx.globalAlpha = 0.6 * g.a * (1 - g.y);
      ctx.fillRect(g.x, y, 1, 1);
    }
    ctx.globalAlpha = 1;

    // ── Swell: rows of crests moving from the horizon to the shore ──
    for (i = 0; i < rows.length; i++) {
      var row = rows[i];
      var t = (row.t + T * SWELL) % 1;
      var fade = smooth(t / 0.05) * (1 - smooth((t - 0.88) / 0.12));
      if (fade <= 0) continue;

      var rowY = horizon + 1.5 + depth * Math.pow(t, 1.75);
      var spread = FAR + (NEAR - FAR) * t * t;
      var unit = 5 + 105 * Math.pow(t, 1.6);
      var bob = (0.3 + 2.4 * t) * (calm ? 0.6 : 1);
      var sway = (1 + 11 * t) * (calm ? 0.6 : 1);
      var cone = 8 + (30 + W * 0.045) * t;
      ctx.lineWidth = 1 + 0.5 * t;

      for (j = 0; j < row.crests.length; j++) {
        var c = row.crests[j];
        var len = c.len * unit;
        x = moonX + c.u * W * spread + Math.sin(T * 0.35 + c.p) * sway;
        if (x > W || x + len < 0) continue;
        y = rowY + Math.sin(T * 0.9 + row.phase + c.p) * bob;

        var off = (x + len / 2 - moonX) / cone;
        var lit = Math.exp(-off * off);
        ctx.globalAlpha = Math.min(1, ((0.14 + 0.3 * t) * c.a + lit * 0.4) * fade);
        ctx.strokeStyle = lit > 0.3 ? "#dff1ff" : "#8fc6ee";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + len / 2, y - Math.min(3, len * 0.035), x + len, y);
        ctx.stroke();
      }

      // the glitter path under the moon
      ctx.strokeStyle = "#eef8ff";
      ctx.lineWidth = 1 + 0.8 * t;
      for (j = 0; j < row.glints.length; j++) {
        var q = row.glints[j];
        var glen = q.len * (3 + 40 * Math.pow(t, 1.5));
        x = moonX + q.o * cone * 1.15 - glen / 2;
        y = rowY + Math.sin(T * 0.9 + row.phase + q.p) * bob;
        var flick = 0.5 + 0.5 * Math.sin(T * q.speed + q.p);
        ctx.globalAlpha = fade * (0.2 + 0.8 * flick) * (0.5 + 0.5 * (1 - Math.abs(q.o)));
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + glen, y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // ── Foam along the water's edge, and two fainter lines behind it ──
    ctx.strokeStyle = "#e8f5ff";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.moveTo(0, edge(0, run));
    traceEdge(run, 0, false);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.setLineDash([22, 9, 5, 14]);
    ctx.lineDashOffset = -T * 5;
    ctx.globalAlpha = 0.34;
    ctx.beginPath();
    ctx.moveTo(0, edge(0, run) - 7);
    traceEdge(run, 6 + 3 * run, false);
    ctx.stroke();
    ctx.setLineDash([9, 17, 3, 21]);
    ctx.lineDashOffset = T * 4;
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(0, edge(0, run) - 15);
    traceEdge(run, 14 + 6 * run, false);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // ── Run only while the hero is on screen, at about 30 frames a second ──
  var lastTime = 0, lastPaint = 0, onScreen = true, running = false;

  function frame(ms) {
    if (!onScreen) { running = false; return; }
    if (ms - lastPaint >= 32) {
      lastPaint = ms;
      lastTime = ms;
      draw(ms);
    }
    window.requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    running = true;
    window.requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      if (onScreen) start();
    }).observe(hero);
  }
  if ("ResizeObserver" in window) {
    new ResizeObserver(layout).observe(hero);
  } else {
    window.addEventListener("resize", layout);
  }

  canvas.drawAt = draw; // lets you scrub the scene from the console: sea.drawAt(5000)
  layout();
  start();
})();
