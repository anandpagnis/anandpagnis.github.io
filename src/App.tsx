import { useEffect, useRef, useState } from 'react';
import type { MouseEvent, RefObject } from 'react';
import './App.css';
import nightPhoto from './assets/night.jpg';
import { Night } from './lib/night';
import type { Tint } from './lib/night';
import { startFluid } from './lib/fluid';
import { NAME, EMAIL, LINKS, PROJECTS, WORK, LEADERSHIP, EDUCATION, SKILLS } from './content';
import type { Project, Role } from './content';

const pad = (n: number) => String(n).padStart(2, '0');
const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

/* ------------------------------------------------------------------ */
/*  Copy email: the button that was pressed says Copied for a moment   */
/* ------------------------------------------------------------------ */
type CopySpot = 'nav' | 'end';
function useCopyEmail() {
    const [copied, setCopied] = useState<CopySpot | null>(null);
    const timer = useRef(0);
    useEffect(() => () => clearTimeout(timer.current), []);
    const copy = async (spot: CopySpot, e?: MouseEvent) => {
        e?.preventDefault();
        try {
            await navigator.clipboard.writeText(EMAIL);
        } catch {
            window.location.href = `mailto:${EMAIL}`;
            return;
        }
        setCopied(spot);
        clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(null), 1400);
    };
    return { copied, copy };
}

const ExternalLinks = () => (
    <>
        {LINKS.map(([label, href]) => (
            <a key={label} className="ul" href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        ))}
    </>
);

const Arrow = () => (
    <svg className="proj-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17 17 7M8 7h9v9" />
    </svg>
);

const TechLine = ({ tech }: { tech: string[] }) => (
    <p className="tech-line">
        {tech.map((t, i) => (
            <span key={t}>
                {t}
                {i < tech.length - 1 && <span className="tech-sep" aria-hidden="true"> ✦ </span>}
            </span>
        ))}
    </p>
);

/* ------------------------------------------------------------------ */
/*  The amber fluid, one fixed layer behind the whole page             */
/* ------------------------------------------------------------------ */
function Fluid() {
    const host = useRef<HTMLDivElement>(null);
    useEffect(() => {
        /* a fresh canvas per mount, since a released WebGL context can't be reused */
        const canvas = document.createElement('canvas');
        canvas.className = 'fluid';
        host.current!.append(canvas);
        const stop = startFluid(canvas);
        return () => { stop(); canvas.remove(); };
    }, []);
    return <div ref={host} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/*  Landing: the night photo in characters, the name written into it   */
/* ------------------------------------------------------------------ */
function Hero() {
    const box = useRef<HTMLDivElement>(null);
    const night = useRef<Night | null>(null);
    const [tint, setTint] = useState<Tint>('amber');

    useEffect(() => {
        const n = new Night(box.current!, {
            src: nightPhoto, tint: 'amber', bloom: 1, size: 7.5, radius: 95, lift: 2, fade: 0.24,
            name: isMobile()
                ? { text: 'Anand\nPagnis', x: 0.06, y: 0.17, width: 0.82 }
                : { text: NAME, x: 0.07, y: 0.22, width: 0.56 },
        });
        night.current = n;
        return () => { n.destroy(); night.current = null; };
    }, []);

    const pick = (t: Tint) => { setTint(t); night.current?.setTint(t); };

    return (
        <header className="hero live" id="top">
            <h1 className="sr">Anand Pagnis, software engineer</h1>
            <div className="night" ref={box} />
            <div className="band" aria-hidden="true" />
            <div className="tint" role="group" aria-label="Photo colour">
                <span className="k">Photo</span>
                <button className="ul" type="button" aria-pressed={tint === 'amber'} onClick={() => pick('amber')}>Amber</button>
                <button className="ul" type="button" aria-pressed={tint === 'original'} onClick={() => pick('original')}>Original</button>
            </div>
        </header>
    );
}

/* ------------------------------------------------------------------ */
/*  Projects: tall names, one line solid and the next outlined         */
/* ------------------------------------------------------------------ */
const ProjectBlock = ({ p, i }: { p: Project; i: number }) => (
    <article className={`proj${i % 2 ? ' flip' : ''}`} id={`p${i + 1}`}>
        <header className="proj-head">
            <p className="proj-meta">
                <span className="proj-num">{pad(i + 1)}</span>
                <span className="proj-tag">{p.tag}</span>
                <span className="proj-period">{p.period}</span>
            </p>
            <h2 className="proj-title">
                <a href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.title}>
                    {p.lines.map((line, k) => (
                        <span key={line} className={`line ${k % 2 ? 'hollow' : 'solid'}`}>
                            {line}
                            {k === p.lines.length - 1 && <Arrow />}
                        </span>
                    ))}
                </a>
            </h2>
        </header>
        <div className="proj-info">
            {p.role && <p className="proj-role">{p.role}</p>}
            <p className="proj-summary">{p.summary}</p>
            <TechLine tech={p.tech} />
        </div>
        <a className="proj-media" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.title}>
            <figure className="shot live">
                {p.media.kind === 'video'
                    ? <video src={p.media.src} muted loop playsInline autoPlay aria-label={p.title} />
                    : <img src={p.media.src} width={p.media.w} height={p.media.h} alt={p.title} loading="lazy" />}
            </figure>
        </a>
    </article>
);

/* ------------------------------------------------------------------ */
/*  Experience                                                         */
/* ------------------------------------------------------------------ */
const RoleBlock = ({ r, className = '' }: { r: Role; className?: string }) => (
    <article className={`job ${className}`}>
        <div>
            <p className="job-meta">
                <span className="when">{r.when}</span>
                <span className="role">{r.role}</span>
                <span className="where">{r.where}</span>
            </p>
            <h3 className="job-name">{r.org}</h3>
            {r.summary && <p className="job-line">{r.summary}</p>}
            {r.tech && <TechLine tech={r.tech} />}
        </div>
        <ul className="job-points">
            {r.points.map(t => <li key={t}>{t}</li>)}
        </ul>
    </article>
);

/* ------------------------------------------------------------------ */
/*  Stack: point at a tool to see where it was used                    */
/* ------------------------------------------------------------------ */
const usedBy: Record<string, string[]> = {};
[...PROJECTS.map(p => [p.title, p.tech] as const), ...WORK.filter(r => r.tech).map(r => [r.org, r.tech!] as const)]
    .forEach(([name, tech]) => tech.forEach(t => (usedBy[t.toLowerCase()] ||= []).push(name)));

function Stack() {
    const [hover, setHover] = useState<{ row: number; tool: string } | null>(null);
    return (
        <section className="wrap skills" id="stack">
            <h2 className="disp">Stack</h2>
            {SKILLS.map(([label, items], row) => (
                <div key={label} className={`stack-row${row % 2 ? ' hollow' : ''}`}>
                    <p className="label">{label}</p>
                    <p className="words">
                        {items.map(t => {
                            const used = usedBy[t.toLowerCase()];
                            return used ? (
                                <span key={t} className="word used-in"
                                    onPointerEnter={() => setHover({ row, tool: t })}
                                    onPointerLeave={() => setHover(null)}>{t}</span>
                            ) : <span key={t} className="word">{t}</span>;
                        })}
                    </p>
                    <p className="used" aria-live="polite">
                        {hover?.row === row && <>Used in <b>{usedBy[hover.tool.toLowerCase()].join(' · ')}</b></>}
                    </p>
                </div>
            ))}
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Contact: an even grid of identical dots behind the address         */
/* ------------------------------------------------------------------ */
function Dots({ box }: { box: RefObject<HTMLElement> }) {
    const ref = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const cv = ref.current!, ctx = cv.getContext('2d')!, el = box.current!;
        let timer = 0;
        function build() {
            const dpr = Math.min(devicePixelRatio || 1, 2), W = el.clientWidth, H = el.clientHeight;
            cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
            const gap = W < 700 ? 14 : 18, r = 1.1 * dpr, edge = Math.min(120, H * 0.15);
            const dots = document.createElement('canvas');
            dots.width = cv.width; dots.height = cv.height;
            const d = dots.getContext('2d')!;
            for (let y = gap / 2; y < H; y += gap) {
                /* every dot the same brightness, with a soft fade only at the top and bottom edges */
                d.fillStyle = `rgba(255,170,90,${0.42 * Math.min(1, y / edge, (H - y) / edge)})`;
                for (let x = gap / 2; x < W; x += gap) { d.beginPath(); d.arc(x * dpr, y * dpr, r, 0, 7); d.fill(); }
            }
            ctx.clearRect(0, 0, cv.width, cv.height);
            ctx.filter = `blur(${8 * dpr}px)`; ctx.globalAlpha = 0.45; ctx.drawImage(dots, 0, 0);
            ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.drawImage(dots, 0, 0);
        }
        build();
        const ro = new ResizeObserver(() => { clearTimeout(timer); timer = window.setTimeout(build, 150); });
        ro.observe(el);
        return () => { ro.disconnect(); clearTimeout(timer); };
    }, [box]);
    return <canvas className="dots" ref={ref} aria-hidden="true" />;
}

function Contact({ copied, copy }: ReturnType<typeof useCopyEmail>) {
    const box = useRef<HTMLElement>(null);
    return (
        <section className="end" id="contact" ref={box}>
            <Dots box={box} />
            <div>
                <h2 className="disp">Contact</h2>
                <a className="addr mono ul" href={`mailto:${EMAIL}`} onClick={e => copy('end', e)}>{EMAIL}</a>
                <div>
                    <button className={`key${copied === 'end' ? ' hit' : ''}`} type="button" onClick={() => copy('end')}>
                        {copied === 'end' ? 'Copied' : 'Copy email'}
                    </button>
                </div>
                <p className="links"><ExternalLinks /></p>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function App() {
    const email = useCopyEmail();
    return (
        <>
            <Fluid />
            <nav className="nav" aria-label="Links">
                <span />
                <div className="mid"><ExternalLinks /></div>
                <div className="side">
                    <button className={`copy ul${email.copied === 'nav' ? ' hit' : ''}`} type="button" onClick={() => email.copy('nav')}>
                        {email.copied === 'nav' ? 'Copied' : <><span className="long">Copy email</span><span className="short">Email</span></>}
                    </button>
                </div>
            </nav>

            <Hero />

            <main className="wrap" id="work">
                {PROJECTS.map((p, i) => <ProjectBlock key={p.title} p={p} i={i} />)}
            </main>

            <section className="wrap exp" id="experience">
                <h2 className="disp">Experience</h2>
                <div>{WORK.map(r => <RoleBlock key={r.org} r={r} />)}</div>
                <p className="sub mono">Leadership</p>
                <div>{LEADERSHIP.map(r => <RoleBlock key={r.org} r={r} className="lead" />)}</div>
                <p className="sub mono">Education</p>
                <div><RoleBlock r={EDUCATION} className="lead edu" /></div>
            </section>

            <Stack />
            <Contact {...email} />
            <footer>Anand Pagnis, 2026. The night at the top is a photo I took, redrawn in characters.</footer>
        </>
    );
}
