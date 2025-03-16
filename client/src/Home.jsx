import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Home.css';
import axios from 'axios';
import googleimg from './assets/google.png';

function Home() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('hero');
    const [showBackToTop, setShowBackToTop] = useState(false);
    
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        console.log("Form submitted");  // Check if this shows up
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        else if (!username || !email || !password || !confirmPassword) {
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

            if (window.scrollY > 500) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="landing-container">
            <nav className="sticky-nav">
                <div className="nav-content">
                    <div className="nav-left">
                        <h1 className="nav-title">NovaMyst</h1>
                    </div>
                    <div className="nav-right">
                        <ul className="nav-links">
                            <li>
                                <button
                                    className={activeSection === 'why-choose' ? 'active' : ''}
                                    onClick={() => scrollToSection('why-choose')}
                                >
                                    Why Choose Us
                                </button>
                            </li>
                            <li>
                                <button
                                    className={activeSection === 'features' ? 'active' : ''}
                                    onClick={() => scrollToSection('features')}
                                >
                                    Features
                                </button>
                            </li>
                            <li>
                                <button
                                    className={activeSection === 'how-it-works' ? 'active' : ''}
                                    onClick={() => scrollToSection('how-it-works')}
                                >
                                    How It Works
                                </button>
                            </li>
                        </ul>
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
                            <div className="form-group">
                                <label>Username</label>
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)} 
                                    className="form-input" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} 
                                    className="form-input" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input 
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)} 
                                    className="form-input" 
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input 
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    className="form-input" 
                                />
                            </div>
                            <button type="submit" className="submit-button">Sign Up</button>
                            <div className="or-divider">OR</div>
                            <button type="button" className="google-signup-button">
                                <img src= {googleimg}  className="google-logo" />
                                Sign up with Google
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <section id="why-choose" className="why-choose-section">
                <h2>Why Choose NovaMyst?</h2>
                <div className="why-choose-grid">
                    <div className="why-choose-box">
                        <h3>🌟 Turn Tasks into Adventures</h3>
                        <p>Transform your daily responsibilities into epic quests with rewards and achievements.</p>
                    </div>
                    <div className="why-choose-box">
                        <h3>🚀 Stay Motivated</h3>
                        <p>Level up your character and earn rewards as you complete tasks and build productive habits.</p>
                    </div>
                    <div className="why-choose-box">
                        <h3>🎉 Make Productivity Fun</h3>
                        <p>Enjoy completing tasks with our gamified system that makes every achievement feel rewarding.</p>
                    </div>
                </div>
            </section>

            <section id="features" className="powerful-features-section">
                <h2>Features</h2>
                <div className="powerful-features-grid">
                    <div className="powerful-feature-box">
                        <h3>📊 Experience Points & Leveling</h3>
                        <p>Earn XP for completing tasks and watch your character grow stronger.</p>
                    </div>
                    <div className="powerful-feature-box">
                        <h3>💰 Virtual Currency & Rewards</h3>
                        <p>Collect coins to unlock character customizations and special items.</p>
                    </div>
                    <div className="powerful-feature-box">
                        <h3>⏲️ Task Timer & Tracking</h3>
                        <p>Track your productivity with built-in timers and progress monitoring.</p>
                    </div>
                    <div className="powerful-feature-box">
                        <h3>🏅 Achievement System</h3>
                        <p>Complete challenges and unlock badges to showcase your accomplishments.</p>
                    </div>
                    <div className="powerful-feature-box">
                        <h3>👥 Social Features</h3>
                        <p>Compete with friends and join a community of productive achievers.</p>
                    </div>
                    <div className="powerful-feature-box">
                        <h3>🎁 Daily Rewards</h3>
                        <p>Log in daily to receive bonus rewards and maintain your streak.</p>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="how-it-works-section">
                <h2>How It Works</h2>
                <div className="steps-grid">
                    <div className="step">
                        <div className="step-circle">1</div>
                        <div className="step-text">
                            <h3>Create Tasks</h3>
                            <p>Set up your tasks and organize them by priority.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-circle">2</div>
                        <div className="step-text">
                            <h3>Track Progress</h3>
                            <p>Use the timer to focus and complete your tasks.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-circle">3</div>
                        <div className="step-text">
                            <h3>Earn Rewards</h3>
                            <p>Complete tasks to gain XP and unlock achievements.</p>
                        </div>
                    </div>
                    <div className="step">
                        <div className="step-circle">4</div>
                        <div className="step-text">
                            <h3>Customize Character</h3>
                            <p>Use rewards earned from completing tasks to customize your character.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="ready" className="ready-section">
                <h2>Ready to Level Up Your Productivity?</h2>
                <p>Join NovaMyst today and transform your task management experience.</p>
                <button className="cta-button" onClick={() => navigate('/signup')}>
                    Get Started
                </button>
            </section>

            <footer className="footer-section">
                <div className="footer-content">
                    <div className="footer-column">
                        <h3>About Us</h3>
                        <p>Placeholder for about us content.</p>
                    </div>
                    <div className="footer-column">
                        <h3>Quick Links</h3>
                        <ul>
                            <li>Placeholder Link 1</li>
                            <li>Placeholder Link 2</li>
                            <li>Placeholder Link 3</li>
                        </ul>
                    </div>
                    <div className="footer-column">
                        <h3>Contact Us</h3>
                        <p>Placeholder for contact information.</p>
                    </div>
                </div>
            </footer>

            {showBackToTop && (
                <button className="back-to-top" onClick={scrollToTop}>
                    ↑
                </button>
            )}
        </div>
    );
}

export default Home;