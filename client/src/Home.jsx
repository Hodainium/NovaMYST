import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import './Home.css';
import googleimg from './assets/google.png';
import { DarkModeContext } from './DarkMode';
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth, googleProvider } from "./firebase";

function Home() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('hero');
    const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // const handleRegister = async (e) => {
    //     e.preventDefault();
    //     if (password !== confirmPassword) return alert("Passwords don't match!");
      
    //     let userCred;
    //     try {
    //       userCred = await createUserWithEmailAndPassword(auth, email, password);
    //       await updateProfile(userCred.user, { displayName: username });
          
    //       // Send verification email
    //       if (!userCred.user.emailVerified) {
    //         await sendEmailVerification(userCred.user);
    //         alert("A verification email has been sent. Please verify your email before logging in.");
    //         // Optionally sign user out until they verify
    //         await auth.signOut();
    //         return;
    //        }

    //         // Reload user to ensure emailVerified is up to date
    //         await userCred.user.reload();
    //         const refreshedUser = auth.currentUser;

    //         if (!refreshedUser.emailVerified) {
    //             alert("Please verify your email before continuing.");
    //             await auth.signOut();
    //             return;
    //         }
    
    //       const token = await refreshedUser.getIdToken();
        
    //       const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/register`, {
    //         method: "POST",
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //           "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ name: username }),
    //       });
      
    //       if (res.status === 409) {
    //         alert("That username is already taken. Please choose a different one.");
    //         // 🧹 Cleanup: delete Firebase user since registration failed
    //         await userCred.user.delete();
    //         return;
    //       }
      
    //       if (!res.ok) {
    //         const error = await res.json();
    //         throw new Error(error?.error || "Unknown registration error");
    //       }
      
    //       navigate("/login");
    //     } catch (error) {
    //       console.error("Registration Error:", error.message);
    //       if (userCred?.user) {
    //         try {
    //           await userCred.user.delete();
    //         } catch (cleanupError) {
    //           console.warn("Failed to delete Firebase user after failed registration:", cleanupError.message);
    //         }
    //       }
    //       alert("Registration failed: " + error.message);
    //     }
    //   };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return alert("Passwords don't match!");
      
        try {
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCred.user, { displayName: username });
      
          if (!userCred.user.emailVerified) {
            await sendEmailVerification(userCred.user);
            alert("A verification email has been sent. Please verify your email before logging in.");
          }
      
          await auth.signOut(); // force user to verify and re-login
        } catch (error) {
          console.error("Registration Error:", error.message);
          alert("Registration failed: " + error.message);
        }
      };
      
      
    const handleGoogleLogin = async () => {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const user = result.user;
          const token = await user.getIdToken();
      
          console.log("Google user:", user);
      
          // Send token to backend to create/check user in Firestore
          await fetch(`${import.meta.env.VITE_API_URL}/tasks/register`, {
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
                            <button type="button" className="google-signup-button" onClick={handleGoogleLogin}>
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
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} NovaMyst. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;
