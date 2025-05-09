// DeleteAccountModal.jsx
import React from 'react';

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  deletePassword,
  setDeletePassword,
  darkMode,
  isEmailUser
}) {
  if (!isOpen) return null;

  const sharedInputStyles = {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: darkMode ? "#444" : "#fff",
    color: darkMode ? "#fff" : "#000"
  };

  return (
    <div
      className="modal-backdrop"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          position: "relative",
          background: darkMode ? "#2a2a2a" : "#ffffff",
          padding: "20px",
          borderRadius: "12px",
          width: "300px",
          border: "2px solid #6c5dd3",
          color: darkMode ? "#f5f5f5" : "#000"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: "10px" }}>Confirm Deletion</h2>

        {isEmailUser ? (
          <>
            <p>Please enter your password to confirm.</p>
            <input
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              style={sharedInputStyles}
              autoFocus
            />
          </>
        ) : (
          <p>You’ll be asked to reauthenticate with Google. Click Delete to proceed.</p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={() => {
              onClose();
              setDeletePassword('');
            }}
            style={{
              padding: "8px 12px",
              backgroundColor: "#ccc",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(deletePassword);
              onClose();
              setDeletePassword('');
            }}
            style={{
              padding: "8px 12px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
