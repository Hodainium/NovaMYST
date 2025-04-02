import './Settings.css';
import { useState, useContext } from 'react';
import { DarkModeContext } from './DarkMode';

export default function Settings() {
    const [Username, SetnewUsername] = useState('');
    const [Password, SetnewPassword] = useState('');
    const { darkMode, toggleDarkMode } = useContext(DarkModeContext);

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
                    <button className="SubmitName">Update Username</button>
                </div>

                <div className="PasswordChange">
                    <h4>Change Password</h4>
                    <input 
                        type="password" 
                        className="TypePassword" 
                        placeholder="Current password"
                        value={Password}
                        onChange={(e) => SetnewPassword(e.target.value)}
                    />
                    <input 
                        type="password" 
                        className="TypePassword" 
                        placeholder="New password"
                    />
                    <input 
                        type="password" 
                        className="TypePassword" 
                        placeholder="Confirm new password"
                    />
                    <button className="SubmitPassword">Update Password</button>
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