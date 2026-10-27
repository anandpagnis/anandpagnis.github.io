/* Everything the page says. Facts come only from Anand's master CV. */
import adarc from './assets/adarc-ui.png';
import secdash from './assets/secdash.png';
import lilim from './assets/lilim.png';
import hospital from './assets/softengvisual.png';
import trading from './assets/portvis.svg';
import offline from './assets/projdemo-web.mp4';

export type Media = { kind: 'image' | 'video'; src: string; w: number; h: number };
export type Project = {
    title: string;
    /** how the title breaks: odd lines solid, even lines outlined */
    lines: string[];
    tag: string;
    role?: string;
    period: string;
    url: string;
    media: Media;
    summary: string;
    tech: string[];
};
export type Role = {
    when: string;
    role: string;
    org: string;
    where: string;
    summary?: string;
    points: string[];
    tech?: string[];
};

export const NAME = 'Anand Pagnis';
export const EMAIL = 'anandpagnis101@gmail.com';
export const LINKS: [string, string][] = [
    ['Résumé', '/AnandPagnis_Resume.pdf'],
    ['GitHub', 'https://github.com/anandpagnis'],
    ['LinkedIn', 'https://www.linkedin.com/in/anand-pagnis-96927a24a'],
];

export const PROJECTS: Project[] = [
    {
        title: 'ADArC', lines: ['ADArC'], tag: 'Simulation · EDA', period: 'Aug 2025 – May 2026',
        url: 'https://www.adarc.app', media: { kind: 'image', src: adarc, w: 1784, h: 940 },
        summary: 'An automated design tool for Arduino circuits. Added 25+ components to its simulator, with I²C, SPI, UART, RS485, analog and digital sensor and actuator simulation shown live in SVG. It generates Arduino code with dynamic pin mapping and keeps the interface, the simulation and the microcontroller in sync.',
        tech: ['C#', '.NET Core', 'Blazor', 'TypeScript', 'AVR8js', 'GraphSynth'],
    },
    {
        title: 'SEC 10-K Research Terminal', lines: ['SEC 10-K', 'Research Terminal'], tag: 'Fintech · RAG', period: 'May 2026',
        url: 'https://github.com/anandpagnis/sec-dashboard', media: { kind: 'image', src: secdash, w: 2878, h: 1624 },
        summary: 'A full-stack research platform for SEC 10-K filings. An ETL pipeline turns raw HTML into structured, citation-tracked sections, statements and metrics, served over type-safe REST APIs across 15+ data models. Hybrid retrieval (BM25, dense vectors, reciprocal rank fusion and reranking) cut top-3 match error by 40%. The Investing Association’s fund uses it to develop its reports.',
        tech: ['Python', 'FastAPI', 'React', 'TypeScript', 'BM25', 'Dense vectors'],
    },
    {
        title: 'Lilim', lines: ['Lilim'], tag: 'Audio · WebGL', role: 'Solo, in progress', period: '2026 – present',
        url: 'https://github.com/anandpagnis', media: { kind: 'image', src: lilim, w: 1800, h: 1016 },
        summary: 'A browser-based audio-visual performance engine. It analyzes a song’s beats, phrases, drops and mood in real time and drives GPU-raymarched shaders and particle systems to match. It runs as an OBS source, an installation or a live VJ tool.',
        tech: ['React', 'TypeScript', 'Three.js', 'GLSL', 'Web Audio API', 'Zustand'],
    },
    {
        title: 'Hospital Navigation Web App', lines: ['Hospital', 'Navigation Web App'], tag: 'Agile · Frontend',
        role: 'Project Manager & Frontend Developer', period: 'Jan – Apr 2024',
        url: 'https://github.com/anandpagnis', media: { kind: 'image', src: hospital, w: 1255, h: 979 },
        summary: 'A navigation and service app for Brigham and Women’s Hospital, built at WPI. Led the 9-person Agile team with Jira and code reviews, and deployed it on AWS EC2. The navigation chatbot runs a local Llama model, chosen after trying the Claude and OpenAI APIs.',
        tech: ['React', 'TypeScript', 'Docker', 'Prisma', 'PostgreSQL', 'AWS EC2'],
    },
    {
        title: 'Algorithmic Trading Engine', lines: ['Algorithmic', 'Trading Engine'], tag: 'Quant · Automation', period: '2024',
        url: 'https://github.com/anandpagnis/Trading-Engine', media: { kind: 'image', src: trading, w: 2879, h: 1719 },
        summary: 'A Python pairs-trading engine across S&P 500 stocks, with a Streamlit and Plotly dashboard and automated trade execution on Investopedia through PyAutoGUI and Tesseract OCR. It won a university-wide, three-month trading competition, outperforming the S&P 500 by 2.5% over the competition.',
        tech: ['Python', 'yfinance', 'Streamlit', 'Plotly', 'PyAutoGUI', 'Tesseract OCR'],
    },
    {
        title: 'Offline Education Server', lines: ['Offline', 'Education Server'], tag: 'Systems · Infra',
        role: 'Project Lead & System Administrator, Fundesteam', period: 'Aug – Oct 2024',
        url: 'https://github.com/anandpagnis', media: { kind: 'video', src: offline, w: 16, h: 9 },
        summary: 'A low-power, scalable offline learning server for rural Panama, built with the Ministry of Education. Profiling and optimization made video delivery 85% faster, and Bash ingestion pipelines and system tuning cut manual work and lowered CPU temperatures by 13%.',
        tech: ['Python', 'Docker', 'Linux', 'Bash'],
    },
];

export const WORK: Role[] = [
    {
        when: 'Apr – Jul 2026', role: 'Co-Founder', org: 'SquatchScout', where: 'Remote',
        summary: 'A two-sided marketplace for local services.',
        points: [
            'Built it full-stack in Next.js, React, TypeScript and Supabase, with three-tier role-based access control across middleware, server guards and database policies.',
            'Designed a 25-table PostgreSQL schema over 10 migrations for bookings, reviews, messaging, payments and availability, with distance-based search and a database guard against double bookings.',
            'Shipped real-time scheduling, a payment abstraction, live chat, and GitHub Actions CI that tests access control, checkout and sign-in on every pull request.',
            'Onboarded beta customers and gathered their feedback on the interface and features.',
        ],
        tech: ['Next.js', 'React', 'TypeScript', 'Supabase', 'PostgreSQL', 'GitHub Actions'],
    },
    {
        when: 'Dec 2025 – Apr 2026', role: 'Co-Founder', org: 'Second Brain', where: 'Remote',
        summary: 'A local-first knowledge-retrieval system.',
        points: [
            'A browser extension that captures articles, chunks them by meaning and embeds them as BGE vectors in PostgreSQL and pgvector.',
            'A 10-stage hybrid retrieval pipeline (BM25, pgvector search, intent classification, cross-encoder reranking and diversity filtering) that answers in under 500 ms on CPU.',
            'A concept-graph layer on Groq-powered Llama 3.1, chosen after trying the Claude and OpenAI APIs.',
            'A 9-table PostgreSQL schema on Railway with Docker, Supabase JWT authentication and an LRU query cache.',
        ],
        tech: ['PostgreSQL', 'pgvector', 'BM25', 'Docker', 'Railway', 'Supabase'],
    },
    {
        when: 'Sep – Nov 2025', role: 'Software Engineer, Frontend Developer', org: 'Buffeat', where: 'Remote',
        summary: 'Frontend for the core platform.',
        points: [
            'Built and tested component-based React and TypeScript interfaces and reusable component libraries on type-safe REST APIs, raising feature throughput by 20%.',
            'Defined FastAPI endpoints with the backend engineers across a microservices backend.',
            'Delivered sprint work in Agile and Scrum: planning, stand-ups, retrospectives and code reviews.',
        ],
        tech: ['React', 'TypeScript', 'REST APIs', 'FastAPI'],
    },
    {
        when: 'Aug – Oct 2024', role: 'Project Lead & System Administrator', org: 'Fundesteam', where: 'Panama City, Panama',
        summary: 'An offline learning server for rural Panama, with the Ministry of Education.',
        points: [
            'Made video delivery 85% faster through profiling and optimization with Python, Docker and Linux.',
            'Automated course ingestion with Bash pipelines and system tuning, cutting manual work and lowering CPU temperatures by 13%.',
        ],
        tech: ['Python', 'Docker', 'Linux', 'Bash'],
    },
];

export const LEADERSHIP: Role[] = [
    {
        when: 'Jan 2025 – Mar 2026', role: 'President', org: 'Investing Association', where: 'Worcester, MA',
        points: [
            'Led a 250+ member club on a $10,000 budget.',
            'Worked with the WPI Board of Trustees to launch a six-figure student-led investment fund.',
            'Hosted talks with industry professionals, ran events with other universities and attended conferences.',
            'Organized stock exchange visits where members met industry professionals and watched company IPOs.',
        ],
    },
    {
        when: 'Aug 2024 – May 2025', role: 'Activities Chair', org: 'Alpha Chi Rho', where: 'Worcester, MA',
        points: ['Led a 10-person committee planning professional and social events for 100+ students.'],
    },
];

export const EDUCATION: Role = {
    when: 'May 2026', role: 'B.S. Computer Science · Minor in Fintech', org: 'Worcester Polytechnic Institute', where: 'Worcester, MA',
    points: [],
};

export const SKILLS: [string, string[]][] = [
    ['Languages', ['Python', 'TypeScript', 'JavaScript', 'C#', 'C/C++', 'SQL', 'HTML', 'CSS', 'Bash']],
    ['Web & backend', ['React', 'Next.js', 'Node.js', 'FastAPI', '.NET Core', 'Blazor', 'Three.js', 'GLSL', 'Web Audio API', 'WebSockets', 'Zustand']],
    ['Data & AI', ['PostgreSQL', 'MySQL', 'Supabase', 'Prisma', 'pgvector', 'BM25', 'Dense vectors', 'Llama', 'pandas', 'Plotly', 'Streamlit']],
    ['Platforms', ['AWS EC2', 'Docker', 'Railway', 'Linux', 'Git', 'GitHub Actions', 'Jira', 'Agile & Scrum', 'TDD & BDD']],
];
