import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
    const [isRegister, setIsRegister] = useState(true); // Changed to isRegister and default to true
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isRegister) { // Updated condition
            navigate('/dashboard');
        } else {
            try {
                await axios.post('', {
                    name: username,
                    email,
                    password
                });
                navigate('/dashboard');
            } catch (err) {
                console.log(err);
            }
        }
    }

    return (
        <div className="landing-container">
            <div className="landing-content">
                {/* Info section moved to the left */}
                <div className="info-section">
                    <h2>Welcome to NovaMyst</h2>
                    <p className="hero-text">Transform your daily tasks into epic quests. Complete tasks, gain XP, unlock achievements, and level up your productivity!</p>
                    
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>🏆 Earn XP & Level Up</h3>
                            <p>Complete tasks to gain experience and progress through levels</p>
                        </div>
                        <div className="feature-card">
                            <h3>💎 Unlock Rewards</h3>
                            <p>Earn coins and unlock special rewards as you progress</p>
                        </div>
                        <div className="feature-card">
                            <h3>📈 Track Progress</h3>
                            <p>Monitor your productivity journey with detailed statistics</p>
                        </div>
                        <div className="feature-card">
                            <h3>🏅 Earn Achievements</h3>
                            <p>Complete challenges and showcase your accomplishments</p>
                        </div>
                    </div>
                </div>

                {/* Auth section moved to the right */}
                <div className="auth-section">
                    <div className="form-container">
                        <div className="logo-section">
                        </div>

                        <div className="auth-toggle">
                            <button 
                                className={`toggle-btn ${isRegister ? 'active' : ''}`}
                                onClick={() => setIsRegister(true)}
                            >
                                Register
                            </button>
                            <button 
                                className={`toggle-btn ${!isRegister ? 'active' : ''}`}
                                onClick={() => setIsRegister(false)}
                            >
                                Login
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {isRegister && (
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                            )}
                            
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

                            <button type="submit" className="submit-button">
                                {isRegister ? 'Create Account' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;