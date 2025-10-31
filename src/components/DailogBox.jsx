// src/components/DailogBox.jsx
import React from 'react';
import '../components/DailogBox.css';
const DailogBox = ({ onClose, onSelectType }) => {
    const handleSelect = (type) => {
      onSelectType(type);
    };
  
    return (
      <div className="dialog-overlay">
        <div className="dialog-box">
          <h2>Select Connection Type</h2>
          <button onClick={() => handleSelect("Default")}>Default</button>
          <button onClick={() => handleSelect("Conditional")}>Conditional</button>
          <button onClick={() => handleSelect("Message Flow")}>
            Message Flow
          </button>
          <button className="close-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  };
  

export default DailogBox;
