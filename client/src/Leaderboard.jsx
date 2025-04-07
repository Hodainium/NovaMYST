import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Import your Firebase auth instance

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="leaderboard-layout"> {/* You can add a CSS class for styling */}
      <h1>Global Leaderboard</h1>

      {loading ? (
        <p>Loading leaderboard...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <table className="leaderboard-table"> {/* You can add a CSS class for styling */}
          <thead>
            <tr>
              <th>Rank</th>
              <th>User Name</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={user.userID} className="leaderboard-row"> {/* You can add a CSS class for styling */}
                <td>{index + 1}</td>
                <td>{user.userName}</td>
                <td>{user.score}</td> {/* Assuming your backend returns 'score' for XP */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;