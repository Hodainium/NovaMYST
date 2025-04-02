import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import googleimg from './assets/google.png';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { DarkModeContext } from './DarkMode';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [open, setOpen] = useState(false);
    const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const token = await user.getIdToken();
        
            console.log("Google user:", user);
        
            await fetch("http://localhost:3000/tasks/register", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name: user.displayName })
            });
        
            navigate("/dashboard");
        } catch (err) {
            console.error("Google login failed:", err.message);
            alert("Google login failed: " + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCred.user.getIdToken();

            console.log("Firebase token from login:", token);

            await fetch("http://localhost:3000/tasks/list", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            navigate('/dashboard');
        } catch (error) {
            console.error("Firebase Login Error:", error.message);
            alert("Login failed: " + error.message);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const Modal = ({ isOpen, onClose, children }) => {
        if (!isOpen) return null;

        return (
            <div onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            > 
                <div
                    style={{
                        background: darkMode ? "#2a2a2a" : "white",
                        color: darkMode ? "#f5f5f5" : "#333333",
                        margin: "auto",
                        padding: "20px",
                        border: "3px solid",
                        width: "20%",
                        borderRadius: "10px",
                        borderColor: "#6c5dd3",
                    }}
                >
                    {children}
                </div>
            </div>
        );
    };

    return (
        <div className={`login-page ${darkMode ? 'dark-mode' : ''}`}>
            <header className="login-header">
                <div className="header-content">
                    <h1 className="header-title">NovaMyst</h1>
                    <div className="header-right">
                        <label className="dark-mode-toggle">
                            <input
                                type="checkbox"
                                checked={darkMode}
                                onChange={toggleDarkMode}
                            />
                            <span className="slider"></span>
                        </label>
                        <Link to="/" className="home-link">
                            Home
                        </Link>
                    </div>
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
                            <button type="button" className="forgot-button" onClick={handleOpen}>
                                Forgot Password
                            </button>

                            <Modal isOpen={open} onClose={handleClose}>
                                <span className="close" onClick={handleClose}>&times;</span>
                                <h1 className="forgotText">Forgot Password?</h1>
                                <h5 className="emailHeader">Email Address</h5>
                                <input type="text" className="email-input"/>
                                <button className="submitEmail" onClick={handleClose}>Send Email</button>
                            </Modal>
                        </div>
                        <button type="submit" className="submit-button">Login</button>
                        <div className="or-divider">OR</div>
                        <button type="button" className="google-login-button" onClick={handleGoogleLogin}>
                            <img src={googleimg} className="google-logo" />
                            Login with Google
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;