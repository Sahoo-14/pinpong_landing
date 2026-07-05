  // 3D Perspective Ping Pong — Auto-Play Simulation
  (function() {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    let W, H;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = r.width; H = r.height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Table perspective corners
    const tbl = () => ({
      nl: [W * 0.08, H * 0.94], nr: [W * 0.92, H * 0.94],
      fl: [W * 0.3, H * 0.3],   fr: [W * 0.7, H * 0.3]
    });

    // Table-space to screen-space (tx: 0-1 left-right, tz: 0=near 1=far)
    const ts = (tx, tz) => {
      const t = tbl();
      const y = t.nl[1] + (t.fl[1] - t.nl[1]) * tz;
      const lx = t.nl[0] + (t.fl[0] - t.nl[0]) * tz;
      const rx = t.nr[0] + (t.fr[0] - t.nr[0]) * tz;
      return { x: lx + (rx - lx) * tx, y, s: 1 - tz * 0.5 };
    };

    const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    let pScore = 3, oScore = 2, pX = 0.5, oX = 0.5;
    let ball = { tx: 0.5, tz: 0.15, h: 0, fx: 0.5, fz: 0.15, ex: 0.5, ez: 0.85, t: 0, spd: 0.013, toOpp: true };
    let trail = []; // sparkle trail particles

    const newShot = () => {
      ball.t = 0;
      ball.fx = ball.tx; ball.fz = ball.tz;
      ball.ex = 0.2 + Math.random() * 0.6;
      ball.ez = ball.toOpp ? 0.82 + Math.random() * 0.08 : 0.08 + Math.random() * 0.07;
      ball.spd = 0.012 + Math.random() * 0.006;
    };
    newShot();

    const update = () => {
      ball.t += ball.spd;
      if (ball.t >= 1) {
        ball.tx = ball.ex; ball.tz = ball.ez;
        ball.toOpp = !ball.toOpp;
        if (Math.random() < 0.18) {
          if (Math.random() < 0.55) pScore++; else oScore++;
          if (pScore >= 11 || oScore >= 11) { pScore = 0; oScore = 0; }
          scoreEl.textContent = pScore + ' — ' + oScore;
        }
        newShot();
      } else {
        const e = ease(ball.t);
        ball.tx = ball.fx + (ball.ex - ball.fx) * e;
        ball.tz = ball.fz + (ball.ez - ball.fz) * e;
        ball.h = Math.sin(ball.t * Math.PI) * 42;
      }
      if (ball.toOpp) {
        pX += (0.5 - pX) * 0.025;
        oX += (ball.ex - oX) * (0.03 + ball.t * 0.06);
      } else {
        oX += (0.5 - oX) * 0.025;
        pX += (ball.ex - pX) * (0.03 + ball.t * 0.06);
      }
      // Store ball position history for comet tail
      if (ball.t > 0.02 && ball.t < 0.98) {
        const bp = ts(ball.tx, ball.tz);
        trail.push({ x: bp.x, y: bp.y - ball.h * bp.s, s: bp.s });
      }
      if (trail.length > 12) trail.shift();
    };

    const drawBg = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#04041a');
      g.addColorStop(0.4, '#080e20');
      g.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    const drawTable = () => {
      const t = tbl();
      // Shadow
      ctx.beginPath();
      ctx.moveTo(t.nl[0] - 4, t.nl[1] + 5);
      ctx.lineTo(t.nr[0] + 4, t.nr[1] + 5);
      ctx.lineTo(t.fr[0] + 3, t.fr[1] + 4);
      ctx.lineTo(t.fl[0] - 3, t.fl[1] + 4);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fill();
      // Surface
      ctx.beginPath();
      ctx.moveTo(t.nl[0], t.nl[1]);
      ctx.lineTo(t.nr[0], t.nr[1]);
      ctx.lineTo(t.fr[0], t.fr[1]);
      ctx.lineTo(t.fl[0], t.fl[1]);
      ctx.closePath();
      const sg = ctx.createLinearGradient(0, t.fl[1], 0, t.nl[1]);
      sg.addColorStop(0, '#0d5c38');
      sg.addColorStop(1, '#094a2c');
      ctx.fillStyle = sg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Center line
      const c0 = ts(0.5, 0), c1 = ts(0.5, 1);
      ctx.beginPath(); ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1; ctx.stroke();
      // Half court line
      const h0 = ts(0, 0.5), h1 = ts(1, 0.5);
      ctx.beginPath(); ctx.moveTo(h0.x, h0.y); ctx.lineTo(h1.x, h1.y);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.stroke();
      // Net
      const nL = ts(-0.02, 0.5), nR = ts(1.02, 0.5), nh = 14;
      ctx.strokeStyle = 'rgba(180,180,180,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(nL.x, nL.y); ctx.lineTo(nL.x, nL.y - nh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(nR.x, nR.y); ctx.lineTo(nR.x, nR.y - nh); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(nL.x, nL.y - nh); ctx.lineTo(nR.x, nR.y - nh);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5; ctx.stroke();
      // Net mesh
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
      for (let i = 0; i < 22; i++) {
        const vx = nL.x + (nR.x - nL.x) * (i / 22);
        ctx.beginPath(); ctx.moveTo(vx, nL.y); ctx.lineTo(vx, nL.y - nh); ctx.stroke();
      }
      for (let j = 1; j <= 3; j++) {
        const hy = nL.y - nh * (j / 4);
        ctx.beginPath(); ctx.moveTo(nL.x, hy); ctx.lineTo(nR.x, hy); ctx.stroke();
      }
    };

    const drawPaddle = (tx, tz, near) => {
      const p = ts(tx, tz);
      const sz = (near ? 26 : 20) * p.s;
      const hW = 5.5 * p.s;
      const hLen = 28 * p.s;
      const connH = 4 * p.s;

      // Handle always below the face (pointing down on screen)
      const hStartY = p.y + sz * 0.7;

      // Handle shadow
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(p.x - hW + 1.5, hStartY + 2, hW * 2, hLen);

      // Handle body
      const hg = ctx.createLinearGradient(p.x - hW, 0, p.x + hW, 0);
      hg.addColorStop(0, '#8a6530'); hg.addColorStop(0.3, '#c49a5c');
      hg.addColorStop(0.5, '#d4a96a'); hg.addColorStop(0.7, '#c49a5c');
      hg.addColorStop(1, '#8a6530');
      ctx.fillStyle = hg;
      ctx.fillRect(p.x - hW, hStartY, hW * 2, hLen);
      ctx.strokeStyle = 'rgba(60,35,10,0.5)'; ctx.lineWidth = 0.8;
      ctx.strokeRect(p.x - hW, hStartY, hW * 2, hLen);

      // Handle end cap
      ctx.fillStyle = '#5a3c18';
      const capH = 3 * p.s;
      ctx.fillRect(p.x - hW - 0.5, hStartY + hLen - capH, hW * 2 + 1, capH);

      // Collar connector (between handle and face)
      ctx.fillStyle = '#6b4c22';
      ctx.fillRect(p.x - hW - 1, hStartY - connH, hW * 2 + 2, connH);
      ctx.strokeStyle = 'rgba(40,25,5,0.4)'; ctx.lineWidth = 0.6;
      ctx.strokeRect(p.x - hW - 1, hStartY - connH, hW * 2 + 2, connH);

      // White rim border
      ctx.beginPath(); ctx.arc(p.x, p.y, sz + 2.5 * p.s, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();

      // Paddle face
      ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
      const pg = ctx.createRadialGradient(p.x - sz * 0.15, p.y - sz * 0.15, sz * 0.1, p.x, p.y, sz);
      pg.addColorStop(0, '#ef3e2e'); pg.addColorStop(0.7, '#d92b1a'); pg.addColorStop(1, '#b51e10');
      ctx.fillStyle = pg; ctx.fill();

      // Highlight sheen
      ctx.beginPath(); ctx.arc(p.x - sz * 0.18, p.y - sz * 0.22, sz * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();
    };

    const drawTrail = () => {
      if (trail.length < 2) return;
      for (let i = 0; i < trail.length; i++) {
        const pt = trail[i];
        const frac = i / trail.length; // 0 = oldest, 1 = newest
        const alpha = frac * 0.5;
        const r = Math.max(1.5, 4 * pt.s * frac);
        // Outer glow
        ctx.beginPath(); ctx.arc(pt.x, pt.y, r + 3 * frac, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,225,77,' + (alpha * 0.2) + ')';
        ctx.fill();
        // Core dot
        ctx.beginPath(); ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,235,120,' + alpha + ')';
        ctx.fill();
      }
      // Connecting line (smooth comet tail)
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.strokeStyle = 'rgba(255,225,77,0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawBall = () => {
      const p = ts(ball.tx, ball.tz);
      const r = Math.max(3.5, 5.5 * p.s);
      // Shadow
      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 2, r * 1.2, r * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,' + Math.max(0.05, 0.3 - ball.h * 0.004) + ')';
      ctx.fill();
      // Ball glow
      ctx.beginPath(); ctx.arc(p.x, p.y - ball.h * p.s, r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,225,77,0.06)'; ctx.fill();
      // Ball
      const by = p.y - ball.h * p.s;
      ctx.beginPath(); ctx.arc(p.x, by, r, 0, Math.PI * 2);
      const bg = ctx.createRadialGradient(p.x - r * 0.3, by - r * 0.3, 0, p.x, by, r);
      bg.addColorStop(0, '#fffbe6'); bg.addColorStop(0.4, '#FFE14D'); bg.addColorStop(1, '#d4ab20');
      ctx.fillStyle = bg; ctx.fill();
      // Ball highlight
      ctx.beginPath(); ctx.arc(p.x - r * 0.25, by - r * 0.25, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
    };

    const draw = () => {
      drawBg();
      drawTable();
      // Depth sort: far objects first (painter's algorithm)
      const objs = [
        { z: 0.87, fn: () => drawPaddle(oX, 0.87, false) },
        { z: ball.tz, fn: () => { drawTrail(); drawBall(); } },
        { z: 0.1, fn: () => drawPaddle(pX, 0.1, true) }
      ];
      objs.sort((a, b) => b.z - a.z);
      objs.forEach(o => o.fn());
    };

    (function loop() { update(); draw(); requestAnimationFrame(loop); })();
  })();
