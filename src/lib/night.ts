/* The night photo drawn in characters, with a scramble that follows the cursor.
   Each frame repaints only the patch around the cursor; the scramble glyphs come from a sheet drawn once. */

const GLYPHS = '{}[]()<>/\\=+-*&|;:01$#%_';
const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const DENSE = '$@B%8&WM#';

type RGB = [number, number, number];

/* amber phosphor ramp, 0 = ember in the dark, 1 = hot amber */
const AMBER_STOPS: [number, RGB][] = [[0, [52, 20, 8]], [0.35, [120, 46, 14]], [0.65, [205, 92, 26]], [1, [255, 190, 110]]];
function amber(t: number): RGB {
    for (let k = 1; k < AMBER_STOPS.length; k++) {
        const [t1, c1] = AMBER_STOPS[k], [t0, c0] = AMBER_STOPS[k - 1];
        if (t <= t1) {
            const f = (t - t0) / (t1 - t0);
            return [c0[0] + (c1[0] - c0[0]) * f, c0[1] + (c1[1] - c0[1]) * f, c0[2] + (c1[2] - c0[2]) * f];
        }
    }
    return AMBER_STOPS[AMBER_STOPS.length - 1][1];
}

export type Tint = 'amber' | 'original';
export type NightName = { text: string; x: number; y: number; width: number };
export type NightOptions = {
    src: string;
    tint?: Tint;
    /** 0–1 glow around the bright characters */
    bloom?: number;
    /** base character size in CSS px */
    size?: number;
    /** scramble radius in CSS px */
    radius?: number;
    /** brightness lift for the original colours */
    lift?: number;
    /** share of the height at the bottom that fades to transparent */
    fade?: number;
    /** text written into the picture in dense, bright characters */
    name?: NightName;
};

type Grid = {
    dpr: number; W: number; H: number; cw: number; ch: number; cols: number;
    base: HTMLCanvasElement; under: HTMLCanvasElement; hole: Uint8Array;
    atlas: HTMLCanvasElement; aw: number; ah: number; K: number;
    e: Float32Array; glyph: Uint8Array; inl: Uint8Array; list: number[];
    prev: number[] | null; heat: number;
};

const canvas = (w: number, h: number) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
};

export class Night {
    tint: Tint;
    private box: HTMLElement;
    private o: Required<Omit<NightOptions, 'name' | 'tint'>> & { name?: NightName };
    private cv: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private img = new Image();
    private G: Grid | null = null;
    private P = { x: 0, y: 0, lx: null as number | null, ly: 0 };
    private raf = 0;
    private still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    private ro?: ResizeObserver;
    private io?: IntersectionObserver;
    private resizeTimer = 0;
    private dead = false;

    constructor(box: HTMLElement, opts: NightOptions) {
        this.box = box;
        this.tint = opts.tint ?? 'amber';
        this.o = { bloom: 0, size: 7.5, radius: 90, lift: 1.7, fade: 0, ...opts };
        this.cv = document.createElement('canvas');
        this.cv.setAttribute('aria-hidden', 'true');
        box.prepend(this.cv);
        this.ctx = this.cv.getContext('2d')!;
        this.img.src = opts.src;

        Promise.all([
            this.img.decode().catch(() => undefined),
            document.fonts.load(`${this.o.size}px "IBM Plex Mono"`).catch(() => undefined),
            opts.name ? document.fonts.load('60px "Archivo Black"').catch(() => undefined) : undefined,
        ]).then(() => {
            if (this.dead) return;
            this.build();
            this.ro = new ResizeObserver(() => {
                clearTimeout(this.resizeTimer);
                this.resizeTimer = window.setTimeout(() => this.build(), 150);
            });
            this.ro.observe(box);
            if (!this.still) {
                this.io = new IntersectionObserver(([e]) => {
                    if (e.isIntersecting) { this.io?.disconnect(); this.sweep(); }
                }, { threshold: 0.45 });
                this.io.observe(box);
            }
        });
        box.addEventListener('pointermove', this.onMove);
        box.addEventListener('pointerleave', this.onLeave);
    }

    setTint(t: Tint) {
        this.tint = t;
        this.build();
    }

    destroy() {
        this.dead = true;
        cancelAnimationFrame(this.raf);
        clearTimeout(this.resizeTimer);
        this.ro?.disconnect();
        this.io?.disconnect();
        this.box.removeEventListener('pointermove', this.onMove);
        this.box.removeEventListener('pointerleave', this.onLeave);
        this.cv.remove();
    }

    private onMove = (e: PointerEvent) => {
        const r = this.box.getBoundingClientRect();
        this.P.x = e.clientX - r.left;
        this.P.y = e.clientY - r.top;
        if (this.P.lx === null) { this.P.lx = this.P.x; this.P.ly = this.P.y; }
        this.wake();
    };

    private onLeave = () => { this.P.lx = null; };

    build() {
        if (!this.img.naturalWidth) return;
        const dpr = Math.min(devicePixelRatio || 1, 2), W = this.box.clientWidth, H = this.box.clientHeight;
        if (!W || !H) return;
        const fs = W < 760 ? this.o.size * 0.8 : this.o.size, cw = fs * 0.6, ch = fs * 1.1;
        const cols = Math.ceil(W / cw), rows = Math.ceil(H / ch), n = cols * rows;
        this.cv.width = Math.round(W * dpr);
        this.cv.height = Math.round(H * dpr);

        /* one sample per cell, cover-fit and anchored to the bottom like the photo */
        const s = canvas(cols, rows), sx = s.getContext('2d', { willReadFrequently: true })!;
        const k = Math.max(W / this.img.naturalWidth, H / this.img.naturalHeight);
        const dw = this.img.naturalWidth * k, dh = this.img.naturalHeight * k;
        sx.drawImage(this.img, (W - dw) / 2 / cw, (H - dh) / ch, dw / cw, dh / ch);
        const d = sx.getImageData(0, 0, cols, rows).data;

        const lum = new Float32Array(n);
        for (let i = 0; i < n; i++) lum[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
        const hi = Math.max(0.05, Float32Array.from(lum).sort()[Math.floor(n * 0.998)]);

        const idx = new Uint8Array(n), rgb = new Uint8ClampedArray(n * 3), hot = new Uint8Array(n), hole = new Uint8Array(n);
        for (let i = 0; i < n; i++) {
            const t = Math.pow(Math.min(1, lum[i] / hi), 0.9);
            idx[i] = Math.round(t * (RAMP.length - 1));
            if (this.tint === 'amber') {
                /* the dark sky stays a dim ember; only the bright parts climb to hot amber */
                const a = amber(Math.pow(Math.min(1, t * 1.1), 1.9));
                rgb[i * 3] = a[0]; rgb[i * 3 + 1] = a[1]; rgb[i * 3 + 2] = a[2];
            } else {
                rgb[i * 3] = d[i * 4] * this.o.lift + 6; rgb[i * 3 + 1] = d[i * 4 + 1] * this.o.lift + 6; rgb[i * 3 + 2] = d[i * 4 + 2] * this.o.lift + 8;
            }
            hot[i] = rgb[i * 3] > 170 ? 1 : 0;
        }

        /* the name, written into the picture: cells inside the letters become dense, bright characters */
        if (this.o.name) {
            const { text, x, y, width } = this.o.name, font = '"Archivo Black", sans-serif';
            const lines = text.split('\n');
            const m = canvas(Math.ceil(W), Math.ceil(H)), mx = m.getContext('2d', { willReadFrequently: true })!;
            mx.font = `100px ${font}`;
            const widest = Math.max(...lines.map(l => mx.measureText(l).width));
            const fsz = Math.min(100 * (width * W) / widest, H * 0.2);
            mx.font = `${fsz}px ${font}`;
            mx.textBaseline = 'top';
            mx.fillStyle = '#fff';
            lines.forEach((l, j) => mx.fillText(l, x * W, y * H + j * fsz * 1.02));
            const md = mx.getImageData(0, 0, m.width, m.height).data;
            for (let yy = 0; yy < rows; yy++) for (let xx = 0; xx < cols; xx++) {
                const px = Math.min(m.width - 1, Math.round((xx + 0.5) * cw)), py = Math.min(m.height - 1, Math.round((yy + 0.5) * ch));
                if (md[(py * m.width + px) * 4 + 3] < 110) continue;
                const i = yy * cols + xx;
                idx[i] = RAMP.indexOf(DENSE[(xx * 7 + yy * 13) % DENSE.length]);
                rgb[i * 3] = 255; rgb[i * 3 + 1] = 176; rgb[i * 3 + 2] = 92;
                hot[i] = 1;
            }
        }

        /* crisp characters on their own layer, and the bright ones on another so only they glow */
        const layer = (): [HTMLCanvasElement, CanvasRenderingContext2D] => {
            const c = canvas(this.cv.width, this.cv.height), x = c.getContext('2d')!;
            x.font = `${fs * dpr}px "IBM Plex Mono", ui-monospace, monospace`;
            x.textBaseline = 'top';
            return [c, x];
        };
        const [chars, c] = layer(), [hotLayer, hc] = layer();
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            if (!idx[i]) continue;
            const col = `rgb(${rgb[i * 3]},${rgb[i * 3 + 1]},${rgb[i * 3 + 2]})`, g = RAMP[idx[i]];
            c.fillStyle = col; c.fillText(g, x * cw * dpr, y * ch * dpr);
            if (hot[i]) { hc.fillStyle = col; hc.fillText(g, x * cw * dpr, y * ch * dpr); }
        }

        /* under: background plus glow; base: under plus the characters */
        const bg = getComputedStyle(document.body).backgroundColor || '#090c10';
        const under = canvas(this.cv.width, this.cv.height), u = under.getContext('2d')!;
        u.fillStyle = bg;
        u.fillRect(0, 0, under.width, under.height);
        if (this.o.bloom > 0) {
            u.globalCompositeOperation = 'lighter';
            u.filter = `blur(${3 * dpr}px)`; u.globalAlpha = 0.8 * this.o.bloom; u.drawImage(hotLayer, 0, 0);
            u.filter = `blur(${16 * dpr}px)`; u.globalAlpha = 0.7 * this.o.bloom; u.drawImage(hotLayer, 0, 0);
            u.filter = `blur(${42 * dpr}px)`; u.globalAlpha = 0.45 * this.o.bloom; u.drawImage(hotLayer, 0, 0);
            u.filter = 'none'; u.globalAlpha = 1; u.globalCompositeOperation = 'source-over';
        }
        const base = canvas(this.cv.width, this.cv.height), b = base.getContext('2d')!;
        b.drawImage(under, 0, 0);
        b.drawImage(chars, 0, 0);
        if (this.o.fade > 0) {
            for (const x of [u, b]) {
                /* destination-in clears whatever the fill doesn't cover, so the gradient spans the whole height */
                const g = x.createLinearGradient(0, 0, 0, base.height);
                g.addColorStop(0, '#000'); g.addColorStop(1 - this.o.fade, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
                x.globalCompositeOperation = 'destination-in';
                x.fillStyle = g; x.fillRect(0, 0, base.width, base.height);
                x.globalCompositeOperation = 'source-over';
            }
        }

        /* the scramble glyphs, pre-drawn once in a few amber levels */
        const K = 10, aw = Math.ceil(cw * dpr) + 2, ah = Math.ceil(ch * dpr) + 2;
        const atlas = canvas(aw * GLYPHS.length, ah * K), ax = atlas.getContext('2d')!;
        ax.font = `${fs * dpr}px "IBM Plex Mono", ui-monospace, monospace`;
        ax.textBaseline = 'top';
        for (let lv = 0; lv < K; lv++) {
            const a = amber(0.5 + 0.5 * lv / (K - 1));
            ax.fillStyle = `rgb(${a[0] | 0},${a[1] | 0},${a[2] | 0})`;
            for (let j = 0; j < GLYPHS.length; j++) ax.fillText(GLYPHS[j], j * aw, lv * ah);
        }

        this.G = { dpr, W, H, cw, ch, cols, base, under, hole, atlas, aw, ah, K,
            e: new Float32Array(n), glyph: new Uint8Array(n), inl: new Uint8Array(n), list: [], prev: null, heat: 0 };
        this.ctx.clearRect(0, 0, this.cv.width, this.cv.height);
        this.ctx.drawImage(base, 0, 0);
    }

    /* cells near a point flip to code symbols, then settle as their energy fades */
    private stir(px: number, py: number) {
        const G = this.G!, R = this.o.radius, rows = Math.ceil(G.H / G.ch);
        const x0 = Math.max(0, Math.floor((px - R) / G.cw)), x1 = Math.min(G.cols - 1, Math.ceil((px + R) / G.cw));
        const y0 = Math.max(0, Math.floor((py - R) / G.ch)), y1 = Math.min(rows - 1, Math.ceil((py + R) / G.ch));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
            const dx = (x + 0.5) * G.cw - px, dy = (y + 0.5) * G.ch - py, d2 = dx * dx + dy * dy;
            if (d2 > R * R) continue;
            const i = y * G.cols + x, f = 1 - Math.sqrt(d2) / R, v = f * f * (3 - 2 * f);
            if (G.hole[i] || v <= G.e[i]) continue;
            G.e[i] = v;
            if (!G.inl[i]) { G.inl[i] = 1; G.list.push(i); }
        }
    }

    private frame = () => {
        this.raf = 0;
        const G = this.G, P = this.P;
        if (!G) return;
        if (P.lx !== null) {
            const dist = Math.hypot(P.x - P.lx, P.y - P.ly), steps = Math.max(1, Math.ceil(dist / 12));
            for (let k = 1; k <= steps; k++) this.stir(P.lx + (P.x - P.lx) * k / steps, P.ly + (P.y - P.ly) * k / steps);
            if (dist > 0.5) G.heat = Math.min(1, G.heat + 0.35);
            P.lx = P.x; P.ly = P.y;
        }
        const { ctx } = this, { dpr, cols, cw, ch, e, glyph, inl, list, base, under, atlas, aw, ah, K } = G;
        const cwp = cw * dpr, chp = ch * dpr;

        /* settle the energy, drop cells that have calmed, and find the patch still moving */
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
        const scr: number[] = [];
        for (let k = list.length - 1; k >= 0; k--) {
            const i = list[k];
            if (e[i] < 0.03) { e[i] = 0; glyph[i] = 0; inl[i] = 0; list[k] = list[list.length - 1]; list.pop(); continue; }
            const x = i % cols, y = (i - x) / cols;
            if (x < x0) x0 = x;
            if (x > x1) x1 = x;
            if (y < y0) y0 = y;
            if (y > y1) y1 = y;
            if (e[i] > 0.25) {
                if (!glyph[i] || Math.random() < 0.25) glyph[i] = 1 + ((Math.random() * GLYPHS.length) | 0);
                scr.push(i);
            } else glyph[i] = 0;
            e[i] *= 0.86;
        }
        const box = x1 >= 0 ? [x0 * cwp - 2, y0 * chp - 2, (x1 + 1) * cwp + aw, (y1 + 1) * chp + ah] : null;
        const gr = this.o.radius * 1.35 * dpr;
        const light = G.heat > 0.02 && P.lx !== null ? [P.x * dpr - gr, P.y * dpr - gr, P.x * dpr + gr, P.y * dpr + gr] : null;

        /* restore everything touched last frame or this one, in one copy */
        const parts = [box, light, G.prev].filter((p): p is number[] => !!p);
        if (parts.length) {
            const L = Math.max(0, Math.floor(Math.min(...parts.map(p => p[0])))), T = Math.max(0, Math.floor(Math.min(...parts.map(p => p[1]))));
            const R = Math.min(this.cv.width, Math.ceil(Math.max(...parts.map(p => p[2])))), B = Math.min(this.cv.height, Math.ceil(Math.max(...parts.map(p => p[3]))));
            if (R > L && B > T) { ctx.clearRect(L, T, R - L, B - T); ctx.drawImage(base, L, T, R - L, B - T, L, T, R - L, B - T); }
        }

        if (box && scr.length) {
            /* blank the scrambled cells back to their glow, then stamp the code glyphs */
            ctx.save();
            ctx.beginPath();
            for (const i of scr) { const x = i % cols, y = (i - x) / cols; ctx.rect(x * cwp, y * chp, cwp + 0.5, chp + 0.5); }
            ctx.clip();
            ctx.drawImage(under, box[0], box[1], box[2] - box[0], box[3] - box[1], box[0], box[1], box[2] - box[0], box[3] - box[1]);
            ctx.restore();
            for (const i of scr) {
                const x = i % cols, y = (i - x) / cols, lv = Math.min(K - 1, Math.round(e[i] * (K - 1)));
                ctx.drawImage(atlas, (glyph[i] - 1) * aw, lv * ah, aw, ah, x * cwp, y * chp, aw, ah);
            }
        }

        if (light) {
            const g = ctx.createRadialGradient(P.x * dpr, P.y * dpr, 0, P.x * dpr, P.y * dpr, gr);
            g.addColorStop(0, `rgba(255,140,50,${0.2 * G.heat})`);
            g.addColorStop(1, 'rgba(255,140,50,0)');
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = g;
            ctx.fillRect(light[0], light[1], gr * 2, gr * 2);
            ctx.globalCompositeOperation = 'source-over';
        }
        G.heat *= 0.9;

        const drew = box || light;
        G.prev = drew
            ? [Math.min(box?.[0] ?? 1e9, light?.[0] ?? 1e9), Math.min(box?.[1] ?? 1e9, light?.[1] ?? 1e9),
                Math.max(box?.[2] ?? -1, light?.[2] ?? -1), Math.max(box?.[3] ?? -1, light?.[3] ?? -1)]
            : null;
        if (drew) this.raf = requestAnimationFrame(this.frame);
    };

    private wake() {
        if (!this.raf && !this.still && this.G && !this.dead) this.raf = requestAnimationFrame(this.frame);
    }

    /* when the landing first comes into view, a scramble runs once along the roofline */
    private sweep() {
        const t0 = performance.now(), dur = 1500;
        const step = (now: number) => {
            if (this.dead || !this.G) return;
            const t = Math.min(1, (now - t0) / dur);
            this.stir(this.G.W * (0.15 + 0.7 * t), this.G.H * (0.72 + 0.05 * Math.sin(t * Math.PI)));
            this.wake();
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }
}
