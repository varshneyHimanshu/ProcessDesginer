import React, { useState, useEffect, useRef } from "react";
import "./NewModal.css";

const NewModal = ({
  canvas,
  setCanvas,
  nodes,
  edges,
  onClose,
  setFromJson,
}) => {
  const [savedCanvases, setSavedCanvases] = useState([]);
  const modalRef = useRef();

  useEffect(() => {
    loadSavedCanvases();

    // Close modal if clicked outside
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadSavedCanvases = () => {
    const keys = Object.keys(localStorage).filter((key) => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        return data && data.nodes && data.edges && data.name;
      } catch {
        return false;
      }
    });
    setSavedCanvases(keys);
  };

  // const handleSave = (name) => {

  //   const dataStr = JSON.stringify({ nodes, edges }, null, 2);
  //   const blob = new Blob([dataStr], { type: "application/json" });
  //   const link = document.createElement("a");
  //   link.href = URL.createObjectURL(blob);
  //   link.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`; // Ensure the file has a .json extension
  //   link.click();
  // };

  const handleSave = (name) => {
    const fileName = name;
    if (!fileName) return; // If the user cancels, do nothing

    // Save the entire canvas state
    const dataStr = JSON.stringify(canvas, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`; // Ensure the file has a .json extension
    link.click();
  };

  const saveCurrentCanvas = () => {
    if (!canvas.name || canvas.name.trim() === "") {
      alert("Please enter a name for the current Process before saving.");
      return;
    }
    const data = { nodes, edges, name: canvas.name };
    localStorage.setItem(canvas.name, JSON.stringify(data));
    alert(`Process "${canvas.name}" saved successfully!`);
    loadSavedCanvases();
  };

  const createNewCanvas = () => {
    const name = prompt("Enter new Process name:");
    if (!name || name.trim() === "") return alert("Name cannot be empty!");
    if (localStorage.getItem(name)) {
      alert(
        "A Process with this name already exists. Please choose another name."
      );
      return;
    }
    setCanvas({ nodes: [], edges: [], name });
    setFromJson({ nodes: [], edges: [] });
    loadSavedCanvases();
  };

  const renameCanvas = (oldName) => {
    const newName = prompt("Enter new name for the Process:", oldName);
    if (!newName || newName.trim() === "")
      return alert("Name cannot be empty!");
    if (newName === oldName) return;
    if (localStorage.getItem(newName)) {
      alert("A Process with this name already exists.");
      return;
    }

    const data = JSON.parse(localStorage.getItem(oldName));
    if (!data) return alert("Process not found.");

    data.name = newName;
    localStorage.setItem(newName, JSON.stringify(data));
    localStorage.removeItem(oldName);

    if (canvas.name === oldName) {
      setCanvas(data);
    }
    loadSavedCanvases();
  };

  const openCanvas = (name) => {
    const data = JSON.parse(localStorage.getItem(name));
    setFromJson(data);
    if (!data) return alert("Process data corrupted or missing!");
    setCanvas(data);
    onClose(); // Close modal after opening canvas
  };

  const deleteCanvas = (name) => {
    if (window.confirm(`Are you sure you want to delete Process "${name}"?`)) {
      localStorage.removeItem(name);
      if (canvas.name === name) {
        setCanvas({ nodes: [], edges: [], name: "" });
      }
      loadSavedCanvases();
    }
  };

  return (
    <div className="newmodal-overlay">
      <div className="newmodal-container" ref={modalRef}>
        {/* Close icon top-right */}
        <button
          className="modal-close-icon"
          onClick={onClose}
          aria-label="Close Modal"
        >
          &times;
        </button>

        <h2>Manage Processes</h2>

        <div className="button-row">
          <button onClick={saveCurrentCanvas}>Save Current Process</button>
          <button onClick={createNewCanvas}>Create New Process</button>
        </div>

        <h3>Saved Processes:</h3>
        {savedCanvases.length === 0 ? (
          <p>No saved Processes found.</p>
        ) : (
          <ul className="canvas-list">
            {savedCanvases.map((name) => (
              <li key={name}>
                <span className="canvas-name">{name}</span>
                <div className="canvas-buttons">
                  <button onClick={() => renameCanvas(name)}>Rename</button>
                  <button onClick={() => openCanvas(name)}>Open</button>
                  <button onClick={() => deleteCanvas(name)}>Delete</button>
                  <button onClick={() => handleSave(name)}>Save Process</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NewModal;
