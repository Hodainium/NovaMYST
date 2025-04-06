import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import googleimg from './assets/google.png';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
//import { getAuth, sendPasswordResetEmail } from "firebase/auth";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [open, setOpen] = useState(false);
    // const [forgotemail, setforgotemail] = useState('');

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

    // const handleConfirmEmail = async (e) => {
    //     e.preventDefault();

    //     try {
    //         const UserEmail = getAuth();
    //         sendPasswordResetEmail(UserEmail, forgotemail);

    //         console.log("Password reset email sent");
    //     } catch (error)
    //     {
    //         console.error("Firebase Email Error:", error.message);
    //         alert("Email not found: " + error.message);
    //     }
    // }

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const Modal = ({isOpen, onClose, children }) => {
        if (!isOpen) return null;

        return (
            <div onClick = {onClose}
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
                        background: "white",
                        margin: "auto",
                        padding: "20px",
                        border: "3px solid",
                        width: "30%",
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
                            <button type="button" className="forgot-button" onClick={handleOpen}>Forgot Password</button>

                            <Modal isOpen={open} /*onSubmit={handleConfirmEmail}*/> 
                                <span className="close" onClick={handleClose}>&times;</span>
                                    <h1 className="forgotText">Forgot Password?</h1>
                                    <h5 className="forgotemailHeader">Email Address</h5>

                                    <input 
                                    type="email" 
                                    value={forgotemail} 
                                    onChange={(e) => setforgotemail(e.target.value)} 
                                    placeholder = "Enter your email"
                                    className="forgotemail-input"/>

                                    <button type="submit" className="submitEmail">Send Email</button>

                                    {/*A condition that before the send email button --> If there exists an email, then send an email
                                        If there isn't, then a message saying "Please enter an existing email" will appear*/}
                            </Modal>

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