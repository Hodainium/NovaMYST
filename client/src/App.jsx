import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Dashboard from './Dashboard';
import Login from './Login';
import Leaderboard from './Leaderboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;