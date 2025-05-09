import './Settings.css';
import { useState, useContext } from 'react';
import { DarkModeContext } from './DarkMode';
import { auth, googleProvider } from './firebase';
import {
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  deleteUser,
  EmailAuthProvider,
  updatePassword,
  signInWithPopup
} from 'firebase/auth';
import DeleteAccountModal from './deleteAccountModal';

export default function Settings() {
  const [Username, SetnewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { darkMode, toggleDarkMode } = useContext(DarkModeContext);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isEmailUser, setIsEmailUser] = useState(false);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
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
      SetnewUsername("");
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
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Password update failed:", error);
      alert("Failed to update password: " + error.message);
    }
  };

  const handleDeleteAccount = async (enteredPassword) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const isEmailUser = user.providerData.some(p => p.providerId === "password");
      const isGoogleUser = user.providerData.some(p => p.providerId === "google.com");

      if (isEmailUser) {
        const email = user.email;
        const credential = EmailAuthProvider.credential(email, enteredPassword);
        await reauthenticateWithCredential(user, credential);
      } else if (isGoogleUser) {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user.uid !== user.uid) {
          throw new Error("Reauthentication failed: mismatched user.");
        }
      } else {
        throw new Error("Unsupported sign-in method.");
      }

      const token = await user.getIdToken();
      const backendRes = await fetch(`${import.meta.env.VITE_API_URL}/user/delete-account`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!backendRes.ok) {
        const err = await backendRes.json();
        throw new Error(err?.error || "Backend account deletion failed.");
      }

      await deleteUser(user);

    // Sign out from Firebase (clears Google session in client)
    await auth.signOut();

      alert("Account deleted successfully.");
      window.location.href = "/";
    } catch (err) {
      console.error("Account deletion failed:", err);
      alert("Failed to delete account: " + err.message);
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
            e.preventDefault();
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
            <button
                className="AccountDeletion"
                onClick={(e) => {
                    e.preventDefault();
                    const user = auth.currentUser;
                    if (!user) return;

                    const signedInWithEmail = user.providerData.some(p => p.providerId === "password");
                    setIsEmailUser(signedInWithEmail);
                    setIsDeleteModalOpen(true);
                }}
                >
                Delete My Account
            </button>
          </div>
        </div>
      </form>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
            setIsDeleteModalOpen(false);
            setDeletePassword('');
        }}
        onConfirm={handleDeleteAccount}
        darkMode={darkMode}
        deletePassword={deletePassword}
        setDeletePassword={setDeletePassword}
        isEmailUser={isEmailUser}
        />
    </div>
  );
}
