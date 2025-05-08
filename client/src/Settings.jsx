import './Settings.css';
import { useState, useContext } from 'react';
import { DarkModeContext } from './DarkMode';
import { auth } from './firebase'
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";

export default function Settings() {
    const [Username, SetnewUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

    const handleUpdateUsername = async (e) => {
        e.preventDefault(); // prevent form reload
    
        if (!Username.trim()) {
            alert("Please enter a valid username.");
            return;
        }
    
        try {
            const token = await auth.currentUser.getIdToken();
    
            const res = await fetch(`${import.meta.env.VITE_API_URL}/user/update-username`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ newUsername: Username.trim() }),
            });
    
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to update username");
            }
    
            alert("Username updated successfully!");
            SetnewUsername(""); // reset field
        } catch (err) {
            console.error(err);
            alert("Error: " + err.message);
        }
    };

    const handlePasswordChange = async (currentPassword, newPassword) => {
        const user = auth.currentUser;
      
        if (!user || !user.email) {
          alert("No user is currently signed in.");
          return;
        }
      
        try {
          // Step 1: Re-authenticate the user
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
      
          // Step 2: Update password
          await updatePassword(user, newPassword);
          alert("Password updated successfully!");
        } catch (error) {
          console.error("Password update failed:", error);
          alert("Failed to update password: " + error.message);
        }
      };
      
    
    return (
        <div className="settings-container">
            <form>
                <div className="UsernameChange"> 
                    <h4>Change Username</h4>
                    <input 
                        type="text" 
                        className="TypeUsername" 
                        placeholder="Enter new username"
                        value={Username}
                        onChange={(e) => SetnewUsername(e.target.value)}
                    />
                    <button className="SubmitName" onClick={handleUpdateUsername}>
                        Update Username
                    </button>
                </div>

                <div className="PasswordChange">
                    <h4>Change Password</h4>
                    <input 
                        type="password" 
                        className="TypePassword" 
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input 
                        type="password" 
                        className="TypePassword" 
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input 
                        type="password" 
                        className="TypePassword" 
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button className='SubmitPassword' onClick={(e) => {
                        e.preventDefault(); // Prevent form reload
                        if (newPassword !== confirmPassword) {
                            alert("New passwords do not match.");
                            return;
                        }
                        handlePasswordChange(currentPassword, newPassword);
                    }}>
                    Update Password
                    </button>
                </div>

                <div className="side-by-side-boxes">
                    <div className="appearance-settings">
                        <h4>Appearance</h4>
                        <div className="dark-mode-toggle-container">
                            <label className="dark-mode-toggle">
                                <div className="switch">
                                    <input 
                                        type="checkbox" 
                                        checked={darkMode}
                                        onChange={toggleDarkMode}
                                    />
                                    <span className="slider"></span>
                                </div>
                                
                            </label>
                        </div>
                    </div>

                    <div className="danger-zone">
                        <h4>Account Actions</h4>
                        <button className="AccountDeletion">Delete My Account</button>
                    </div>
                </div>
            </form>
        </div>
    );
}