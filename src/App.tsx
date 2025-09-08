import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import './App.css';
import projdemon from './assets/projdemo.mp4';
import portvis from './assets/portvis.svg';
import fullstackapp from './assets/fullstackapp.png';
import softengvisual from './assets/softengvisual.png';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import cssicon from './assets/css.svg';
import dockericon from './assets/docker.svg';
import githubicon from './assets/github.svg';
import htmlicon from './assets/html.svg';
import mysqlicon from './assets/mysql.svg';
import pythonicon from './assets/python.svg';
import typescripticon from './assets/typescript.svg';
import bashicon from './assets/bashicon.svg';
import raspicon from './assets/raspi.svg';
import linuxicon from './assets/linuxicon.svg';




const App = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Check local storage for theme preference
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            document.body.classList.add(storedTheme);
            setIsDarkMode(storedTheme === 'dark');
        } else {
            // Default to dark mode
            document.body.classList.add('dark');
            setIsDarkMode(true);
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('dark');
            document.body.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.add('light');
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const projects = [
        {
            id: 1,
            type: 'video',
            src: projdemon,
            title: 'Developing a Scalable Offline Server for Rural Schools in Panama',
            description: 'Collaborated with Fundesteam to develop a server which fit the constraints(low power, low cost, user friendly, offline, portable) of rural areas in latin America. Conducted Interviews and focus groups to gather data for the constraints.\nReduced video loading times by 85% (From 7 minutes to 55 seconds) and increased server capacity, supporting multiple users without latency.\nImplemented a plug-and-play system for seamless course uploads.\nAuthored a handbook for easy replicability of the server which serves as a proof of concept for further expansion of this project in panama in association with MEDUCA. Nominated for IQP Presendential Award',
            techstack: [dockericon, raspicon,linuxicon,bashicon]
        },
        {
            id: 2,
            type: 'image',
            src: fullstackapp,
            title: 'Full Stack Social Network',
            description: 'Built a CRUD application for a blog format social network.\nUtilized typescript for the frontend and MySQL for the backend database to store user uploaded posts.\nIntegrated Axios for seamless communication between the client and server, enabling real-time data updates.\nDeveloped RESTful APIs using Express.js to handle user posts, comments, and interactions efficiently.\nImplemented CORS to ensure secure and consistent data access across different web pages.\nEnsured secure user authentication and simplified account management through Auth0 integration',
            techstack: [typescripticon,htmlicon,mysqlicon,cssicon,githubicon]
        },
        {
            id: 3,
            type: 'image',
            src: portvis,
            title: 'Automated Trading Bot with a GUI',
            description: 'Built a fully functional automatic trading bot using python. Utilized pyautogui to automate trade execution and Pandas for data analysis. Additionally incorporated streamlit to visualize said analysis and trade execution',
            techstack: [pythonicon]

        },
        {
            id: 4,
            type: 'image',
            src: softengvisual,
            title: 'Hospital Application - CS3733(Software Engineering)',
            description: 'Built an app to help users navigate the hospital, request services, and allow admins to manage schedules and analyze service data.\nRole: Project Manager/Frontend Engineer, used Agile methodologies with tools like Jira, UML, and ERD diagrams.\nTechnologies used:  AWS EC2, React, TypeScript, Docker, Postgres and Prisma ORM.',
            techstack: [typescripticon,htmlicon,mysqlicon,cssicon,githubicon]

        }
    ];

    const ProjectDescription = ({ description }: { description: string }) => {
        const bulletPoints = description
            .split('\n')
            .filter(line => line.trim() !== '');


        return (
            <div className="max-h-[32rem] pr-4">
                <ul className="space-y-4">
                    {bulletPoints.map((point, index) => (
                        <li
                            key={index}
                            className="flex items-start gap-3 text-lg leading-relaxed"
                        >
                        <span
                            className={`flex-shrink-0 w-2 h-2 mt-2.5 rounded-full ${
                                isDarkMode
                                    ? 'gradient-bullet-dark'
                                    : 'gradient-bullet-light'
                            }`}
                        />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };


    return (
        <div className="w-screen">
            <div id="main" className="relative w-screen min-h-screen">
                <div className="">
                    <article id="lights">
                        <section id="one">
                            <section id="two">
                                <section id="three">
                                    <section id="four">
                                        <section id="five">
                                        </section>
                                    </section>
                                </section>
                            </section>
                        </section>
                    </article>
                </div>
                <div className="relative z-10">
                    <nav className="sticky top-0 z-50 backdrop-blur-sm">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex items-center justify-between h-16 px-3">
                                <h1 className="text-2xl font-bold"></h1>
                                <div className="flex items-center space-x-8">
                                    <a href="https://github.com/anandpagnis" className="">Github</a>
                                    <a href="#projects" className="">Projects</a>
                                    <a href="https://www.linkedin.com/in/anand-pagnis-96927a24a"
                                       className="">Linkedin</a>
                                    <a href="https://docs.google.com/document/d/1cQ7TXyehbwAqCqQ_8s5QWlUTDT1aaQpPdCF5LUee03w/edit?usp=sharing" className="">Resume</a>
                                    <div className="theme-switch-wrapper">
                                        <Sun className="theme-icon h-4 w-4"/>
                                        <label className="theme-switch">
                                            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme}/>
                                            <span className="slider"></span>
                                        </label>
                                        <Moon className="theme-icon h-4 w-4"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <section id="about" className="mt-24">
                        <div className="max-w-4xl mx-auto p-6 text-center rounded-lg">
                            <h1 className="text-5xl font-bold text-center">Anand Pagnis</h1>
                            <br/>
                            <div className="grid grid-rows-2 gap-4">
                                <div className="text-lg text-center">
                                    I am a Junior at Worcester Polytechnic Institute, currently pursuing a Bachelor's degree in Computer Science with a minor in Fintech.
                                    I have a strong interest in finance and high-frequency trading.
                                </div>
                                <div className="text-lg text-center">
                                    I'm a detail-oriented and project-driven person who loves tackling complex problems
                                    and finding practical solutions. I focus on delivering results that make a
                                    difference, ensuring that each project I work on is efficient and impactful.
                                </div>
                            </div>
                        </div>
                    </section>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                </div>
            </div>
            <section id="projects" className="min-h-screen mt-24">
                <div className="w-screen">
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <h1 className="text-5xl font-bold text-center ">PROJECTS</h1>
                    <br/>
                    <br/>
                </div>
                <div className="w-screen flex overflow-x-scroll snap-x snap-mandatory gap-0 no-scrollbar">
                    {projects.map((project) => (
                        <div key={project.id} className="flex-shrink-0 w-screen flex items-center snap-center flex-row">
                            <div className="w-full max-w-3xl rounded-lg p-8 ">
                                <h2 className="text-4xl font-bold mb-6">{project.title}</h2>
                                <div className="image-container rounded-lg">
                                    {project.type === 'video' ? (
                                        <video className="w-full rounded-lg shadow-lg image" src={project.src}
                                               controls loop
                                               autoPlay muted></video>
                                    ) : (
                                        <img src={project.src} alt={project.title}
                                             className="w-full rounded-lg shadow-lg image"/>
                                    )}
                                    <div className="logos flex flex-wrap gap-5">
                                        {project.techstack.map((icon, index) => (
                                            <img
                                                key={index}
                                                src={icon}
                                                alt={`Tech Stack ${index}`}
                                                className="h-12 w-12"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-3/5 rounded-lg p-6 bg-opacity-10 backdrop-blur-sm ">
                                <ProjectDescription description={project.description}/>
                            </div>
                            {project.id !== 4 && (
                                <div className="px-10  scroll-indicator">
                                    <KeyboardDoubleArrowRightIcon fontSize="large"/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default App;
