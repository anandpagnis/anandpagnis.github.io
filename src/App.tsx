import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { flushSync } from 'react-dom';
import {
    Sun, Moon, Github, Linkedin, FileText, Mail,
    ArrowUpRight, ArrowDown, ChevronDown, Menu, X, Image as ImageIcon, Video,
} from 'lucide-react';
import './App.css';
import adarc from './assets/adarc.png';
import projdemo from './assets/projdemo-web.mp4';
import secdash from './assets/secdash.png';
import softengvis from './assets/softengvisual.png';
import portvis from './assets/portvis.svg';



/* ==================================================================
   ⬇  HOW TO ADD REAL MEDIA  ⬇
   1. Drop your file in src/assets/ (e.g. adarc.png, sec-demo.mp4)
   2. Import it here:           import adarc from './assets/adarc.png';
   3. On the matching project below, replace:
          media: { kind: 'image', label: '...' }
      with:
          media: { kind: 'image', src: adarc }
   The <Media> component renders the real asset when `src` is set,
   and the amber CRT placeholder when it isn't.
   ================================================================== */

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */
type Media = { kind: 'image' | 'video'; label?: string; src?: string };
type Entry = {
    title: string;
    org: string;
    period: string;
    location?: string;
    points: string[];
};
type Project = {
    id: number;
    title: string;
    role?: string;
    period: string;
    tag: string;
    media: Media;
    summary: string;
    tech: string[];
    repo: string;
};

/* ------------------------------------------------------------------ */
/*  DATA — straight from the resume                                    */
/* ------------------------------------------------------------------ */
const LINKS = {
    site: 'https://anandpagnis.github.io',
    github: 'https://github.com/anandpagnis',
    linkedin: 'https://www.linkedin.com/in/anand-pagnis-96927a24a',
    resume: `${import.meta.env.BASE_URL}AnandPagnisResume.pdf`,
    email: 'anandpagnis101@gmail.com',
    adarc : 'https://adarc.netlify.app',
};

const skillGroups: { label: string; items: string[] }[] = [
    { label: 'Backend & APIs', items: ['Python', 'REST APIs', 'FastAPI', 'Async Workflows', 'PostgreSQL', 'Docker', 'Microservices'] },
    { label: 'AI & ML', items: ['TensorFlow', 'Feature Engineering', 'Model Evaluation', 'Backtesting', 'NLP', 'Recommender Systems', 'RAG Pipelines'] },
    { label: 'Frontend', items: ['React', 'Streamlit', 'TypeScript', 'CSS'] },
    { label: 'Languages', items: ['Python', 'TypeScript', 'C/C++', 'HTML', 'SQL'] },
];

/* languages shown by default; the rest live behind the "All skills" toggle */
const languages = skillGroups.find((g) => g.label === 'Languages')?.items ?? [];
const otherSkills = skillGroups.filter((g) => g.label !== 'Languages');

const experience: Entry[] = [
    {
        title: 'Software Engineer — Frontend Developer',
        org: 'Buffeat',
        period: 'Sept 2025 – Nov 2025',
        location: 'Remote',
        points: [
            'Built responsive React + TypeScript interfaces for Buffeat’s core platform and reusable component libraries, cutting feature development time by 20%.',
            'Shipped features through Agile sprints — planning, stand-ups, and code reviews.',
        ],
    },
];

const leadership: Entry[] = [
    {
        title: 'President',
        org: 'Investing Association',
        period: 'Jan 2025 – Mar 2026',
        location: 'Worcester, MA',
        points: [
            'Led a 250+ member club on a $10,000 budget and launched a six-figure student-led investment fund.',
        ],
    },
    {
        title: 'Social Chair',
        org: 'Alpha Chi Rho',
        period: 'Aug 2024 – May 2025',
        location: 'Worcester, MA',
        points: [
            'Led a 10-member committee to organize professional and social events for 100+ students, strengthening brotherhood connections on campus.',
        ],
    },
];

const projects: Project[] = [
    {
        id: 1,
        title: 'ADArC',
        role: 'Principal Software Engineer · Aug 2025 – May 2026',
        period: '2025–26',
        tag: 'Simulation · EDA',
        media: { kind: 'image', src: adarc, label: 'ADArC simulator' },
        summary: 'Expanded an Arduino circuit simulator by 25+ components — adding I²C, SPI, UART & RS485 sensor simulation with real-time SVG visualization and Arduino code generation.',
        tech: ['TypeScript', 'Blazor', 'AVR8js', 'GraphSynth', 'SVG'],
        repo: LINKS.adarc,
    },
    {
        id: 2,
        title: 'Offline Education Server',
        role: 'Project Lead & System Administrator · Fundesteam × Ministry of Education',
        period: '2024',
        tag: 'Systems · Infra',
        media: { kind: 'video', src: projdemo, label: 'Offline education server demo' },
        summary: 'Built a low-power offline learning server for rural Panama with the Ministry of Education — 85% faster video loads through Docker and Bash-automated course uploads.',
        tech: ['Docker', 'Bash', 'Linux'],
        repo: LINKS.github,
    },
    {
        id: 3,
        title: 'SEC 10-K Research Terminal',
        period: '2026',
        tag: 'Fintech · RAG',
        media: { kind: 'image', src: secdash ,label: 'Research terminal screenshot' },
        summary: 'A full-stack SEC-filing research platform (FastAPI + React) with a hybrid BM25 + dense-vector RAG pipeline that cut top-3 retrieval error by 40%.',
        tech: ['Python', 'FastAPI', 'React', 'TypeScript', 'RAG', 'BM25'],
        repo: 'https://github.com/anandpagnis/sec-dashboard',
    },
    {
        id: 4,
        title: 'Hospital Navigation & Service App',
        role: 'Project Manager & Frontend Developer · WPI × Brigham and Women’s Hospital',
        period: '2024',
        tag: 'Agile · Frontend',
        media: { kind: 'image', src: softengvis, label: 'Hospital app screenshot' },
        summary: 'Led a 9-member Agile team building a hospital navigation and service app, deployed on AWS EC2 with Docker, Prisma and PostgreSQL.',
        tech: ['React', 'TypeScript', 'AWS EC2', 'Docker', 'Prisma', 'PostgreSQL'],
        repo: LINKS.github,
    },
    {
        id: 5,
        title: 'Algorithmic Trading Engine',
        period: '2024',
        tag: 'Quant · Automation',
        media: { kind: 'image', src: portvis , label: 'Trading dashboard screenshot' },
        summary: 'A Python trading engine with a moving-average strategy and automated Investopedia execution, paired with a Streamlit + Plotly dashboard across the S&P 500.',
        tech: ['Python', 'yfinance', 'Streamlit', 'Plotly', 'pandas', 'NumPy'],
        repo: 'https://github.com/anandpagnis/Trading-Engine',
    },
];

const NAV = [
    { label: 'Projects', href: '#work', id: 'work' },
    { label: 'Experience', href: '#experience', id: 'experience' },
    { label: 'Contact', href: '#contact', id: 'contact' },
];

const SECTION_IDS = NAV.map((n) => n.id);

/* ------------------------------------------------------------------ */
/*  HOOKS                                                              */
/* ------------------------------------------------------------------ */

/* fade-up on scroll */
const useReveal = () => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    obs.unobserve(entry.target);
                }
            },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
};

const Reveal = ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => {
    const ref = useReveal();
    return (
        <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

/* thin reading-progress line under the header */
const useScrollProgress = () => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const doc = document.documentElement;
            const max = doc.scrollHeight - doc.clientHeight;
            setProgress(max > 0 ? doc.scrollTop / max : 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return progress;
};

/* highlights the section currently in view */
const useScrollSpy = (ids: readonly string[]) => {
    const [active, setActive] = useState('');
    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActive(entry.target.id);
                });
            },
            { rootMargin: '-30% 0px -60% 0px' }
        );
        ids.forEach((id) => {
            const el = document.getElementById(id);
            if (el) obs.observe(el);
        });
        return () => obs.disconnect();
    }, [ids]);
    return active;
};

/* ------------------------------------------------------------------ */
/*  SMALL PIECES                                                       */
/* ------------------------------------------------------------------ */

/* word-by-word headline reveal */
const WordReveal = ({ text, accentWords = [] }: { text: string; accentWords?: string[] }) => (
    <>
        {text.split(' ').map((word, i) => (
            <span key={i}>
                <span className="w-clip">
                    <span
                        className={`w${accentWords.includes(word) ? ' w-accent' : ''}`}
                        style={{ animationDelay: `${160 + i * 50}ms` }}
                    >
                        {word}
                    </span>
                </span>
                {' '}
            </span>
        ))}
    </>
);

/* the 70s striped sun — pure CSS, sits behind the hero */
// const RetroSun = () => (
//     <div className="sun-wrap" aria-hidden="true">
//         <div className="sun-glow" />
//         <div className="sun" />
//         <div className="horizon" />
//     </div>
// );

/* real asset when `src` is set, amber placeholder when it isn't */
const Media = ({ media, alt }: { media: Media; alt: string }) => {
    if (media.src) {
        return (
            <div className="media-frame">
                {media.kind === 'video' ? (
                    <video src={media.src} controls loop autoPlay muted playsInline />
                ) : (
                    <img src={media.src} alt={alt} loading="lazy" decoding="async" />
                )}
            </div>
        );
    }
    return (
        <div className="media-frame media-placeholder" role="img" aria-label={media.label ?? alt}>
            {media.kind === 'video' ? <Video size={20} strokeWidth={1.5} /> : <ImageIcon size={20} strokeWidth={1.5} />}
            <span className="media-label">{media.label ?? alt}</span>
        </div>
    );
};

const SectionHeader = ({ index, label }: { index: string; label: string }) => (
    <div className="section-header">
        <span className="section-index">{index}</span>
        <h2 className="section-title">{label}</h2>
        <span className="section-rule" aria-hidden="true" />
    </div>
);

const SubHeader = ({ label }: { label: string }) => (
    <div className="sub-header">
        <span className="sub-tick" aria-hidden="true" />
        <h3>{label}</h3>
    </div>
);

/* ledger row: mono meta on the left, content on the right */
const EntryRow = ({ entry }: { entry: Entry }) => (
    <div className="row">
        <div className="row-meta">
            <span>{entry.period}</span>
            {entry.location && <span>{entry.location}</span>}
        </div>
        <div className="row-body">
            <h4 className="row-title">{entry.title}</h4>
            <p className="row-org">{entry.org}</p>
            <ul className="points">
                {entry.points.map((p, i) => (
                    <li key={i}>{p}</li>
                ))}
            </ul>
        </div>
    </div>
);

/* editorial project block — alternates media side on desktop */
const ProjectBlock = ({ project, index }: { project: Project; index: number }) => (
    <article className={`proj${index % 2 === 1 ? ' flip' : ''}`}>
        <div className="proj-info">
            <div className="proj-meta">
                <span className="proj-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span className="proj-tag">{project.tag}</span>
                <span className="proj-period">{project.period}</span>
            </div>
            <h3 className="proj-title">
                <a href={project.repo} target="_blank" rel="noreferrer">
                    {project.title}
                    <ArrowUpRight className="proj-arrow" size={26} strokeWidth={1.75} aria-hidden="true" />
                </a>
            </h3>
            {project.role && <p className="proj-role">{project.role}</p>}
            <p className="proj-summary">{project.summary}</p>
            <p className="tech-line">
                {project.tech.map((t, i) => (
                    <span key={t}>
                        {t}
                        {i < project.tech.length - 1 && <span className="tech-sep" aria-hidden="true"> ✦ </span>}
                    </span>
                ))}
            </p>
        </div>
        <a
            href={project.repo}
            target="_blank"
            rel="noreferrer"
            aria-label={`${project.title} on GitHub`}
            className="proj-media"
        >
            <Media media={project.media} alt={project.title} />
        </a>
    </article>
);

/* mini striped-sun used as a footer divider ornament */
const MiniSun = () => <span className="mini-sun" aria-hidden="true" />;

/* ------------------------------------------------------------------ */
/*  APP                                                                */
/* ------------------------------------------------------------------ */
const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window === 'undefined') return true;
        const stored = localStorage.getItem('theme');
        if (stored) return stored === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const [toolkitOpen, setToolkitOpen] = useState(false);
    const progress = useScrollProgress();
    const activeSection = useScrollSpy(SECTION_IDS);
    const heroRef = useRef<HTMLElement>(null);

    /* layout effect so the class flip is captured by View Transitions */
    useLayoutEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', isDarkMode);
        root.classList.toggle('light', !isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    /* theme flip as a circular reveal from the toggle (graceful fallback) */
    const toggleTheme = (e: MouseEvent<HTMLButtonElement>) => {
        const next = !isDarkMode;
        const doc = document as Document & {
            startViewTransition?: (cb: () => void) => void;
        };
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (doc.startViewTransition && !reduceMotion) {
            document.documentElement.style.setProperty('--vt-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--vt-y', `${e.clientY}px`);
            doc.startViewTransition(() => {
                flushSync(() => setIsDarkMode(next));
            });
        } else {
            setIsDarkMode(next);
        }
    };

    /* warm cursor glow that follows the pointer through the hero */
    const onHeroPointer = (e: MouseEvent<HTMLElement>) => {
        const el = heroRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };

    return (
        <div className="page">
            {/* ============ HEADER ============ */}
            <header className="site-header">
                <div className="header-inner">
                    <a href="#top" className="wordmark">
                        <span className="wm-sun" aria-hidden="true" />
                        Anand&nbsp;Pagnis
                    </a>

                    <nav className="nav-desktop" aria-label="Sections">
                        {NAV.map((n) => (
                            <a key={n.href} href={n.href} className={`nav-link${activeSection === n.id ? ' active' : ''}`}>
                                {/*<span className="nav-index">{String(i + 1).padStart(2, '0')}</span>*/}
                                {n.label}
                            </a>
                        ))}
                    </nav>

                    <div className="header-actions">
                        <button
                            className="icon-btn"
                            onClick={toggleTheme}
                            aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                        >
                            {isDarkMode ? <Sun size={17} strokeWidth={1.75} /> : <Moon size={17} strokeWidth={1.75} />}
                        </button>
                        <button
                            className="icon-btn nav-toggle"
                            onClick={() => setMenuOpen((v) => !v)}
                            aria-label="Menu"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X size={19} strokeWidth={1.75} /> : <Menu size={19} strokeWidth={1.75} />}
                        </button>
                    </div>
                </div>

                {/* reading progress */}
                <div className="progress" aria-hidden="true">
                    <div className="progress-bar" style={{ transform: `scaleX(${progress})` }} />
                </div>

                {menuOpen && (
                    <nav className="nav-mobile" aria-label="Sections">
                        {NAV.map((n, i) => (
                            <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="nav-link">
                                <span className="nav-index">{String(i + 1).padStart(2, '0')}</span>
                                {n.label}
                            </a>
                        ))}
                    </nav>
                )}
            </header>

            <main id="top">

                {/* ============ HERO ============ */}
                <section className="hero" ref={heroRef} onMouseMove={onHeroPointer}>
                    {/*<RetroSun />*/}
                    <div className="hero-veil" aria-hidden="true" />
                    <div className="container hero-content">
                        <p className="eyebrow">Software Engineer · Full-Stack &amp; Fintech</p>
                        <h1 className="hero-title">
                            <WordReveal
                                text="I build impactful projects"
                                accentWords={['impactful']}
                            />
                        </h1>
                        <div className="hero-actions">
                            <a href="#work" className="btn">
                                See the work <ArrowDown size={15} strokeWidth={2} aria-hidden="true" />
                            </a>
                            <div className="social-row">
                                <a href={LINKS.resume} target="_blank" rel="noreferrer" className="social-btn">
                                    <FileText size={17} strokeWidth={1.75} aria-hidden="true" /> Résumé
                                </a>
                                <a href={LINKS.github} target="_blank" rel="noreferrer" className="social-btn">
                                    <Github size={17} strokeWidth={1.75} aria-hidden="true" /> GitHub
                                </a>
                                <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="social-btn">
                                    <Linkedin size={17} strokeWidth={1.75} aria-hidden="true" /> LinkedIn
                                </a>
                                <a href={`mailto:${LINKS.email}`} className="social-btn">
                                    <Mail size={17} strokeWidth={1.75} aria-hidden="true" /> Email
                                </a>
                            </div>
                        </div>

                        <div className={`toolkit${toolkitOpen ? ' open' : ''}`}>
                            <button
                                type="button"
                                className="toolkit-bar"
                                onClick={() => setToolkitOpen((v) => !v)}
                                aria-expanded={toolkitOpen}
                                aria-controls="toolkit-panel"
                            >
                                <span className="toolkit-head">
                                    <span className="toolkit-label">Toolkit</span>
                                    <span className="toolkit-langs">{languages.join('  ·  ')}</span>
                                </span>
                                <span className="toolkit-cta">
                                    {toolkitOpen ? 'Less' : 'All skills'}
                                    <ChevronDown className="toolkit-chev" size={14} strokeWidth={2} aria-hidden="true" />
                                </span>
                            </button>
                            <div className="toolkit-panel" id="toolkit-panel">
                                <div className="toolkit-panel-inner">
                                    {otherSkills.map((group) => (
                                        <div className="toolkit-row" key={group.label}>
                                            <span className="toolkit-k">{group.label}</span>
                                            <span className="toolkit-v">{group.items.join('  ·  ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="status-bar">
                        <span><span className="status-dot" /> Open to software engineering roles</span>
                        <span>Worcester, MA</span>
                    </div>
                </section>

                <div className="container">

                    {/* ============ PROJECTS ============ */}
                    <section id="work" className="section">
                        <Reveal><SectionHeader index="01" label="Projects" /></Reveal>
                        <div className="proj-list">
                            {projects.map((p, i) => (
                                <Reveal key={p.id} delay={i * 40}><ProjectBlock project={p} index={i} /></Reveal>
                            ))}
                        </div>
                    </section>

                    {/* ============ EXPERIENCE ============ */}
                    <section id="experience" className="section">
                        <Reveal><SectionHeader index="02" label="Experience" /></Reveal>
                        {experience.map((e, i) => (
                            <Reveal key={i} delay={i * 60}><EntryRow entry={e} /></Reveal>
                        ))}

                        <Reveal><SubHeader label="Leadership" /></Reveal>
                        {leadership.map((e, i) => (
                            <Reveal key={i} delay={i * 60}><EntryRow entry={e} /></Reveal>
                        ))}

                        <Reveal><SubHeader label="Education" /></Reveal>
                        <Reveal delay={60}>
                            <div className="row">
                                <div className="row-meta">
                                    <span>May 2026</span>
                                    <span>Worcester, MA</span>
                                </div>
                                <div className="row-body">
                                    <h4 className="row-title">Worcester Polytechnic Institute</h4>
                                    <p className="row-org">Bachelor of Science in Computer Science</p>
                                    <p className="row-org">Fintech Minor</p>
                                </div>
                            </div>
                        </Reveal>
                    </section>

                    {/* ============ CONTACT ============ */}
                    <footer id="contact" className="footer">
                        <Reveal>
                            <p className="footer-kicker">Contact · Open to software engineering roles</p>
                            <h2 className="footer-cta">
                                Let&rsquo;s make something <em>impactful</em><span className="footer-dot">.</span>
                            </h2>
                            <a href={`mailto:${LINKS.email}`} className="footer-mail">
                                {LINKS.email}
                                <ArrowUpRight size={22} strokeWidth={1.75} aria-hidden="true" />
                            </a>
                            <div className="link-row footer-links">
                                <a href={LINKS.github} target="_blank" rel="noreferrer" className="tlink"><Github size={14} strokeWidth={1.75} /> GitHub</a>
                                <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="tlink"><Linkedin size={14} strokeWidth={1.75} /> LinkedIn</a>
                                <a href={LINKS.resume} target="_blank" rel="noreferrer" className="tlink"><FileText size={14} strokeWidth={1.75} /> Résumé</a>
                            </div>
                            <div className="footer-divider" aria-hidden="true">
                                <span className="divider-line" /><MiniSun /><span className="divider-line" />
                            </div>
                            <div className="footer-base">
                                <p className="colophon">© {new Date().getFullYear()} Anand Pagnis </p>
                                {/*<p className="colophon">Fraunces · IBM Plex Mono · React</p>*/}
                                <a href="#top" className="top-link">Back to top ↑</a>
                            </div>
                        </Reveal>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default App;
