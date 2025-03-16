import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';
import googleimg from './assets/google.png';

function Signup() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit1 = async (e) => {
        e.preventDefault();
        alert("Form submitted");
        console.log("Form submitted");  // Check if this shows up
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
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
    };

    return (
        <div className="signup-page">
            <header className="signup-header">
                <div className="header-content">
                    <h1 className="header-title">NovaMyst</h1>
                    <Link to="/" className="home-link">
                        Home
                    </Link>
                </div>
            </header>

            <div className="signup-container">
                <div className="form-container">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSubmit1}>
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
        </div>
    );
}

export default Signup;