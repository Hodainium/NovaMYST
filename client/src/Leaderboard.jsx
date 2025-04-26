import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Import your Firebase auth instance
import { AlignJustify, ArrowDown } from 'lucide-react';
import "./Leaderboard.css";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropdown, setDropdown] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError('');

        const user = auth.currentUser;
        if (!user) {
          setError('User not authenticated.');
          setLoading(false);
          return;
        }

        const token = await user.getIdToken();
        if (!token) {
          setError('Could not retrieve authentication token.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/leaderboard`, { // Changed line
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.error || `Failed to fetch leaderboard (status: ${response.status})`);
        }

        const data = await response.json();
        setLeaderboard(data);
        setLoading(false);

      } catch (err) {
        setError(err.message);
        console.error('Error fetching leaderboard:', err);
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const toggleDropdown = () => {
    setDropdown(open => !open);
  };

  return (
    <div className="leaderboard-layout"> {/* You can add a CSS class for styling */}
      {loading ? (
        <p>Loading leaderboard...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <div className="leaderboard-left">
            <h1>Global Leaderboard</h1>
            <div className="leaderboard-table"> {/* You can add a CSS class for styling */}
              <div className="leaderboard-heading">  
                <h3>Rank</h3>
                <h3>User Name</h3>
                <h3>XP</h3>
              </div>

              {leaderboard.map((user, index) => {
                let rankMedal = ''; 

                if (index === 0) {
                  rankMedal = 'gold';
                } else if (index === 1) {
                  rankMedal = 'silver';
                } else if (index === 2) {
                  rankMedal = 'bronze';
                }

                return (
                  <div key={user.userID} className={`leaderboard-row ${rankMedal}`}>
                    <span>{index + 1}</span>
                    <span>{user.userName}</span>
                    <span>{user.score}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="leaderboard-right">
            <button className="filter-button" onClick={toggleDropdown}>
              <AlignJustify />
              <span>Sort By</span>
            </button>
            
            {showDropdown && (
              <div className="dropdown-filter">
                <button className="dropdown-item">Global</button>
                <button className="dropdown-item">Similar Rankings</button>
                <button className="dropdown-item">Friends</button>
              </div>
            )}

            <button className="jump-button">
              <ArrowDown/> 
              <span>Jump to Me</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Leaderboard;