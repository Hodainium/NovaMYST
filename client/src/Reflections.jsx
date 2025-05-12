import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { AlignJustify } from 'lucide-react';
import './Reflections.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Reflections = () => {
  const [showDropdown, setDropdown] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reflectionText, setReflectionText] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleDropdown = () => setDropdown((open) => !open);

  useEffect(() => {
    const fetchCompletedTasks = async () => {
      try {
        const user = auth.currentUser;
        const token = await user.getIdToken();

        const res = await fetch(`${API_URL}/tasks/completed`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch completed tasks");
        const data = await res.json();

        // ✅ Convert Firestore timestamp to real JS Date object
        const tasks = (data.tasks || []).map(task => ({
          ...task,
          completedAt: task.completedAt
            ? new Date(task.completedAt._seconds * 1000)
            : null
        }));

        setCompletedTasks(tasks);
      } catch (err) {
        console.error("Error fetching completed tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedTasks();
  }, []);

  const handleTaskClick = async (task) => {
    setSelectedTask(task);
    setReflectionText("Loading...");

    try {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const res = await fetch(`${API_URL}/api/reflections/${task.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error fetching reflection");
      const { reflection } = await res.json();
      setReflectionText(reflection || "");
    } catch (err) {
      console.error(err);
      setReflectionText("");
    }
  };

  const handleSaveReflection = async () => {
    if (!selectedTask || !reflectionText.trim()) {
      alert('Please write a reflection before saving.');
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const res = await fetch(`${API_URL}/api/reflections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskId: selectedTask.id,
          reflection: reflectionText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save reflection');
      }

      alert('Reflection saved!');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="reflections-layout">
      <div className="reflections-top">
        <h2>Reflections</h2>
        <div className="reflections-buttons">
          <button className="reflections-filter" onClick={toggleDropdown}>
            <AlignJustify size={20} />
            Sort By
          </button>
          {showDropdown && (
            <div className="reflections-dropdown">
              <button
                className="reflections-dropdown-item"
                onClick={() => {
                  setSortOrder('newest');
                  setDropdown(false);
                }}
              >
                Newest
              </button>
              <button
                className="reflections-dropdown-item"
                onClick={() => {
                  setSortOrder('oldest');
                  setDropdown(false);
                }}
              >
                Oldest
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="reflections-bottom">
        <div className="reflections-bottom-layout">
          <div className="task-list">
            {loading ? (
              <div className="task-box">Loading...</div>
            ) : completedTasks.length === 0 ? (
              <div> 
                <h4>No completed tasks yet.</h4>
              </div>
            ) : (
              completedTasks
                .slice()
                .sort((a, b) => {
                  const timeA = a.completedAt?.getTime?.() || 0;
                  const timeB = b.completedAt?.getTime?.() || 0;
                  return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
                })
                .map((task) => (
                  <div
                    key={task.id}
                    className={`task-box ${selectedTask?.id === task.id ? 'selected-task' : ''}`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="task-content">
                      <span className="task-title">{task.title}</span>
                      <span className="task-date">{task.completedAt?.toLocaleDateString() || 'No date'}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
          <div className="reflections-form">
            <label className="input-label">
              {selectedTask ? selectedTask.title : 'Select a task'}
            </label>
            <textarea
              className="reflections-input"
              placeholder="Enter your thoughts here..."
              disabled={!selectedTask}
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
            />
            <button
              className="save-button"
              onClick={handleSaveReflection}
              disabled={!selectedTask || saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reflections;
