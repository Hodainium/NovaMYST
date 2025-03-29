import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import googleimg from './assets/google.png';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isDevMode = false; // Set to true to skip login, false to enable login check

    const handleGoogleLogin = async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          const token = await user.getIdToken();
      
          console.log("Google user:", user);
      
          // Send token to backend to create/check user in Firestore
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

            // Optional: Send token to backend to fetch user-specific tasks
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
                        <button type="button" className="google-login-button" onClick={handleGoogleLogin}>
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