/* Amber fluid that follows the cursor behind the whole page.
   Adapted from Pavel Dobryakov's WebGL Fluid Simulation (MIT licence).
   Amber-only dye, lower resolution, and it stops drawing once the cursor rests and the dye has faded.
   Returns a function that stops it and frees the GPU context. */

type GL = WebGLRenderingContext;
type Format = { internal: number; fmt: number };
type FBO = { fbo: WebGLFramebuffer; width: number; height: number; tsx: number; tsy: number; attach(id: number): number };
type DoubleFBO = { width: number; height: number; tsx: number; tsy: number; read: FBO; write: FBO; swap(): void };
type RGB = [number, number, number];

export function startFluid(canvas: HTMLCanvasElement): () => void {
    const noop = () => {};
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return noop;

    const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
    const PR = Math.min(devicePixelRatio || 1, touch ? 1.5 : 2);
    const CFG = {
        SIM: touch ? 96 : 128, DYE: touch ? 640 : 1024,
        DENSITY: 0.85, VELOCITY: 2.6, PRESSURE: 0.1, ITERATIONS: 20, CURL: 4,
        RADIUS: touch ? 0.18 : 0.22, FORCE: touch ? 4200 : 5600, SHADING: true,
        IDLE_MS: 7000,
    };

    const resize = () => {
        const w = Math.floor(innerWidth * PR), h = Math.floor(innerHeight * PR);
        if (canvas.width === w && canvas.height === h) return false;
        canvas.width = w; canvas.height = h;
        return true;
    };
    resize();

    const opts: WebGLContextAttributes = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    const gl2 = canvas.getContext('webgl2', opts) as WebGL2RenderingContext | null;
    const gl = (gl2 ?? canvas.getContext('webgl', opts)) as GL | null;
    if (!gl) return noop;

    let hf: OES_texture_half_float | null = null;
    let linear: unknown;
    if (gl2) { gl2.getExtension('EXT_color_buffer_float'); linear = gl2.getExtension('OES_texture_float_linear'); }
    else { hf = gl.getExtension('OES_texture_half_float'); linear = gl.getExtension('OES_texture_half_float_linear'); }
    if (!gl2 && !hf) return noop;
    if (!linear) { CFG.DYE = 256; CFG.SHADING = false; }
    const HALF = gl2 ? gl2.HALF_FLOAT : hf!.HALF_FLOAT_OES;

    function format(internal: number, fmt: number): Format | null {
        const t = gl!.createTexture();
        gl!.bindTexture(gl!.TEXTURE_2D, t);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.NEAREST);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.NEAREST);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, internal, 4, 4, 0, fmt, HALF, null);
        const fb = gl!.createFramebuffer();
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
        gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, t, 0);
        if (gl!.checkFramebufferStatus(gl!.FRAMEBUFFER) === gl!.FRAMEBUFFER_COMPLETE) return { internal, fmt };
        if (gl2 && internal === gl2.R16F) return format(gl2.RG16F, gl2.RG);
        if (gl2 && internal === gl2.RG16F) return format(gl2.RGBA16F, gl2.RGBA);
        return null;
    }
    const fRGBA = gl2 ? format(gl2.RGBA16F, gl2.RGBA) : format(gl.RGBA, gl.RGBA);
    const fRG = gl2 ? format(gl2.RG16F, gl2.RG) : fRGBA;
    const fR = gl2 ? format(gl2.R16F, gl2.RED) : fRGBA;
    if (!fRGBA || !fRG || !fR) return noop;

    const shader = (type: number, src: string, defs?: string[] | null) => {
        const sh = gl.createShader(type)!;
        gl.shaderSource(sh, (defs || []).map(d => '#define ' + d + '\n').join('') + src);
        gl.compileShader(sh);
        return sh;
    };
    class Program {
        p: WebGLProgram;
        u: Record<string, WebGLUniformLocation | null> = {};
        constructor(vs: WebGLShader, fs: WebGLShader) {
            this.p = gl!.createProgram()!;
            gl!.attachShader(this.p, vs); gl!.attachShader(this.p, fs); gl!.linkProgram(this.p);
            const n = gl!.getProgramParameter(this.p, gl!.ACTIVE_UNIFORMS);
            for (let i = 0; i < n; i++) { const name = gl!.getActiveUniform(this.p, i)!.name; this.u[name] = gl!.getUniformLocation(this.p, name); }
        }
        bind() { gl!.useProgram(this.p); }
    }

    const VS = shader(gl.VERTEX_SHADER, `precision highp float;
    attribute vec2 aPosition; varying vec2 vUv,vL,vR,vT,vB; uniform vec2 texelSize;
    void main(){vUv=aPosition*.5+.5;vL=vUv-vec2(texelSize.x,0.);vR=vUv+vec2(texelSize.x,0.);vT=vUv+vec2(0.,texelSize.y);vB=vUv-vec2(0.,texelSize.y);gl_Position=vec4(aPosition,0.,1.);}`);
    const frag = (src: string, defs?: string[] | null) => shader(gl.FRAGMENT_SHADER, src, defs);

    const clearP = new Program(VS, frag(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;
    void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`));
    const splatP = new Program(VS, frag(`precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;
    void main(){vec2 p=vUv-point;p.x*=aspectRatio;gl_FragColor=vec4(texture2D(uTarget,vUv).xyz+exp(-dot(p,p)/radius)*color,1.);}`));
    const advectP = new Program(VS, frag(`precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity,uSource;uniform vec2 texelSize,dyeTexelSize;uniform float dt,dissipation;
    vec4 bl(sampler2D s,vec2 uv,vec2 ts){vec2 st=uv/ts-.5,i=floor(st),f=fract(st);
      return mix(mix(texture2D(s,(i+vec2(.5,.5))*ts),texture2D(s,(i+vec2(1.5,.5))*ts),f.x),mix(texture2D(s,(i+vec2(.5,1.5))*ts),texture2D(s,(i+vec2(1.5,1.5))*ts),f.x),f.y);}
    void main(){
      #ifdef MANUAL_FILTERING
      vec2 c=vUv-dt*bl(uVelocity,vUv,texelSize).xy*texelSize;gl_FragColor=bl(uSource,c,dyeTexelSize)/(1.+dissipation*dt);
      #else
      vec2 c=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;gl_FragColor=texture2D(uSource,c)/(1.+dissipation*dt);
      #endif
    }`, linear ? null : ['MANUAL_FILTERING']));
    const divergenceP = new Program(VS, frag(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;
    void main(){float L=texture2D(uVelocity,vL).x,R=texture2D(uVelocity,vR).x,T=texture2D(uVelocity,vT).y,B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;
      if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}`));
    const curlP = new Program(VS, frag(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;
    void main(){gl_FragColor=vec4(.5*(texture2D(uVelocity,vR).y-texture2D(uVelocity,vL).y-texture2D(uVelocity,vT).x+texture2D(uVelocity,vB).x),0.,0.,1.);}`));
    const vorticityP = new Program(VS, frag(`precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity,uCurl;uniform float curl,dt;
    void main(){float L=texture2D(uCurl,vL).x,R=texture2D(uCurl,vR).x,T=texture2D(uCurl,vT).x,B=texture2D(uCurl,vB).x,C=texture2D(uCurl,vUv).x;
      vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f=f/(length(f)+.0001)*curl*C;f.y*=-1.;
      vec2 v=texture2D(uVelocity,vUv).xy+f*dt;gl_FragColor=vec4(clamp(v,-1000.,1000.),0.,1.);}`));
    const pressureP = new Program(VS, frag(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uDivergence;
    void main(){gl_FragColor=vec4((texture2D(uPressure,vL).x+texture2D(uPressure,vR).x+texture2D(uPressure,vB).x+texture2D(uPressure,vT).x-texture2D(uDivergence,vUv).x)*.25,0.,0.,1.);}`));
    const gradientP = new Program(VS, frag(`precision mediump float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uVelocity;
    void main(){vec2 v=texture2D(uVelocity,vUv).xy-vec2(texture2D(uPressure,vR).x-texture2D(uPressure,vL).x,texture2D(uPressure,vT).x-texture2D(uPressure,vB).x);gl_FragColor=vec4(v,0.,1.);}`));
    /* shading lights the dye like a lit surface, which is what makes it read as glass */
    const displayP = new Program(VS, frag(`precision highp float;precision highp sampler2D;varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uTexture;uniform vec2 texelSize;
    void main(){vec3 c=texture2D(uTexture,vUv).rgb;
      #ifdef SHADING
      float dx=length(texture2D(uTexture,vR).rgb)-length(texture2D(uTexture,vL).rgb);float dy=length(texture2D(uTexture,vT).rgb)-length(texture2D(uTexture,vB).rgb);
      c*=clamp(dot(normalize(vec3(dx,dy,length(texelSize))),vec3(0.,0.,1.))+.7,.7,1.);
      #endif
      gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`, CFG.SHADING ? ['SHADING'] : null));

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    const blit = (target: FBO | null) => {
        if (target) { gl.viewport(0, 0, target.width, target.height); gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo); }
        else { gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER, null); }
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    function fbo(w: number, h: number, f: Format, filter: number): FBO {
        gl!.activeTexture(gl!.TEXTURE0);
        const tex = gl!.createTexture();
        gl!.bindTexture(gl!.TEXTURE_2D, tex);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, filter);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, filter);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
        gl!.texImage2D(gl!.TEXTURE_2D, 0, f.internal, w, h, 0, f.fmt, HALF, null);
        const fb = gl!.createFramebuffer()!;
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, fb);
        gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tex, 0);
        gl!.viewport(0, 0, w, h); gl!.clearColor(0, 0, 0, 1); gl!.clear(gl!.COLOR_BUFFER_BIT);
        return {
            fbo: fb, width: w, height: h, tsx: 1 / w, tsy: 1 / h,
            attach(id: number) { gl!.activeTexture(gl!.TEXTURE0 + id); gl!.bindTexture(gl!.TEXTURE_2D, tex); return id; },
        };
    }
    function double(w: number, h: number, f: Format, filter: number): DoubleFBO {
        let a = fbo(w, h, f, filter), b = fbo(w, h, f, filter);
        return { width: w, height: h, tsx: 1 / w, tsy: 1 / h, get read() { return a; }, get write() { return b; }, swap() { [a, b] = [b, a]; } };
    }
    const res = (r: number) => {
        let a = gl.drawingBufferWidth / gl.drawingBufferHeight;
        if (a < 1) a = 1 / a;
        const lo = Math.round(r), hi = Math.round(r * a);
        return gl.drawingBufferWidth > gl.drawingBufferHeight ? { w: hi, h: lo } : { w: lo, h: hi };
    };

    let dye: DoubleFBO, vel: DoubleFBO, divergence: FBO, curl: FBO, pressure: DoubleFBO;
    function init() {
        const s = res(CFG.SIM), d = res(CFG.DYE), filt = linear ? gl!.LINEAR : gl!.NEAREST;
        gl!.disable(gl!.BLEND);
        dye = double(d.w, d.h, fRGBA!, filt);
        vel = double(s.w, s.h, fRG!, filt);
        divergence = fbo(s.w, s.h, fR!, gl!.NEAREST);
        curl = fbo(s.w, s.h, fR!, gl!.NEAREST);
        pressure = double(s.w, s.h, fR!, gl!.NEAREST);
    }
    init();

    /* burnt orange to amber, the same range as the night photo's glow */
    function amber(): RGB {
        const h = 0.035 + Math.random() * 0.045, s = 0.9, v = 0.1;
        const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
        return ([[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]] as RGB[])[i % 6];
    }

    function splat(x: number, y: number, dx: number, dy: number, c: RGB) {
        splatP.bind();
        gl!.uniform1i(splatP.u.uTarget, vel.read.attach(0));
        gl!.uniform1f(splatP.u.aspectRatio, canvas.width / canvas.height);
        gl!.uniform2f(splatP.u.point, x, y);
        gl!.uniform3f(splatP.u.color, dx, dy, 0);
        gl!.uniform1f(splatP.u.radius, CFG.RADIUS / 100 * Math.max(1, canvas.width / canvas.height));
        blit(vel.write); vel.swap();
        gl!.uniform1i(splatP.u.uTarget, dye.read.attach(0));
        gl!.uniform3f(splatP.u.color, c[0], c[1], c[2]);
        blit(dye.write); dye.swap();
    }

    function step(dt: number) {
        const g = gl!;
        g.disable(g.BLEND);
        curlP.bind(); g.uniform2f(curlP.u.texelSize, vel.tsx, vel.tsy); g.uniform1i(curlP.u.uVelocity, vel.read.attach(0)); blit(curl);
        vorticityP.bind(); g.uniform2f(vorticityP.u.texelSize, vel.tsx, vel.tsy); g.uniform1i(vorticityP.u.uVelocity, vel.read.attach(0));
        g.uniform1i(vorticityP.u.uCurl, curl.attach(1)); g.uniform1f(vorticityP.u.curl, CFG.CURL); g.uniform1f(vorticityP.u.dt, dt); blit(vel.write); vel.swap();
        divergenceP.bind(); g.uniform2f(divergenceP.u.texelSize, vel.tsx, vel.tsy); g.uniform1i(divergenceP.u.uVelocity, vel.read.attach(0)); blit(divergence);
        clearP.bind(); g.uniform1i(clearP.u.uTexture, pressure.read.attach(0)); g.uniform1f(clearP.u.value, CFG.PRESSURE); blit(pressure.write); pressure.swap();
        pressureP.bind(); g.uniform2f(pressureP.u.texelSize, vel.tsx, vel.tsy); g.uniform1i(pressureP.u.uDivergence, divergence.attach(0));
        for (let i = 0; i < CFG.ITERATIONS; i++) { g.uniform1i(pressureP.u.uPressure, pressure.read.attach(1)); blit(pressure.write); pressure.swap(); }
        gradientP.bind(); g.uniform2f(gradientP.u.texelSize, vel.tsx, vel.tsy); g.uniform1i(gradientP.u.uPressure, pressure.read.attach(0));
        g.uniform1i(gradientP.u.uVelocity, vel.read.attach(1)); blit(vel.write); vel.swap();
        advectP.bind(); g.uniform2f(advectP.u.texelSize, vel.tsx, vel.tsy);
        if (!linear) g.uniform2f(advectP.u.dyeTexelSize, vel.tsx, vel.tsy);
        const v = vel.read.attach(0);
        g.uniform1i(advectP.u.uVelocity, v); g.uniform1i(advectP.u.uSource, v); g.uniform1f(advectP.u.dt, dt); g.uniform1f(advectP.u.dissipation, CFG.VELOCITY);
        blit(vel.write); vel.swap();
        if (!linear) g.uniform2f(advectP.u.dyeTexelSize, dye.tsx, dye.tsy);
        g.uniform1i(advectP.u.uVelocity, vel.read.attach(0)); g.uniform1i(advectP.u.uSource, dye.read.attach(1)); g.uniform1f(advectP.u.dissipation, CFG.DENSITY);
        blit(dye.write); dye.swap();
    }

    const P = { x: 0, y: 0, px: 0, py: 0, dx: 0, dy: 0, moved: false, color: amber() };
    let last = performance.now(), colorClock = 0, lastMove = 0, running = false, raf = 0, stopped = false;

    function frame(now: number) {
        if (stopped) return;
        const g = gl!;
        const dt = Math.min((now - last) / 1000, 1 / 60);
        last = now;
        if (resize()) init();
        colorClock += dt * 10;
        if (colorClock >= 1) { colorClock %= 1; P.color = amber(); }
        if (P.moved) { P.moved = false; splat(P.x, P.y, P.dx * CFG.FORCE, P.dy * CFG.FORCE, P.color); }
        step(dt);
        g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
        g.enable(g.BLEND);
        displayP.bind();
        if (CFG.SHADING) g.uniform2f(displayP.u.texelSize, 1 / g.drawingBufferWidth, 1 / g.drawingBufferHeight);
        g.uniform1i(displayP.u.uTexture, dye.read.attach(0));
        blit(null);
        /* rest once the cursor has been still long enough for the dye to fade */
        if (now - lastMove > CFG.IDLE_MS) { running = false; return; }
        raf = requestAnimationFrame(frame);
    }
    function wake() {
        lastMove = performance.now();
        if (!running && !stopped) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
    }

    const toUv = (cx: number, cy: number) => [cx * PR / canvas.width, 1 - cy * PR / canvas.height];
    function move(cx: number, cy: number) {
        const [x, y] = toUv(cx, cy);
        P.px = P.x; P.py = P.y; P.x = x; P.y = y;
        const a = canvas.width / canvas.height, dx = x - P.px, dy = y - P.py;
        P.dx = a < 1 ? dx * a : dx; P.dy = a > 1 ? dy / a : dy;
        P.moved = Math.abs(P.dx) > 0 || Math.abs(P.dy) > 0;
        wake();
    }

    let primed = false;
    const onMouseMove = (e: MouseEvent) => {
        if (!primed) { primed = true; [P.x, P.y] = toUv(e.clientX, e.clientY); }
        move(e.clientX, e.clientY);
    };
    const onMouseDown = (e: MouseEvent) => {
        const [x, y] = toUv(e.clientX, e.clientY);
        splat(x, y, 10 * (Math.random() - 0.5), 30 * (Math.random() - 0.5), amber().map(v => v * 6) as RGB);
        wake();
    };
    const onTouchStart = (e: TouchEvent) => { const t = e.targetTouches[0]; if (t) [P.x, P.y] = toUv(t.clientX, t.clientY); };
    const onTouchMove = (e: TouchEvent) => { const t = e.targetTouches[0]; if (t) move(t.clientX, t.clientY); };
    const onResize = () => { if (resize()) init(); wake(); };

    const passive = { passive: true } as const;
    addEventListener('mousemove', onMouseMove, passive);
    addEventListener('mousedown', onMouseDown, passive);
    addEventListener('resize', onResize, passive);
    if (touch) {
        addEventListener('touchstart', onTouchStart, passive);
        addEventListener('touchmove', onTouchMove, passive);
    }

    return () => {
        stopped = true;
        cancelAnimationFrame(raf);
        removeEventListener('mousemove', onMouseMove);
        removeEventListener('mousedown', onMouseDown);
        removeEventListener('resize', onResize);
        removeEventListener('touchstart', onTouchStart);
        removeEventListener('touchmove', onTouchMove);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
}
