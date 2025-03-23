import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import googleimg from './assets/google.png';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isDevMode = true; // Set to true to skip login, false to enable login check

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isDevMode) {
            navigate('/dashboard');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/tasks/login', {
                email,
                password
            });

            if (response.status === 200) {
                navigate('/dashboard');
            }
        } catch (err) {
            console.log('Login failed:', err.response?.data?.message || err.message);
            alert('Login failed: ' + (err.response?.data?.message || 'Please try again.'));
        }
    };

    return (
        <div className="login-page">
            <header className="login-header">
                <div className="header-content">
                    <h1 className="header-title">NovaMyst</h1>
                    <Link to="/" className="home-link">
                        Home
                    </Link>
                </div>
            </header>

            <div className="login-container">
                <div className="form-container">
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
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
                        <button type="submit" className="submit-button">Login</button>
                        <div className="or-divider">OR</div>
                        <button type="button" className="google-login-button">
                            <img src= {googleimg}  className="google-logo" />
                            Login with Google
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;