import './Settings.css'
import { useState } from 'react';

export default function Settings () {
    const [Username, SetnewUsername] = useState('');
    const [Password, SetnewPassword] = useState('');
    const [Delete, DeleteAccount] = useState('');

    return (
        <form>
            <div className="UsernameChange"> 
                <h4>Username Change</h4>
                <input type="text" className="TypeUsername" placeholder="Enter a new username"/>
                <button className="SubmitName">Change Username</button>
            </div>

            <div className="PasswordChange">
                <h4>Password Change</h4>
                <input type="text" className="TypePassword" placeholder="Enter your current password"/>
                <input type="text" className="TypePassword" placeholder="Enter your new password"/>
                <input type="text" className="TypePassword" placeholder="Enter your new password again"/>
                <button className="SubmitPassword">Change Password</button>
            </div>

            <button className="AccountDeletion">Delete Account</button>
            
        </form>
    )
}