import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
    Sun, Moon, Github, Linkedin, FileText, ArrowUpRight,
    Menu, X, MapPin, Mail, Image as ImageIcon, Video,
} from 'lucide-react';
import './App.css';

/* ------------------------------------------------------------------ */
/*  TECH ICONS                                                         */
/*  (only the ones we actually map below are imported, to keep         */
/*   TypeScript's no-unused-locals happy)                              */
/* ------------------------------------------------------------------ */
import pythonicon from './assets/python.svg';
import typescripticon from './assets/typescript.svg';
import htmlicon from './assets/html.svg';
import cssicon from './assets/css.svg';
import dockericon from './assets/docker.svg';

const ICONS: Record<string, string> = {
    Python: pythonicon,
    TypeScript: typescripticon,
    HTML: htmlicon,
    CSS: cssicon,
    Docker: dockericon,
};

/* ==================================================================
   ⬇  HOW TO ADD REAL MEDIA  ⬇
   1. Drop your file in src/assets/ (e.g. adarc.png, sec-demo.mp4)
   2. Import it here:           import adarc from './assets/adarc.png';
   3. On the matching project below, replace:
          media: { kind: 'image', label: '...' }
      with:
          media: { kind: 'image', src: adarc }
   The <Media> component renders the real asset when `src` is set,
   and the dashed placeholder when it isn't.
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
    location?: string;
    tag?: string;
    media: Media;
    points: string[];
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
};

const skillGroups: { label: string; items: string[] }[] = [
    { label: 'Backend & APIs', items: ['Python', 'REST APIs', 'FastAPI', 'Async Workflows', 'PostgreSQL', 'Docker', 'Microservices'] },
    { label: 'AI & ML', items: ['TensorFlow', 'Feature Engineering', 'Model Evaluation', 'Backtesting', 'NLP', 'Recommender Systems', 'RAG Pipelines'] },
    { label: 'Frontend', items: ['React', 'Streamlit', 'TypeScript', 'CSS'] },
    { label: 'Languages', items: ['Python', 'TypeScript', 'C/C++', 'HTML', 'SQL'] },
];

const experience: Entry[] = [
    {
        title: 'Software Engineer — Frontend Developer',
        org: 'Buffeat',
        period: 'Sept 2025 – Nov 2025',
        location: 'Remote',
        points: [
            'Developed and maintained responsive user interfaces for Buffeat\u2019s core platform using React and TypeScript, and standardized branding policies.',
            'Implemented reusable component libraries and state-management solutions, reducing development time for new features by 20%.',
            'Participated in Agile sprints — sprint planning, daily stand-ups, and code reviews — delivering features on time with high code quality.',
        ],
    },
    {
        title: 'Project Lead & System Administrator',
        org: 'Fundesteam',
        period: 'Aug 2024 – Oct 2024',
        location: 'Panama City, Panama',
        points: [
            'Partnered with the Ministry of Education to develop a low-power, scalable, offline educational server for rural Panama.',
            'Achieved 85% faster video load times through an iterative development process using Docker.',
            'Automated course uploads with Bash scripts and optimized OS performance, reducing CPU temperatures by 13%.',
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
            'Led discussions on financial markets, investment strategies, and risk analysis while organizing campus-wide events for a 250+ member club and managing a $10,000 budget.',
            'Launched a six-figure student-led investment fund and served as a voting member on its committee.',
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
        title: 'ADArC — Automated Design Tool for Arduino Circuits',
        role: 'Principal Software Engineer',
        period: 'Aug 2025 – May 2026',
        location: 'Worcester, MA',
        tag: 'Simulation · EDA',
        media: { kind: 'video', label: 'ADArC simulator demo' },
        points: [
            'Expanded an Arduino circuit simulator by 25+ components using TypeScript, Blazor, AVR8js, and GraphSynth.',
            'Implemented I2C, SPI, UART, RS485, and analog/digital sensor & actuator simulation with real-time SVG visualization.',
            'Built Arduino code-generation support with dynamic pin mapping and custom library integration.',
            'Developed event-driven synchronization between the UI, simulation controllers, and AVR microcontroller execution.',
        ],
        tech: ['TypeScript', 'Blazor', 'AVR8js', 'GraphSynth', 'SVG'],
        repo: LINKS.github,
    },
    {
        id: 2,
        title: 'SEC 10-K Research Terminal',
        period: 'May 2026',
        tag: 'Fintech · Full-Stack · RAG',
        media: { kind: 'image', label: 'Research terminal screenshot' },
        points: [
            'Built a full-stack financial research platform with a Python/FastAPI backend and React/TypeScript frontend, with end-to-end type safety eliminating data mismatches across 15+ models from SEC EDGAR to the UI.',
            'Implemented a hybrid RAG retrieval system combining BM25 keyword matching with nomic-embed-text dense vectors, reciprocal rank fusion, and lightweight reranking — reducing top-3 retrieval error rate by 40%.',
            'Developed a heuristic SEC document parser extracting sections, financial statements, and XBRL metrics from raw 10-K HTML, producing structured, citation-trackable outputs with stable evidence IDs.',
        ],
        tech: ['Python', 'FastAPI', 'React', 'TypeScript', 'RAG', 'BM25'],
        repo: 'https://github.com/anandpagnis/sec-dashboard',
    },
    {
        id: 3,
        title: 'Algorithmic Trading Engine',
        period: '2024',
        tag: 'Fintech · Quant · Automation',
        media: { kind: 'image', label: 'Trading dashboard screenshot' },
        points: [
            'Built a Python trading engine that pulls market data via yfinance and generates buy/sell signals from a moving-average crossover strategy with configurable trade limits.',
            'Automated end-to-end trade execution against the Investopedia simulator using PyAutoGUI and Tesseract OCR for on-screen action detection.',
            'Developed an interactive Streamlit + Plotly dashboard for multi-ticker comparison across configurable intervals and time periods over the S&P 500 universe.',
        ],
        tech: ['Python', 'yfinance', 'Streamlit', 'Plotly', 'pandas', 'NumPy'],
        repo: 'https://github.com/anandpagnis/Trading-Engine',
    },
    {
        id: 4,
        title: 'Hospital Navigation & Service App',
        role: 'Project Manager & Frontend Developer',
        period: 'Jan 2024 – Apr 2024',
        location: 'WPI · Brigham and Women\u2019s Hospital',
        tag: 'Agile · Frontend',
        media: { kind: 'image', label: 'Hospital app screenshot' },
        points: [
            'Led development of a hospital navigation and service-management app as Project Manager, coordinating a 9-member team using Agile methodologies and tools like Jira.',
            'Deployed website infrastructure with AWS EC2, Docker, and Prisma ORM, backed by a PostgreSQL database.',
        ],
        tech: ['React', 'TypeScript', 'AWS EC2', 'Docker', 'Prisma ORM', 'PostgreSQL', 'Jira'],
        repo: LINKS.github,
    },
];

/* ------------------------------------------------------------------ */
/*  SCROLL-REVEAL                                                      */
/* ------------------------------------------------------------------ */
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
            { threshold: 0.12 }
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

/* ------------------------------------------------------------------ */
/*  MEDIA (real asset or labeled placeholder)                          */
/* ------------------------------------------------------------------ */
const Media = ({ media, alt }: { media: Media; alt: string }) => {
    if (media.src) {
        return (
            <div className="media-frame">
                {media.kind === 'video' ? (
                    <video className="block w-full" src={media.src} controls loop autoPlay muted playsInline />
                ) : (
                    <img className="block w-full" src={media.src} alt={alt} />
                )}
            </div>
        );
    }
    return (
        <div className="media-frame media-placeholder">
            <div className="media-placeholder-inner">
                {media.kind === 'video' ? <Video className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
                <span className="label">{media.label ?? alt}</span>
                <span className="hint">Add {media.kind === 'video' ? 'a video' : 'an image'} here</span>
            </div>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/*  ENTRY CARD (experience / leadership)                               */
/* ------------------------------------------------------------------ */
const EntryCard = ({ entry }: { entry: Entry }) => (
    <div className="card p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
            <h3 className="text-xl font-bold sm:text-2xl">{entry.title}</h3>
            <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>{entry.period}</span>
        </div>
        <p className="mt-1 font-medium" style={{ color: 'var(--accent)' }}>
            {entry.org}{entry.location ? ` · ${entry.location}` : ''}
        </p>
        <ul className="mt-5 flex flex-col gap-3">
            {entry.points.map((p, i) => (
                <li key={i} className="flex items-start gap-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    <span className="bullet-dot" />
                    <span>{p}</span>
                </li>
            ))}
        </ul>
    </div>
);

/* ------------------------------------------------------------------ */
/*  APP                                                                */
/* ------------------------------------------------------------------ */
const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        setIsDarkMode((stored ?? 'dark') === 'dark');
    }, []);

    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode);
        document.body.classList.toggle('light', !isDarkMode);
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode((v) => !v);

    const navItems = [
        { label: 'About', href: '#about' },
        { label: 'Skills', href: '#skills' },
        { label: 'Experience', href: '#experience' },
        { label: 'Leadership', href: '#leadership' },
        { label: 'Projects', href: '#projects' },
        { label: 'Education', href: '#education' },
    ];

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden">
            {/* animated background */}
            <div className="bg-layer">
                <div className="bg-grid" />
                <div className="bg-orb one" />
                <div className="bg-orb two" />
            </div>

            {/* ============ NAV ============ */}
            <nav className="sticky top-0 z-50 backdrop-blur-md"
                 style={{ background: 'color-mix(in srgb, var(--bg) 72%, transparent)', borderBottom: '1px solid var(--border)' }}>
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
                    <a href="#about" className="font-display text-lg font-bold tracking-tight">
                        Anand<span style={{ color: 'var(--accent)' }}>.</span>Pagnis
                    </a>

                    <div className="hidden items-center gap-6 md:flex">
                        {navItems.map((n) => (
                            <a key={n.href} href={n.href} className="nav-link">{n.label}</a>
                        ))}
                        <div className="theme-switch-wrapper">
                            <Sun className="h-4 w-4" />
                            <label className="theme-switch">
                                <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} aria-label="Toggle theme" />
                                <span className="slider" />
                            </label>
                            <Moon className="h-4 w-4" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:hidden">
                        <label className="theme-switch">
                            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} aria-label="Toggle theme" />
                            <span className="slider" />
                        </label>
                        <button onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" style={{ color: 'var(--text)' }}>
                            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="md:hidden" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
                        <div className="flex flex-col px-5 py-3">
                            {navItems.map((n) => (
                                <a key={n.href} href={n.href} onClick={() => setMenuOpen(false)} className="nav-link py-3">{n.label}</a>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            <main className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">

                {/* ============ HERO / ABOUT ============ */}
                <section id="about" className="flex min-h-[78vh] flex-col justify-center py-20">
                    <Reveal><p className="section-label mb-5">Software Engineer · Fintech</p></Reveal>
                    <Reveal delay={80}>
                        <h1 className="font-display text-5xl font-extrabold sm:text-6xl md:text-7xl lg:text-8xl">
                            Anand Pagnis
                        </h1>
                    </Reveal>
                    <Reveal delay={160}>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: 'var(--text-muted)' }}>
                            Computer Science student at <span style={{ color: 'var(--text)' }}>Worcester Polytechnic Institute</span> (B.S.,
                            May 2026). I build full-stack platforms and AI/ML systems — from RAG retrieval pipelines to real-time
                            simulators — with a strong interest in finance and financial technology.
                        </p>
                    </Reveal>
                    <Reveal delay={240}>
                        <div className="mt-9 flex flex-wrap items-center gap-3">
                            <a href="#projects" className="btn-primary">View Projects <ArrowUpRight className="h-4 w-4" /></a>
                            <a href={LINKS.resume} target="_blank" rel="noreferrer" className="btn-ghost"><FileText className="h-4 w-4" /> Resume</a>
                            <a href={LINKS.github} target="_blank" rel="noreferrer" className="btn-ghost"><Github className="h-4 w-4" /> GitHub</a>
                            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="btn-ghost"><Linkedin className="h-4 w-4" /> LinkedIn</a>
                            <a href={`mailto:${LINKS.email}`} className="btn-ghost"><Mail className="h-4 w-4" /> Email</a>
                        </div>
                    </Reveal>
                </section>

                {/* ============ SKILLS ============ */}
                <section id="skills" className="scroll-mt-24 py-20">
                    <Reveal>
                        <p className="section-label mb-3">01 — Toolbox</p>
                        <h2 className="mb-10 text-3xl font-bold sm:text-4xl md:text-5xl">Skills &amp; Technologies</h2>
                    </Reveal>
                    <div className="flex flex-col gap-8">
                        {skillGroups.map((group, gi) => (
                            <Reveal key={group.label} delay={gi * 60}>
                                <div>
                                    <p className="mb-3 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>{group.label}</p>
                                    <div className="flex flex-wrap gap-3">
                                        {group.items.map((item) => (
                                            <span key={item} className="tech-pill">
                                                {ICONS[item] && <img src={ICONS[item]} alt="" />}
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ============ EXPERIENCE ============ */}
                <section id="experience" className="scroll-mt-24 py-20">
                    <Reveal>
                        <p className="section-label mb-3">02 — Where I've Worked</p>
                        <h2 className="mb-10 text-3xl font-bold sm:text-4xl md:text-5xl">Experience</h2>
                    </Reveal>
                    <div className="flex flex-col gap-5">
                        {experience.map((e, i) => (
                            <Reveal key={i} delay={i * 60}><EntryCard entry={e} /></Reveal>
                        ))}
                    </div>
                </section>

                {/* ============ LEADERSHIP ============ */}
                <section id="leadership" className="scroll-mt-24 py-20">
                    <Reveal>
                        <p className="section-label mb-3">03 — Beyond the Code</p>
                        <h2 className="mb-10 text-3xl font-bold sm:text-4xl md:text-5xl">Leadership</h2>
                    </Reveal>
                    <div className="flex flex-col gap-5">
                        {leadership.map((e, i) => (
                            <Reveal key={i} delay={i * 60}><EntryCard entry={e} /></Reveal>
                        ))}
                    </div>
                </section>

                {/* ============ PROJECTS ============ */}
                <section id="projects" className="scroll-mt-24 py-20">
                    <Reveal>
                        <p className="section-label mb-3">04 — Selected Work</p>
                        <h2 className="mb-12 text-3xl font-bold sm:text-4xl md:text-5xl">Projects</h2>
                    </Reveal>
                    <div className="flex flex-col gap-16 sm:gap-24">
                        {projects.map((project, idx) => (
                            <Reveal key={project.id}>
                                <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                                    <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                                        <a href={project.repo} target="_blank" rel="noreferrer" className="media-link" aria-label={`${project.title} on GitHub`}>
                                            <Media media={project.media} alt={project.title} />
                                        </a>
                                    </div>
                                    <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                                        {project.tag && (
                                            <span className="tech-pill mb-4" style={{ color: 'var(--accent)' }}>{project.tag}</span>
                                        )}
                                        <h3 className="text-2xl font-bold sm:text-3xl">
                                            <a href={project.repo} target="_blank" rel="noreferrer" className="project-title-link">
                                                {project.title}
                                            </a>
                                        </h3>
                                        <p className="mt-1 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
                                            {project.role ? `${project.role} · ` : ''}{project.period}
                                            {project.location ? ` · ${project.location}` : ''}
                                        </p>
                                        <ul className="mt-5 flex flex-col gap-3">
                                            {project.points.map((point, i) => (
                                                <li key={i} className="flex items-start gap-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                                    <span className="bullet-dot" />
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-6 flex flex-wrap gap-2.5">
                                            {project.tech.map((t) => (
                                                <span key={t} className="tech-pill">
                                                    {ICONS[t] && <img src={ICONS[t]} alt="" />}
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-6">
                                            <a href={project.repo} target="_blank" rel="noreferrer" className="btn-ghost">
                                                <Github className="h-4 w-4" /> View Repository <ArrowUpRight className="h-4 w-4" />
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ============ EDUCATION ============ */}
                <section id="education" className="scroll-mt-24 py-20">
                    <Reveal>
                        <p className="section-label mb-3">05 — Background</p>
                        <h2 className="mb-10 text-3xl font-bold sm:text-4xl md:text-5xl">Education</h2>
                    </Reveal>
                    <Reveal delay={60}>
                        <div className="card p-6 sm:p-8">
                            <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                                <h3 className="text-xl font-bold sm:text-2xl">Worcester Polytechnic Institute</h3>
                                <span className="font-mono text-sm" style={{ color: 'var(--text-muted)' }}>May 2026</span>
                            </div>
                            <p className="mt-1 font-medium" style={{ color: 'var(--accent)' }}>Bachelor of Science in Computer Science</p>
                            <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                                <MapPin className="h-3.5 w-3.5" /> Worcester, MA
                            </p>
                        </div>
                    </Reveal>
                </section>

                {/* ============ FOOTER ============ */}
                <footer className="border-t py-12 text-center" style={{ borderColor: 'var(--border)' }}>
                    <p className="mb-6 text-lg" style={{ color: 'var(--text-muted)' }}>Let's build something.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <a href={`mailto:${LINKS.email}`} className="btn-ghost"><Mail className="h-4 w-4" /> Email</a>
                        <a href={LINKS.github} target="_blank" rel="noreferrer" className="btn-ghost"><Github className="h-4 w-4" /> GitHub</a>
                        <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="btn-ghost"><Linkedin className="h-4 w-4" /> LinkedIn</a>
                        <a href={LINKS.resume} target="_blank" rel="noreferrer" className="btn-ghost"><FileText className="h-4 w-4" /> Resume</a>
                    </div>
                    <p className="mt-8 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                        © {new Date().getFullYear()} Anand Pagnis · {LINKS.email}
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default App;