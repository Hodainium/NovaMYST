import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* Header Section */}
            <header className="header">
                <div className="header-content">
                    <h1 className="header-title">NovaMyst</h1>
                    <button className="login-button" onClick={() => navigate('/login')}>
                        Login
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <div className="hero-section">
                <h1>Welcome to NovaMyst</h1>
                <p className="hero-text">
                    Transform your daily tasks into epic quests. Complete tasks, gain XP, unlock achievements, and level up your productivity!
                </p>
            </div>

            {/* Why Choose NovaMyst Section */}
            <div className="why-choose-section">
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
            </div>

            {/* Powerful Features Section */}
            <div className="powerful-features-section">
                <h2>What We Offer</h2>
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
            </div>

            {/* How It Works Section */}
            <div className="how-it-works-section">
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
                            <p>Use rewards earned from completing tasks to customize chracter.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ready to Level Up Section */}
            <div className="ready-section">
                <h2>Ready to Level Up Your Productivity?</h2>
                <p>Join NovaMyst today and transform your task management experience.</p>
                <button className="cta-button" onClick={() => navigate('/login')}>
                    Get Started
                </button>
            </div>

            {/* Footer Section */}
            <div className="footer-section">
                <div className="footer-bottom">
                    <p>© 2025 NovaMyst. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

export default Home;