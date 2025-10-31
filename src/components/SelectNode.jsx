import React from "react";
import ReactDOM from "react-dom";

import { nodeTypes } from "../nodes/nodeTypes";

const SelectNode = ({ onSelect, onClose }) => {
  const nodeTypeKeys = Object.keys(nodeTypes);

  const content = (
    <div
      style={{
        position: "fixed",
        top: "20%",
        left: "40%",
        backgroundColor: "white",
        border: "1px solid #ccc",
        padding: "20px",
        zIndex: 9999,
        boxShadow: "0px 4px 16px rgba(0,0,0,0.2)",
        maxHeight: "60vh",
        overflowY: "auto",
      }}
    >
      <h3>Select a Node Type</h3>
      {nodeTypeKeys.map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          style={{
            display: "block",
            margin: "8px 0",
            width: "100%",
            textAlign: "left",
            padding: "8px 12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
            cursor: "pointer",
          }}
        >
          {type}
        </button>
      ))}
      <button
        onClick={onClose}
        style={{
          marginTop: "20px",
          backgroundColor: "#eee",
          padding: "6px 10px",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Cancel
      </button>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default SelectNode;
