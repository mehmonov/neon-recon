// One-off: strip the baked background from AI sprites via edge flood-fill that matches
// each image's own border colour (handles checkerboards & solid fills), then downscale to
// web sizes. Always reads from _originals/ (pristine) so it can be re-run safely.
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const DIR = path.join(__dirname, '..', 'public', 'assets');
const BACKUP = path.join(DIR, '_originals');
fs.mkdirSync(BACKUP, { recursive: true });

const JOBS = [
  { f: 'player.png', w: 256, strip: true },
  { f: 'enemy.png', w: 256, strip: true },
  { f: 'enemy_heavy.png', w: 256, strip: true },
  { f: 'bullet_player.png', w: 128, strip: true },
  { f: 'bullet_enemy.png', w: 128, strip: true },
  { f: 'muzzle.png', w: 256, strip: true },
  { f: 'pickup_health.png', w: 256, strip: true },
  { f: 'pickup_ammo.png', w: 256, strip: true },
  { f: 'joystick_base.png', w: 256, strip: true },
  { f: 'joystick_knob.png', w: 256, strip: true },
  { f: 'logo.png', w: 1024, strip: true },
  { f: 'wall.png', w: 128, strip: false },
  { f: 'floor.png', w: 128, strip: false },
  { f: 'menu_bg.png', w: 1100, strip: false },
];

const TOL = 62;

function sampleRefs(d, w, h) {
  const pts = [
    [1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2],
    [w >> 1, 1], [w >> 1, h - 2], [1, h >> 1], [w - 2, h >> 1],
  ];
  const refs = [];
  for (const [x, y] of pts) {
    const i = (y * w + x) * 4;
    if (d[i + 3] >= 8) refs.push([d[i], d[i + 1], d[i + 2]]);
  }
  return refs;
}

function nearRef(d, i, refs) {
  if (d[i + 3] < 8) return true;
  const r = d[i], g = d[i + 1], b = d[i + 2];
  for (const [rr, rg, rb] of refs) {
    const dr = r - rr, dg = g - rg, db = b - rb;
    if (dr * dr + dg * dg + db * db <= TOL * TOL) return true;
  }
  return false;
}

function stripBg(png) {
  const { width: w, height: h, data: d } = png;
  const refs = sampleRefs(d, w, h);
  if (refs.length === 0) return 0;
  const visited = new Uint8Array(w * h);
  const stack = [];
  const seed = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    if (!nearRef(d, p * 4, refs)) return;
    visited[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }
  let cleared = 0;
  while (stack.length) {
    const p = stack.pop();
    d[p * 4 + 3] = 0;
    cleared++;
    const x = p % w, y = (p / w) | 0;
    seed(x - 1, y); seed(x + 1, y); seed(x, y - 1); seed(x, y + 1);
  }
  return cleared;
}

function downscale(src, tw, th) {
  const { width: sw, height: sh, data: sd } = src;
  const out = new PNG({ width: tw, height: th });
  const od = out.data;
  for (let oy = 0; oy < th; oy++) {
    for (let ox = 0; ox < tw; ox++) {
      const x0 = Math.floor((ox * sw) / tw), x1 = Math.max(x0 + 1, Math.floor(((ox + 1) * sw) / tw));
      const y0 = Math.floor((oy * sh) / th), y1 = Math.max(y0 + 1, Math.floor(((oy + 1) * sh) / th));
      let ra = 0, ga = 0, ba = 0, aa = 0, n = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const i = (y * sw + x) * 4;
          const a = sd[i + 3] / 255;
          ra += sd[i] * a; ga += sd[i + 1] * a; ba += sd[i + 2] * a; aa += a; n++;
        }
      }
      const oi = (oy * tw + ox) * 4;
      od[oi] = aa > 0 ? Math.round(ra / aa) : 0;
      od[oi + 1] = aa > 0 ? Math.round(ga / aa) : 0;
      od[oi + 2] = aa > 0 ? Math.round(ba / aa) : 0;
      od[oi + 3] = Math.round((aa / n) * 255);
    }
  }
  return out;
}

for (const job of JOBS) {
  const live = path.join(DIR, job.f);
  const orig = path.join(BACKUP, job.f);
  if (!fs.existsSync(orig)) {
    if (fs.existsSync(live)) fs.copyFileSync(live, orig);
    else { console.log(`skip (missing): ${job.f}`); continue; }
  }
  const png = PNG.sync.read(fs.readFileSync(orig));
  const cleared = job.strip ? stripBg(png) : 0;
  const th = Math.round((job.w * png.height) / png.width);
  const out = downscale(png, job.w, th);
  fs.writeFileSync(live, PNG.sync.write(out));
  const pct = ((cleared / (png.width * png.height)) * 100).toFixed(0);
  console.log(`${job.f}: ${png.width}x${png.height} -> ${job.w}x${th}${job.strip ? `  (bg ${pct}%)` : ''}`);
}
console.log('done');
