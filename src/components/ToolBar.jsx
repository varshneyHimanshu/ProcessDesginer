import React, { useRef } from "react";
import {
  MdSave,
  MdUndo,
  MdRedo,
  MdContentCut,
  MdContentCopy,
  MdDelete,
  MdContentPaste,
  MdUploadFile,
  MdOutlineAddBox,
  MdOpenInFull,
  MdGridOn,
  MdSettings,
  MdForum,
  MdDescription,
  MdLibraryBooks,
  MdInsights,
  MdAdd,
  MdRemove,
} from "react-icons/md";
import { useReactFlow } from "@xyflow/react";
import "./ToolBar.css";

const ToolBar = ({
  nodes,
  edges,
  setFromJson,
  undo,
  redo,
  selectedNode,
  setNodeLabel,
  copyNode,
  cutNode,
  deleteNode,
  pasteNode,
  onAddNodeClick,
  setIsNewModalOpen,
}) => {
  const fileInputRef = useRef();
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleSave = () => {
    const fileName = prompt("Please enter a file name:", "flow.json");
    if (!fileName) return; // If the user cancels, do nothing

    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`; // Ensure the file has a .json extension
    link.click();
  };
  const handleSaveAsImage = () => {
    const fileName = prompt("Please enter a file name:", "flow.png");
    if (!fileName) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 600;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000000";
    ctx.font = "20px Arial";
    ctx.fillText("Your flow content goes here", 50, 50);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
    link.click();
  };

  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.nodes && data.edges) {
          setFromJson(data);
        } else {
          alert("Invalid file format");
        }
      } catch (err) {
        alert("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="toolbar">
      <button className="toolbar-button" onClick={handleSave} title="Save">
        <MdSave />
      </button>
      <button
        className="toolbar-button"
        onClick={() => fileInputRef.current.click()}
        title="Load"
      >
        <MdUploadFile />
      </button>
      <button
        className="toolbar-button"
        onClick={handleSaveAsImage}
        title="Save as PNG"
      >
        <MdSave />
      </button>
      <input
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleLoad}
      />
      <span className="divider" />
      <button className="toolbar-button" onClick={undo} title="Undo">
        <MdUndo />
      </button>
      <button className="toolbar-button" onClick={redo} title="Redo">
        <MdRedo />
      </button>
      <span className="divider" />
      <button className="toolbar-button" title="Cut" onClick={cutNode}>
        <MdContentCut />
      </button>
      <button className="toolbar-button" title="Copy" onClick={copyNode}>
        <MdContentCopy />
      </button>
      <button className="toolbar-button" title="Delete" onClick={deleteNode}>
        <MdDelete />
      </button>
      <button className="toolbar-button" title="Paste" onClick={pasteNode}>
        <MdContentPaste />
      </button>
      <span className="divider" />
      <button className="toolbar-button" onClick={zoomIn} title="Zoom In">
        <MdAdd />
      </button>
      <button className="toolbar-button" onClick={zoomOut} title="Zoom Out">
        <MdRemove />
      </button>
      <span className="divider" />
      <button className="toolbar-button" title="Add Node">
        <MdOutlineAddBox />
      </button>
      <button className="toolbar-button" title="Resize" onClick={fitView}>
        <MdOpenInFull />
      </button>
      <button className="toolbar-button" title="Align">
        <MdGridOn />
      </button>
      <span className="divider" />
      <button className="toolbar-button" title="Validate">
        <MdSettings />
      </button>
      <button className="toolbar-button" title="Discussion">
        <MdForum />
      </button>
      <button className="toolbar-button" title="Documentation">
        <MdDescription />
      </button>
      <button className="toolbar-button" title="Library">
        <MdLibraryBooks />
      </button>
      <button className="toolbar-button" title="Syntax Checker">
        <MdInsights />
      </button>
      <span className="divider"/>
      <button
        className="toolbar-button"
        title="New Canvas"
        onClick={() => setIsNewModalOpen(true)}
      >
        <MdLibraryBooks />
      </button>
      <span className="divider" />
      {selectedNode && (
        <button
          className="toolbar-button"
          onClick={onAddNodeClick}
          title="Add Node"
        >
          <MdAdd />
        </button>
      )}
    </div>
  );
};

export default ToolBar;
