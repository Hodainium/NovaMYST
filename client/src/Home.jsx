import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import './Home.css';
import googleimg from './assets/google.png';
import { DarkModeContext } from './DarkMode';
import axios from 'axios';

function Home() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('hero');
    const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (!username || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }
        try {
            await axios.post('http://localhost:3000/tasks/register', {
                name: username,
                email,
                password
            });
            navigate('/dashboard');
        } catch (err) {
            console.log(err);
        }
    };

    const scrollToSection = (id) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'why-choose', 'features', 'how-it-works', 'ready'];
            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && window.scrollY >= element.offsetTop - 100) {
                    setActiveSection(section);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const renderInput = (label, type, value, onChange) => (
        <div className="form-group">
            <label>{label}</label>
            <input type={type} value={value} onChange={onChange} className="form-input" />
        </div>
    );

    return (
        <div className={`landing-container ${darkMode ? 'dark-mode' : ''}`}>
            <nav className="sticky-nav">
                <div className="nav-content">
                    <div className="nav-left">
                        <h1 className="nav-title">NovaMyst</h1>
                    </div>
                    <div className="nav-right">
                        <ul className="nav-links">
                            {['why-choose', 'features', 'how-it-works'].map(section => (
                                <li key={section}>
                                    <button
                                        className={activeSection === section ? 'active' : ''}
                                        onClick={() => scrollToSection(section)}
                                    >
                                        {section.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <label className="dark-mode-toggle">
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={toggleDarkMode}
                            />
                            <span className="slider"></span>
                        </label>
                        <button className="login-button" onClick={() => navigate('/login')}>
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            <section id="hero" className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1>Welcome to NovaMyst</h1>
                        <p>
                            Transform your daily tasks into epic quests. Complete tasks, gain XP, unlock achievements, and level up your productivity!
                        </p>
                    </div>
                    <div className="register-form">
                        <h2>Sign Up</h2>
                        <form onSubmit={handleRegister}>
                            {renderInput("Username", "text", username, (e) => setUsername(e.target.value))}
                            {renderInput("Email", "email", email, (e) => setEmail(e.target.value))}
                            {renderInput("Password", "password", password, (e) => setPassword(e.target.value))}
                            {renderInput("Confirm Password", "password", confirmPassword, (e) => setConfirmPassword(e.target.value))}
                            <button type="submit" className="submit-button">Sign Up</button>
                            <div className="or-divider">OR</div>
                            <button type="button" className="google-signup-button">
                                <img src={googleimg} className="google-logo" />
                                Sign up with Google
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section id="why-choose" className="why-choose-section">
                <h2>Why Choose NovaMyst?</h2>
                <div className="why-choose-grid">
                    {[
                        ["🌟 Turn Tasks into Adventures", "Transform your daily responsibilities into epic quests with rewards and achievements."],
                        ["🚀 Stay Motivated", "Level up your character and earn rewards as you complete tasks and build productive habits."],
                        ["🎉 Make Productivity Fun", "Enjoy completing tasks with our gamified system that makes every achievement feel rewarding."]
                    ].map(([title, desc], i) => (
                        <div key={i} className="why-choose-box">
                            <h3>{title}</h3>
                            <p>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="features" className="powerful-features-section">
                <h2>Features</h2>
                <div className="powerful-features-grid">
                    {[
                        ["📊 Experience Points & Leveling", "Earn XP for completing tasks and watch your character grow stronger."],
                        ["💰 Virtual Currency & Rewards", "Collect coins to unlock character customizations and special items."],
                        ["⏲️ Task Timer & Tracking", "Track your productivity with built-in timers and progress monitoring."],
                        ["🏅 Achievement System", "Complete challenges and unlock badges to showcase your accomplishments."],
                        ["👥 Social Features", "Compete with friends and join a community of productive achievers."],
                        ["🎁 Daily Rewards", "Log in daily to receive bonus rewards and maintain your streak."]
                    ].map(([title, desc], i) => (
                        <div key={i} className="powerful-feature-box">
                            <h3>{title}</h3>
                            <p>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section id="how-it-works" className="how-it-works-section">
                <h2>How It Works</h2>
                <div className="steps-grid">
                    {[
                        ["1", "Create Tasks", "Set up your tasks and organize them by priority."],
                        ["2", "Track Progress", "Use the timer to focus and complete your tasks."],
                        ["3", "Earn Rewards", "Complete tasks to gain XP and unlock achievements."],
                        ["4", "Customize Character", "Use rewards earned from completing tasks to customize your character."]
                    ].map(([num, title, desc], i) => (
                        <div key={i} className="step">
                            <div className="step-circle">{num}</div>
                            <div className="step-text">
                                <h3>{title}</h3>
                                <p>{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section id="ready" className="ready-section">
                <h2>Ready to Level Up Your Productivity?</h2>
                <p>Join NovaMyst today and transform your task management experience.</p>
                <button className="cta-button" onClick={scrollToTop}>
                    Get Started
                </button>
            </section>

            <footer className="footer-section">
                <div className="footer-content">
                    {[
                        ["About Us", "Placeholder for about us content."],
                        ["Quick Links", <ul><li>Placeholder Link 1</li><li>Placeholder Link 2</li><li>Placeholder Link 3</li></ul>],
                        ["Contact Us", "Placeholder for contact information."]
                    ].map(([title, content], i) => (
                        <div key={i} className="footer-column">
                            <h3>{title}</h3>
                            <p>{content}</p>
                        </div>
                    ))}
                </div>
            </footer>
        </div>
    );
}

export default Home;
