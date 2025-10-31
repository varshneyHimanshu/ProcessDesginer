import React, { useState, useEffect, useRef, useCallback } from "react";
import "./NodeClickModal.css";

const NodeClickModal = ({
  selectedNode,
  onUpdateNode,
  onClose,
  nodes,
  edges,
  setEdges,
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const tabs = ["general", "rule", "document", "form"];

  const startEventGeneralFields = [
    { key: "label", label: "Label", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "targetLink", label: "Target Link", type: "dropdown" },
    { key: "prefix", label: "Prefix", type: "text" },
    { key: "suffix", label: "Suffix", type: "text" },
    { key: "length", label: "Length", type: "number" },
  ];

  const defaultGeneralFields = [
    { key: "label", label: "Label", type: "text" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "targetLink", label: "Target Link", type: "dropdown" },
  ];

  const tabFields = {
    general:
      selectedNode?.type === "Start-event"
        ? startEventGeneralFields
        : defaultGeneralFields,
    rule: [{ key: "rule", label: "Rule", type: "textarea" }],
    document: [{ key: "document", label: "Document", type: "text" }],
    form: [{ key: "form", label: "Form", type: "text" }],
  };

  const validateConnection = useCallback(
    (sourceId, targetId) => {
      if (sourceId === targetId) {
        alert("Cannot connect a node to itself.");
        return false;
      }

      const sourceNode = nodes.find((node) => node.id === sourceId);
      const targetNode = nodes.find((node) => node.id === targetId);

      if (!sourceNode || !targetNode) {
        alert("Invalid connection between nodes.");
        return false;
      }

      if (targetNode.type === "Start-event") {
        alert("Cannot connect to a Start-event node.");
        return false;
      }

      if (
        sourceNode.type === "end-event" ||
        sourceNode.type === "Terminating-end-event"
      ) {
        alert("Cannot connect from an end-event node.");
        return false;
      }

      const existingConnection = edges.some(
        (edge) => edge.source === sourceId && edge.target === targetId
      );

      if (existingConnection) {
        return false;
      }

      return true;
    },
    [nodes, edges]
  );

  const handleTargetLinkChange = (targetId) => {
    const sourceId = selectedNode.id;
    const currentTargetLink = selectedNode.data.mainAttributes.targetLink;

    const isAlreadyConnected = edges.some(
      (edge) => edge.source === sourceId && edge.target === targetId
    );

    if (isAlreadyConnected) {
      const updatedEdges = edges.filter(
        (edge) => !(edge.source === sourceId && edge.target === targetId)
      );
      setEdges(updatedEdges);
      handleInputChange("targetLink", "");
    } else {
      if (validateConnection(sourceId, targetId)) {
        const newEdge = {
          id: `edge-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: "sequence-flow",
          style: { stroke: "black", strokeWidth: 2 },
          markerEnd: { type: "arrowclosed", color: "black" },
        };
        setEdges((prevEdges) => [...prevEdges, newEdge]);
        handleInputChange("targetLink", targetId);
      }
    }
  };

  const handleInputChange = (key, value) => {
    if (selectedNode) {
      const updatedMainAttributes = {
        ...selectedNode.data.mainAttributes,
        [key]: value,
      };

      const updatedData = {
        ...selectedNode.data,
        mainAttributes: updatedMainAttributes,
      };

      onUpdateNode(selectedNode.id, updatedData);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const modalRect = modalRef.current.getBoundingClientRect();
    setOffset({
      x: e.clientX - modalRect.left,
      y: e.clientY - modalRect.top,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - offset.x,
        y: e.clientY - offset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onClose, isDragging, offset]);

  const renderField = (field) => {
    const value = selectedNode?.data?.mainAttributes?.[field.key] || "";

    if (field.type === "dropdown" && field.key === "targetLink") {
      const isConnected = (nodeId) =>
        edges.some(
          (edge) => edge.source === selectedNode.id && edge.target === nodeId
        );

      return (
        <select
          key={field.key}
          value={value}
          onChange={(e) => handleTargetLinkChange(e.target.value)}
        >
          <option value="">Select a node</option>
          {nodes
            .filter(
              (node) =>
                node.id !== selectedNode.id && node.type !== "Start-event"
            )
            .map((node) => (
              <option
                key={node.id}
                value={node.id}
                style={{
                  fontWeight: isConnected(node.id) ? "bold" : "normal",
                  color: isConnected(node.id) ? "green" : "black",
                }}
              >
                {node.data.mainAttributes.label || node.id}
              </option>
            ))}
        </select>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          key={field.key}
          value={value}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          placeholder={field.label}
        />
      );
    }

    if (field.type === "number") {
      return (
        <input
          key={field.key}
          type="number"
          value={value}
          onChange={(e) => handleInputChange(field.key, e.target.value)}
          placeholder={field.label}
        />
      );
    }

    return (
      <input
        key={field.key}
        type="text"
        value={value}
        onChange={(e) => handleInputChange(field.key, e.target.value)}
        placeholder={field.label}
      />
    );
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        ref={modalRef}
        style={{
          top: `${position.y}px`,
          left: `${position.x}px`,
          cursor: isDragging ? "grabbing" : "move",
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="modal-header">
          <h3>Node Properties</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {tabFields[activeTab]?.map((field) => (
            <div className="field-row" key={field.key}>
              <label>{field.label}:</label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NodeClickModal;
