import './Settings.css'
// import { useState } from 'react';
// import {getAuth, updatePassword, deleteUser, EmailAuthCredential, reauthenticateWithCredential, EmailAuthProvider} from 'firebase/auth';

export default function Settings () {
    //const [newUsername, SetnewUsername] = useState('');
    //const [currPasswordcheck, setCurrPassword] = useState('');
    //const [newPassword, SetnewPassword] = useState('');
    //const [DeleteOpen, setDeleteOpen] = useState(false);
    //const [Delete, DeleteAccount] = useState('');

    // const user = getAuth().currentUser;

    // const handleUsernameChange = async (e) => {
    //     e.preventDefault();

    //     try {
            

    //     } catch {

    //     }
    // }

    // const handlePasswordChange = async (e) => {
    //     e.preventDefault();

    //     try{
    //         // match the current password first
    //         const credential = EmailAuthProvider.credential();


    //         updatePassword(user, newPassword).then(() => {
    //             alert("Password changed")
    //         }).catch((error) => {
    //             // An error occurred ---> If the current password is not the same 
    //         });
            
    //     } catch {

    //     }
    // }

    // const handleClose = () => {
    //     setDeleteOpen(false);
    // };

    // const handleOpen = () => {
    //     setDeleteOpen(true);
    // };

    // const Modal = ({isOpen, onClose, children}) => {
    //     if (!isOpen) return null;

    //     return (
    //         <div onClick = {onClose}
    //         style={{
    //             position: "fixed",
    //             top: 0,
    //             left: 0,
    //             width: "100%",
    //             height: "100%",
    //             background: "rgba(0, 0, 0, 0.5)",
    //             display: "flex",
    //             alignItems: "center",
    //             justifyContent: "center",
    //         }}
    //         > 
    //             <div
    //                 style={{
    //                     background: "white",
    //                     margin: "auto",
    //                     padding: "20px",
    //                     border: "3px solid",
    //                     width: "30%",
    //                     borderRadius: "10px",
    //                     borderColor: "#6c5dd3",
    //                 }}
    //             >
    //                 {children}
    //             </div>
    //         </div>
    //     );
    // };


    // const handleDeleteAccount = async () => {
    //     deleteUser(user).then(() => {
    //         // User delete
    //         alert("Account deleted")
    //     }).catch((error) => {
    //         // An error occurred (?)
    //         console.error("Account deletion prevented", + error.message);
    //         alert("Account cannot be deleted", + error.message);
    //     });
    // }

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

            <button className="AccountDeletion" /*onClick={handleOpen}*/>Delete Account</button>

            {/* <Modal isOpen={DeleteOpen}> 
                
                <h1>Are you sure you want to delete this account?</h1>

                <button className="Confirm button">Yes</button>
                <button className="Confirm button" onClick={handleClose}>No</button>

            </Modal> */}

        </form>
    )
}