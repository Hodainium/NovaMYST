import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { AlignJustify } from 'lucide-react';
import "./Leaderboard.css";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropdown, setDropdown] = useState(false);
  const [mode, setMode] = useState('global');

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchLeaderboard = async (sortMode = 'global') => {
    try {
      setLoading(true);
      setError('');
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated.');
  
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/leaderboard/${sortMode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch leaderboard');
  
      setLeaderboard(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(mode);
  }, [mode]);

  const toggleDropdown = () => setDropdown(open => !open);

  const handleSortChange = (newMode) => {
    setMode(newMode);
    setDropdown(false);
  };

  return (
    <>
      {loading ? (
        <div className="loading-leaderboard"><p>Loading leaderboard...</p></div>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="leaderboard-layout">
          <div className="leaderboard-top">
            <h2>Leaderboard</h2>
            <div className="leaderboard-buttons">
              <button className="leaderboard-filter" onClick={toggleDropdown}>
                <AlignJustify size={20} />
                <span>Sort By</span>
              </button>
              {showDropdown && (
                <div className="leaderboard-dropdown">
                  <button className="leaderboard-dropdown-item" onClick={() => handleSortChange('global')}>Global</button>
                  <button className="leaderboard-dropdown-item" onClick={() => handleSortChange('similar')}>Similar Rankings</button>
                  <button className="leaderboard-dropdown-item" onClick={() => handleSortChange('friends')}>Friends</button>
                </div>
              )}
            </div>
          </div>

          <div className="leaderboard-bottom">
            <h1>
              {mode === 'global' ? "Global Leaderboard" :
              mode === 'similar' ? "Similar XP Leaderboard" :
              "Friends Leaderboard"}
            </h1>
            <div className="leaderboard-table">
                <div className="leaderboard-heading">
                  <h3>Rank</h3>
                  <h3>User Name</h3>
                  <h3>XP</h3>
                </div>
              
              {leaderboard.map((user, index) => {
                let rankMedal = '';
                if (index === 0) rankMedal = 'gold';
                else if (index === 1) rankMedal = 'silver';
                else if (index === 2) rankMedal = 'bronze';

                return (
                  <div key={user.userID || user.id} className={`leaderboard-row ${rankMedal}`}>
                    <span>{index + 1}</span>
                    <span>{user.userName}</span>
                    <span>{user.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Leaderboard;