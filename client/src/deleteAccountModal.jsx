import { Trash2 } from 'lucide-react';
import "./deleteAccountModal.css";

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  deletePassword,
  setDeletePassword,
  isEmailUser
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Confirm Deletion</h2>

        {isEmailUser ? (
          <>
            <label>
              Please enter your password to confirm.
            </label>
            <input
              className="delete-input"
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              autoFocus
            />
          </>
        ) : (
          <p>You’ll be asked to reauthenticate with Google. Click Delete to proceed.</p>
        )}

        <div 
          style={{ 
            display: "flex",
            justifyContent: "space-between",
          }}>
          <button
            className="modal-delete-button"
            onClick={() => {
              onConfirm(deletePassword);
              onClose();
              setDeletePassword('');
            }}
          >
            <Trash2 size={20} />
            Delete
          </button>
          <button
            className="modal-cancel-button"
            onClick={() => {
              onClose();
              setDeletePassword('');
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
