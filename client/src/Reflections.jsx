import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { AlignJustify } from 'lucide-react';
import "./Reflections.css";

const Reflections = () => {
    const [showDropdown, setDropdown] = useState(false);
    const toggleDropdown = () => setDropdown(open => !open);

    return (
    <>
      <div className="reflections-layout">
        <div className="reflections-top">
            <h2>Reflections</h2>
            <div className="filter-alignment">
                <button className="filter-button" onClick={toggleDropdown}>
                    <AlignJustify size={20} />
                    Sort By
                </button>
                {showDropdown && (
                  <div className="dropdown-filter">
                    <button className="dropdown-item">Date</button>
                  </div>
                )}
            </div>
        </div>

        <div className="reflections-bottom">
            <div className="reflections-bottom-layout">
                <div className="task-list">
                    <CompletedTask name="test" />
                </div>
                <div className="reflections-form">
                    {/*Change the label to current task name*/}
                    <label className="input-label">Task Name</label>
                    <textarea
                        className="reflections-input"
                        placeholder="Enter your thoughts here..."
                    />
                    <button className="save-button">
                        Save
                    </button>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

{/* Temporary for now. Going to see what we need from tasks (date, time) */}
const CompletedTask = ({ name }) => (
    <div className="task-box">
        <p>{name}</p>
    </div>
);

export default Reflections;