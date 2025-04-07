import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch leaderboard data on component mount
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/leaderboard`); // Use environment variable
        const data = await response.json();

        if (response.ok) {
          setLeaderboard(data);  // Set the leaderboard state with data
        } else {
          throw new Error(data.error || 'Failed to load leaderboard2');
        }
      } catch (err) {
        setError('Failed to load leaderboard error');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div>
      <h1>Leaderboard</h1>

      {loading ? (
        <p>Loading leaderboard...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User Name</th>
              <th>XP</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={user.userID}>
                <td>{index + 1}</td>
                <td>{user.userName}</td>
                <td>{user.xp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
