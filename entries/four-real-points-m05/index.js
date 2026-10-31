// Four real points x1..x4 on the line give a point of M_{0,5}(ℝ) (the fifth point is ∞).
// Model: p = Σ x_i v_i ∈ ℝ³ with v_i the vertices of a regular tetrahedron, so p·v_l = 4(x_l − mean).
// Up to positive scaling p lives on S², the walls x_i = x_j are the six mirror planes of the tetrahedron,
// and x ↦ −x is p ↦ −p, so the picture is ℝP²: the upper hemisphere, stereographically onto a disk,
// antipodal boundary points glued. The six walls cut it into 12 triangles; blowing up the four triple
// points x_i = x_j = x_k (each becomes the divisor D_{l∞}) turns them into the 12 pentagons of M̄_{0,5}(ℝ).
import { hex, rgba, label, clipBox, fsFor } from '@loci/kit';

const V = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
const SUB = ['₁', '₂', '₃', '₄'];
const R1 = 0.2, RHO = 0.09, DELTA = 0.004;   // blow-up: influence radius, hole radius (disk units), truncation angle
const CYCLE = 60;

const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const lin3 = (a, s, b, u) => [s * a[0] + u * b[0], s * a[1] + u * b[1], s * a[2] + u * b[2]];
const unit = a => { const r = Math.hypot(a[0], a[1], a[2]); return [a[0] / r, a[1] / r, a[2] / r]; };
const neg = a => [-a[0], -a[1], -a[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const along = (a, b, s) => unit(lin3(a, 1 - s, b, s));
const clamp1 = c => Math.max(-1, Math.min(1, c));
const stereo = p => [p[0] / (1 + p[2]), p[1] / (1 + p[2])];

// The triple point where all but x_l agree is ±v_l; keep the representative in the upper hemisphere.
const TRIPLE = V.map((v, l) => { const u = unit(v[2] > 0 ? v : neg(v)); return { l, q: stereo(u) }; });

// Push a disk neighbourhood of each triple point out to an annulus: the point becomes a circle, which
// with antipodal points glued is the exceptional line (a crosscap). rho = 0 is the identity.
function blow(q, rho) {
  for (const T of TRIPLE) {
    const dx = q[0] - T.q[0], dy = q[1] - T.q[1], d = Math.hypot(dx, dy);
    if (d < R1) {
      if (d < 1e-12) return [T.q[0] + rho, T.q[1]];
      const e = rho + d * (R1 - rho) / R1;
      return [T.q[0] + dx / d * e, T.q[1] + dy / d * e];
    }
  }
  return q;
}
const toDisk = (p, rho) => blow(stereo(p[2] < 0 ? neg(p) : p), rho);

// Points at angle DELTA around vertex T, turning from the direction of A to the direction of B.
function arcAt(T, A, B, n) {
  const tA = unit(lin3(A, 1, T, -dot3(A, T))), tB = unit(lin3(B, 1, T, -dot3(B, T)));
  const c = clamp1(dot3(tA, tB)), e2 = unit(lin3(tB, 1, tA, -c)), ang = Math.acos(c), out = [];
  for (let i = 0; i <= n; i++) {
    const f = ang * i / n;
    out.push(lin3(T, Math.cos(DELTA), lin3(tA, Math.cos(f), e2, Math.sin(f)), Math.sin(DELTA)));
  }
  return out;
}
function edge(A, B, n) { const out = []; for (let i = 1; i < n; i++) out.push(along(A, B, i / n)); return out; }

// Clip a spherical polygon to the upper hemisphere and resample so new equator edges follow the equator.
function clipUp(poly) {
  const cut = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    if (a[2] >= 0) cut.push(a);
    if ((a[2] >= 0) !== (b[2] >= 0)) {
      const s = a[2] / (a[2] - b[2]), m = lin3(a, 1 - s, b, s);
      m[2] = 0; cut.push(unit(m));
    }
  }
  const out = [];
  for (let i = 0; i < cut.length; i++) {
    const a = cut[i], b = cut[(i + 1) % cut.length], k = Math.ceil(Math.acos(clamp1(dot3(a, b))) / 0.02);
    out.push(a);
    for (let j = 1; j < k; j++) out.push(along(a, b, j / k));
  }
  return out;
}

function areaCentroid(q) {
  let A = 0, cx = 0, cy = 0;
  for (let i = 0; i < q.length; i++) {
    const [x0, y0] = q[i], [x1, y1] = q[(i + 1) % q.length], c = x0 * y1 - x1 * y0;
    A += c; cx += (x0 + x1) * c; cy += (y0 + y1) * c;
  }
  return { A: Math.abs(A / 2), c: [cx / (3 * A), cy / (3 * A)] };
}

function perms(a) {
  if (a.length < 2) return [a];
  return a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map(r => [x, ...r]));
}

function build(rho) {
  // Chamber x_a < x_b < x_c < x_d: vertices −v_a (x_a alone below), v_d (x_d alone above), and the double
  // point −v_a − v_b + v_c + v_d. Its reversal is the antipodal chamber, the same cell of ℝP².
  const cells = perms([0, 1, 2, 3]).filter(p => p[0] < p[3]).map(p => {
    const [a, b, c, d] = p;
    const V1 = unit(neg(V[a])), V2 = unit(V[d]);
    const V3 = unit([0, 1, 2].map(k => -V[a][k] - V[b][k] + V[c][k] + V[d][k]));
    const a1 = arcAt(V1, V2, V3, 12), a2 = arcAt(V2, V3, V1, 12);
    const poly = [...a1, ...edge(a1[a1.length - 1], V3, 40), V3, ...edge(V3, a2[0], 40), ...a2,
                  ...edge(a2[a2.length - 1], a1[0], 40)];
    const pieces = [];
    for (const half of [poly, poly.map(neg)]) {
      const up = clipUp(half);
      if (up.length < 3) continue;
      const q = up.map(x => blow(stereo(x), rho)), { A, c } = areaCentroid(q);
      if (A > 1e-4) pieces.push({ q, c, A });
    }
    let inv = 0;
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (p[i] > p[j]) inv++;
    return { key: p.join(''), name: p.map(i => i + 1).join(''), odd: inv % 2, pieces };
  });
  // Wall x_i = x_j: the great circle normal to v_i − v_j, its upper half from equator to equator.
  const walls = [];
  for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
    const n = unit(lin3(V[i], 1, V[j], -1)), e1 = unit(cross(n, [0, 0, 1]));
    let e2 = cross(n, e1);
    if (e2[2] < 0) e2 = neg(e2);
    const runs = [];
    let run = [], last = null;
    for (let k = 0; k <= 720; k++) {
      const f = Math.PI * k / 720, q = blow(stereo(lin3(e1, Math.cos(f), e2, Math.sin(f))), rho);
      if (last && Math.hypot(q[0] - last[0], q[1] - last[1]) > 0.05) { runs.push(run); run = []; }
      run.push(q); last = q;
    }
    runs.push(run);
    walls.push({ i, j, runs });
  }
  return { cells, walls };
}

// A slow wander over the sphere with period CYCLE: it visits all 12 cells, passes near triple points
// (t ≈ 26.7 s), and dips below the equator (t ≈ 0.55 s), where the dot reappears at the opposite edge.
function pathAt(t) {
  const w = 2 * Math.PI / CYCLE;
  const th = 1.15 + 0.85 * Math.sin(2 * w * t + 0.4), ph = 3 * w * t + 0.3;
  return [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
}

// Theme colors blended in RGB, as a CSS color with alpha.
function blend(a, b, s, alpha = 1) {
  const A = hex(a), C = hex(b), c = A.map((v, i) => Math.round(v + (C[i] - v) * s));
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
}

// label() centred on (x, y): measure with the theme's font, then hand the text to label().
function labelC(ctx, theme, s, x, y, o) {
  const f = String(theme.font || 'sans-serif'), fam = /\dpx/.test(f) ? f.replace(/^.*?\d+(\.\d+)?px\s*/, '') : f;
  ctx.save();
  ctx.font = `${o.weight || 400} ${o.size}px ${fam}`;
  const w = ctx.measureText(s).width;
  ctx.restore();
  label(ctx, theme, s, x - w / 2, y + o.size * 0.35, o);
}

export default {
  draw({ ctx, t, box, theme, params, state }) {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const fs = fsFor(box), small = Math.max(12, fs * 0.9), rho = params.blowup ? RHO : 0;
    if (state.rho !== rho) { state.geo = build(rho); state.rho = rho; }
    const { cells, walls } = state.geo;

    // Layout: the line beside the disk when wide, above it when tall.
    const top = box.y + (theme.labels ? fs * 3.2 : 0), H = box.y + box.h - top;
    let Rd, dcx, dcy, L;
    if (box.w > H * 1.35) {
      Rd = Math.min(H, box.w * 0.58) / 2 * 0.95;
      dcx = box.x + box.w - Rd / 0.95; dcy = top + H / 2;
      L = { x: box.x, w: box.w - 2 * Rd / 0.95 - fs * 2, y: dcy - fs * 2 };
    } else {
      const lh = fs * (theme.labels ? 8.5 : 4);
      Rd = Math.min(box.w, H - lh) / 2 * 0.95;
      dcx = box.x + box.w / 2; dcy = top + lh + (H - lh) / 2;
      L = { x: box.x, w: box.w, y: top + fs * 2 };
    }
    if (!(Rd > 4)) return;
    const D = q => [dcx + q[0] * Rd, dcy - q[1] * Rd];
    clipBox(ctx, box);

    // The configuration.
    const p = pathAt(t), xs = V.map(v => dot3(p, v));
    const idx = [0, 1, 2, 3].sort((i, j) => xs[i] - xs[j]);
    const key = (idx[0] < idx[3] ? idx : [...idx].reverse()).join('');
    const gaps = [0, 1, 2].map(k => xs[idx[k + 1]] - xs[idx[k]]);
    const kWall = gaps.indexOf(Math.min(...gaps)), hWall = Math.max(0, 1 - gaps[kWall] / 0.35);
    const wallPair = [idx[kWall], idx[kWall + 1]].sort();
    const tripleLo = gaps[0] + gaps[1], tripleHi = gaps[1] + gaps[2];
    const tripleL = tripleLo < tripleHi ? idx[3] : idx[0];
    const hTriple = Math.max(0, 1 - Math.min(tripleLo, tripleHi) / 0.5);

    // Cells: a checkerboard by parity of the ordering (reversal of four is even, so it is well defined).
    const trace = q => { ctx.beginPath(); q.forEach((x, i) => { const [X, Y] = D(x); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); };
    for (const c of cells) {
      ctx.fillStyle = c.key === key ? rgba(theme.a1, 0.32) : c.odd ? rgba(theme.fg, 0.04) : rgba(theme.a2, 0.08);
      for (const pc of c.pieces) { trace(pc.q); ctx.fill(); }
    }

    // Walls D_ij.
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const wl of walls) {
      const hot = wl.i === wallPair[0] && wl.j === wallPair[1] ? hWall : 0;
      ctx.strokeStyle = blend(theme.fg, theme.a2, hot, 0.5 + 0.5 * hot);
      ctx.lineWidth = theme.lw * (1 + 1.5 * hot);
      for (const run of wl.runs) {
        ctx.beginPath();
        run.forEach((x, i) => { const [X, Y] = D(x); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
        ctx.stroke();
      }
    }

    // Exceptional divisors D_l∞ (three points collide = the fourth runs off to ∞).
    if (rho > 0) {
      for (const T of TRIPLE) {
        const [X, Y] = D(T.q), r = rho * Rd, hot = T.l === tripleL ? hTriple : 0;
        ctx.fillStyle = theme.bg;
        ctx.beginPath(); ctx.arc(X, Y, r, 0, 2 * Math.PI); ctx.fill();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = rgba(theme.a2, 0.55 + 0.45 * hot); ctx.lineWidth = theme.lw * (1.2 + hot);
        ctx.stroke();
        ctx.setLineDash([]);
        if (r > 22) labelC(ctx, theme, `D${SUB[T.l]}∞`, X, Y, { size: 12, color: theme.a2, alpha: 0.85 });
      }
    }

    // The disk boundary, antipodes glued.
    ctx.strokeStyle = rgba(theme.fg, 0.35); ctx.lineWidth = theme.lw * 0.7;
    ctx.beginPath(); ctx.arc(dcx, dcy, Rd, 0, 2 * Math.PI); ctx.stroke();

    if (Rd > 140) {
      for (const c of cells) for (const pc of c.pieces) {
        if (pc.A < 0.012) continue;
        const [X, Y] = D(pc.c), cur = c.key === key;
        labelC(ctx, theme, c.name, X, Y, { size: Math.max(12, fs * 0.7), alpha: cur ? 1 : 0.42, weight: cur ? 700 : 400 });
      }
    }

    // Trail and point of M_{0,5}(ℝ). The path is periodic, so the trail is a function of t alone.
    let prev = null;
    for (let k = 1; k <= 100; k++) {
      const q = D(toDisk(pathAt(t - k * 0.05), rho));
      if (prev && Math.hypot(q[0] - prev[0], q[1] - prev[1]) < Rd * 0.1) {
        ctx.strokeStyle = rgba(theme.a1, 0.7 * (1 - k / 100)); ctx.lineWidth = theme.lw * 1.4;
        ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      }
      prev = q;
    }
    const [PX, PY] = D(toDisk(p, rho));
    ctx.fillStyle = rgba(theme.a1, 0.25);
    ctx.beginPath(); ctx.arc(PX, PY, fs * 0.75, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = theme.a1;
    ctx.beginPath(); ctx.arc(PX, PY, Math.max(3.5, fs * 0.35), 0, 2 * Math.PI); ctx.fill();

    // The line: four points and ∞.
    const r = Math.max(4, fs * 0.42), x0 = L.x + r, x1 = L.x + L.w - fs * 2.2;
    const X = v => x0 + (v + 1.8) / 3.6 * (x1 - x0), y0 = L.y;
    ctx.strokeStyle = rgba(theme.fg, 0.55); ctx.lineWidth = theme.lw;
    ctx.beginPath(); ctx.moveTo(x0 - r, y0); ctx.lineTo(x1 + fs * 0.6, y0); ctx.stroke();
    ctx.strokeStyle = theme.fg; ctx.lineWidth = theme.lw * 1.2;
    ctx.beginPath(); ctx.arc(x1 + fs * 1.4, y0, r, 0, 2 * Math.PI); ctx.stroke();
    labelC(ctx, theme, '∞', x1 + fs * 1.4, y0 - r - fs * 0.75, { size: fs, alpha: 0.8 });
    idx.forEach((l, rank) => {
      const cx = X(xs[l]), col = blend(theme.a1, theme.a2, l / 3);
      const near = (rank > 0 && gaps[rank - 1] < 0.35) || (rank < 3 && gaps[rank] < 0.35);
      ctx.fillStyle = col; ctx.strokeStyle = theme.bg; ctx.lineWidth = theme.lw;
      ctx.beginPath(); ctx.arc(cx, y0, r * (near ? 1.15 : 1), 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
      labelC(ctx, theme, String(l + 1), cx, rank % 2 ? y0 + r + fs * 0.8 : y0 - r - fs * 0.75,
             { size: fs, weight: 700, color: col });
    });

    label(ctx, theme, 'Four points on ℝ, up to x ↦ ax + b', box.x, box.y + fs, { size: fs + 1, weight: 700 });
    label(ctx, theme, rho > 0 ? '12 pentagons tile M̄₀,₅(ℝ)' : '6 walls cut ℝP² into 12 triangles',
          box.x, box.y + fs * 2.3, { size: fs, alpha: 0.75, color: theme.a2 });
    const ly = y0 + fs * 3;
    label(ctx, theme, idx.map(l => `x${SUB[l]}`).join(' < '), L.x, ly, { size: fs, weight: 700 });
    label(ctx, theme, `cell ${cells.find(c => c.key === key).name}: order ${idx.map(l => l + 1).join(' ')} ∞ or reversed`,
          L.x, ly + fs * 1.4, { size: small, alpha: 0.75 });
    if (hTriple > 0.25) {
      const others = [0, 1, 2, 3].filter(l => l !== tripleL).map(l => `x${SUB[l]}`).join(' = ');
      label(ctx, theme, `near ${rho > 0 ? `D${SUB[tripleL]}∞` : 'a triple point'}: ${others}`, L.x, ly + fs * 2.8,
            { size: small, color: theme.a2, alpha: hTriple });
    } else if (hWall > 0) {
      label(ctx, theme, `near the wall D${SUB[wallPair[0]]}${SUB[wallPair[1]]}: x${SUB[wallPair[0]]} = x${SUB[wallPair[1]]}`,
            L.x, ly + fs * 2.8, { size: small, color: theme.a2, alpha: hWall });
    }
    label(ctx, theme, 'disk edge: opposite points glued', L.x, ly + fs * 4.2, { size: Math.max(12, fs * 0.8), alpha: 0.5 });
    ctx.restore();
  },
};
