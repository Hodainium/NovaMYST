import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Import the new CSS file

function Login() {
    const [isRegister, setIsRegister] = useState(true);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isRegister) {
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
    };

    return (
        <div className="login-page">
            {/* Header Section */}
            <header className="login-header">
                <div className="header-content">
                    <h1 className="header-title">NovaMyst</h1>
                    <Link to="/" className="home-link">
                        Home
                    </Link>
                </div>
            </header>

            {/* Login/Register Form */}
            <div className="login-container">
                <div className="form-container">
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
    );
}

export default Login;