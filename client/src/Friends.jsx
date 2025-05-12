import { useState, useEffect, useContext } from 'react';
import { auth } from './firebase';
import { UserPlus, Forward, Mail } from 'lucide-react';
import { DarkModeContext } from './DarkMode'; 
import "./Friends.css";

const Friends = () => {
  const { darkMode } = useContext(DarkModeContext); 
  const [showRequestModal, setRequestModal] = useState(false);
  const [showMailModal, setMailModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [leaderboardInvites, setLeaderboardInvites] = useState([]);
  const [showLeaderboardInvites, setShowLeaderboardInvites] = useState(false);


  const API_URL = import.meta.env.VITE_API_URL;

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');
    return await user.getIdToken();
  };

  const fetchFriendsList = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/friends/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch friends');
      setFriendsList(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      alert('Failed to load friends');
    }
  };

  const handleSendRequest = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: searchUsername }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send request');
      alert('Friend request sent!');
      setRequestModal(false);
      setSearchUsername('');
    } catch (error) {
      console.error('Error sending friend request:', error);
      alert('Failed to send friend request');
    }
  };

  const handleOpenMailModal = async () => {
    setLoadingRequests(true);
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/friends/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch requests');
      setFriendRequests(data);
      setMailModal(true);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      alert('Failed to load requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/friends/accept/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      fetchFriendsList();
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDecline = async (requestId) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/friends/decline/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };


  const handleInviteToLeaderboard = async (friendId) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/friends/invite-leaderboard`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendId })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to invite to leaderboard');
      alert('Friend invited to leaderboard!');
    } catch (error) {
      console.error('Error inviting friend to leaderboard:', error);
      alert('Could not invite friend to leaderboard');
    }
  };

  const fetchLeaderboardInvites = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/friends/leaderboard-invites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch leaderboard invites');
      setLeaderboardInvites(data);
      setShowLeaderboardInvites(true);
    } catch (error) {
      console.error('Error fetching leaderboard invites:', error);
      alert('Failed to load leaderboard invites.');
    }
  };

  const handleAcceptLeaderboardInvite = async (friendId) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/friends/accept-leaderboard`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendId }),
      });
      
      alert('Accepted leaderboard invite!');
      setLeaderboardInvites(prev => prev.filter(inv => inv.userID !== friendId));
    } catch (error) {
      console.error('Error accepting leaderboard invite:', error);
    }
  };
  
  const handleDeclineLeaderboardInvite = async (friendId) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/friends/decline-leaderboard`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendId }),
      });      
      alert('Declined leaderboard invite.');
      setLeaderboardInvites(prev => prev.filter(inv => inv.userID !== friendId));
    } catch (error) {
      console.error('Error declining leaderboard invite:', error);
    }
  };
  
  const handleRemoveFromLeaderboard = async (friendId) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/friends/remove-leaderboard/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Friend removed from leaderboard.');
    } catch (error) {
      console.error('Error removing friend from leaderboard:', error);
    }
  };
  
  const handleRemoveFriend = async (friendId) => {
    const confirmed = window.confirm('Are you sure you want to remove this friend?');
    if (!confirmed) return;
  
    try {
      const token = await getToken();
      await fetch(`${API_URL}/friends/remove/${friendId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Friend removed.');
      fetchFriendsList(); // Refresh the list
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Failed to remove friend.');
    }
  };

  useEffect(() => {
    fetchFriendsList();
  }, []);

  return (
    <>
      <div className={`friends-layout ${darkMode ? 'dark' : ''}`}>
        <div className="friends-top">
          <h2>Friends</h2>
          <div className="top-buttons">
            <button className="add-friends-button" onClick={() => setRequestModal(true)}>
              <UserPlus size={20} />
              <span>Add Friends</span>
            </button>
            <button className="mail-button" onClick={handleOpenMailModal}>
              <Mail size={20} />
              <span>Incoming Requests</span>
            </button>
            <button className="mail-button" onClick={fetchLeaderboardInvites}>
              <Mail size={20} />
            <span>Leaderboard Invites</span>
            </button>
          </div>
        </div>

        <div className="friends-bottom">
          {friendsList.length === 0 ? (
            <h4>No friends yet!</h4>
          ) : (
            <>
              {friendsList.map(friend => (
                <div className="friend-request-box" key={friend.userID}>
                  <p>{friend.userName}</p>
                  <div className="friend-request-buttons">
                    <button className="cancel-button" onClick={() => handleRemoveFriend(friend.userID)}>
                      Remove
                    </button>
                    <button className="invite-button" onClick={() => handleInviteToLeaderboard(friend.userID)}>
                      Invite to Leaderboard
                    </button>
                    <button className="remove-leaderboard-button" onClick={() => handleRemoveFromLeaderboard(friend.userID)}>
                      Remove from Leaderboard
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {showRequestModal && (
        <div className={`modal-overlay ${darkMode ? 'dark' : ''}`}>
          <div className="request-modal">
            <div className="request-form">
              <label className="input-label">Enter username</label>
              <input
                className="friends-input"
                placeholder="Search for your friend..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
              />
            </div>
            <div className="request-modal-buttons">
              <button className="request-button" onClick={handleSendRequest}>
                <Forward size={20} /> Send Request
              </button>
              <button className="cancel-button" onClick={() => setRequestModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLeaderboardInvites && (
        <div className={`modal-overlay ${darkMode ? 'dark' : ''}`}>
          <div className="mail-modal">
            <h4>Leaderboard Invites</h4>
            <hr className="mail-divider" />
            {leaderboardInvites.length > 0 ? (
              leaderboardInvites.map((friend) => (
                <div className="friend-request-box" key={friend.userID}>
                  <p>{friend.userName}</p>
                  <div className="friend-request-buttons">
                    <button className="accept-button" onClick={() => handleAcceptLeaderboardInvite(friend.userID)}>Accept</button>
                    <button className="cancel-button" onClick={() => handleDeclineLeaderboardInvite(friend.userID)}>Decline</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending invites.</p>
            )}
            <button className="cancel-button" onClick={() => setShowLeaderboardInvites(false)}>Cancel</button>
          </div>
        </div>
      )}


      {showMailModal && (
        <div className={`modal-overlay ${darkMode ? 'dark' : ''}`}>
          <div className="mail-modal">
            <h4>Friend Requests</h4>
            <hr className="mail-divider" />
            {loadingRequests ? (
              <p>Loading...</p>
            ) : friendRequests.length > 0 ? (
              <div className="friend-request-list">
                {friendRequests.map((req) => (
                  <FriendRequest
                    key={req.id}
                    user={req.requester?.userName || 'Unknown'}
                    onAccept={() => handleAccept(req.id)}
                    onCancel={() => handleDecline(req.id)}
                  />
                ))}
              </div>
            ) : (
              <p>No friend requests.</p>
            )}
            <button className="cancel-button" onClick={() => setMailModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const FriendRequest = ({ user, onAccept, onCancel }) => (
  <div className="friend-request-box">
    <p>{user}</p>
    <div className="friend-request-buttons">
      <button className="accept-button" onClick={onAccept}>Accept</button>
      <button className="cancel-button" onClick={onCancel}>Decline</button>
    </div>
  </div>
);


export default Friends;
