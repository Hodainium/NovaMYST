import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { UserPlus, Forward } from 'lucide-react';
import "./Friends.css";

const Friends = () => {
    const [showModal, setModal] = useState(false);

    return (
        <>
            <div className="friends-layout">
                <div className="top-section">
                    <h2>Friends</h2>
                    <button className="add-friends-button" onClick={() => setModal(true)}>
                        <UserPlus size={20} />
                        <span>Add Friends</span>
                    </button>
                </div>
                <div className="bottom-section">
                    {/*Put Added Friends here*/}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="friends-modal">
                        <div className="friends-form">
                            <label className="input-label">Enter username</label>
                            <input 
                                className="friends-input"
                                placeholder="Search for your friend..."
                            />
                        </div>
                        <div className="modal-buttons">
                            <button className="request-button"><Forward size={20}/> Send Request</button>
                            <button className="cancel-button" onClick={() => setModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Friends;