import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { UserPlus, Forward, Mail } from 'lucide-react';
import "./Friends.css";

const Friends = () => {
    const [showRequestModal, setRequestModal] = useState(false);
    const [showMailModal, setMailModal] = useState(false);
    const [showFriendRequest, setFriendRequest] = useState(true);

    return (
        <>
            <div className="friends-layout">
                <div className="friends-top">
                    <h2>Friends</h2>
                    <div className="top-buttons">
                        <button className="add-friends-button" onClick={() => setRequestModal(true)}>
                            <UserPlus size={20} />
                            <span>Add Friends</span>
                        </button>
                        <button className="mail-button" onClick={() => setMailModal(true)}>
                            <Mail size={20} />
                            <span>Incoming Requests</span>
                        </button>
                    </div>
                </div>
                <div className="friends-bottom">
                    {/*Put Added Friends here. Will replace with character navbar*/}
                </div>
            </div>

            {showRequestModal && (
                <div className="modal-overlay">
                    <div className="request-modal">
                        <div className="request-form">
                            <label className="input-label">Enter username</label>
                            <input 
                                className="friends-input"
                                placeholder="Search for your friend..."
                            />
                        </div>
                        <div className="request-modal-buttons">
                            <button className="request-button"><Forward size={20}/> Send Request</button>
                            <button className="cancel-button" onClick={() => setRequestModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showMailModal && (
                <div className="modal-overlay">
                    <div className="mail-modal">
                        <h4>Friend Requests</h4>
                        <hr className="mail-divider" />
                        <div className="friend-request-list">
                            {/* Was testing scrolling, can delete*/}
                            {showFriendRequest && (
                                <>
                                    <FriendRequest 
                                        user="Placeholder" 
                                        onAccept={() => setFriendRequest(false)} 
                                        onCancel={() => setFriendRequest(false)}
                                    />
                                    <FriendRequest 
                                        user="Placeholder" 
                                        onAccept={() => setFriendRequest(false)} 
                                        onCancel={() => setFriendRequest(false)}
                                    />
                                    <FriendRequest 
                                        user="Placeholder" 
                                        onAccept={() => setFriendRequest(false)} 
                                        onCancel={() => setFriendRequest(false)}
                                    />
                                    <FriendRequest 
                                        user="Placeholder" 
                                        onAccept={() => setFriendRequest(false)} 
                                        onCancel={() => setFriendRequest(false)}
                                    />
                                </>
                            )}
                        </div>
                        <button className="cancel-button" onClick={() => setMailModal(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

const FriendRequest = ({ user, onAccept, onCancel }) => {
    return (
        <div className="friend-request-box">
            <p>{user}</p>
            <div className="friend-request-buttons">
                <button className="accept-button" onClick={onAccept}>
                    Accept
                </button>
                <button className="cancel-button" onClick={onCancel}>
                    Decline
                </button>
            </div>
        </div>
    );
};

export default Friends;