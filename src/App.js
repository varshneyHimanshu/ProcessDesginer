import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlowProvider,
  ReactFlow,
  addEdge,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./App.css";

import OptionsTable from "./components/OptionsTable";
import AttributePanel from "./components/AttributePanel";
import ToolBar from "./components/ToolBar";
import { nodeTypes } from "./nodes/nodeTypes";
import DailogBox from "./components/DailogBox";
import SelectNode from "./components/SelectNode";
import NewModal from "./components/NewModal";

import NodeClickModal from "./components/NodeClickModal";

const initialNodes = [];
const initialEdges = [];

const FlowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const [connectionType, setConnectionType] = useState("Default");

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const copiedNodeRef = useRef(null);
  const reactFlowWrapper = useRef(null);

  const [canvas, setCanvas] = useState({
    id: null,
    name: "Untitled Process",
    elements: [],
  });

  const [isAttributePanelOpen, setIsAttributePanelOpen] = useState(true);
  const [isOpenDailogBox, setIsOpenDailogBox] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState(null);
  const [showSelectNodeDialog, setShowSelectNodeDialog] = useState(false);
  const [isRightClickModalOpen, setIsRightClickModalOpen] = useState(false);

  //variable to check whether canvas is clicked or not
  const [isCanvasSelected, setIsCanvasSelected] = useState(false);
  const [type, setType] = useState("Sequence Flow"); // Default type

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const incoming = edges
          .filter((e) => e.target === node.id)
          .map((e) => e.source);
        const outgoing = edges
          .filter((e) => e.source === node.id)
          .map((e) => e.target);

        return {
          ...node,
          data: {
            ...node.data,
            incoming,
            outgoing,
          },
        };
      })
    );
  }, [edges]);

  const handleWheel = (event) => {
    // Prevent default zoom behavior
    event.preventDefault();
  };
  const onEdgeClick = useCallback((_, edge) => {
    console.log("Edge Clicked");
    setSelectedEdge(edge);
    setSelectedNode(null);
    setIsCanvasSelected(false);
  }, []);

  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault(); // Prevent the default context menu
    setSelectedNode(node);
    setIsCanvasSelected(false);
    setSelectedEdge(null);
    setIsRightClickModalOpen(true); // Open the rightClickModal
    setIsAttributePanelOpen(true); // Close the attribute panel if open
  }, []);

  const deleteNode = () => {
    if (selectedNode) {
      // Find the selected node
      const nodeToDelete = selectedNode;

      // Find all edges connected to this node
      const connectedEdges = edges.filter(
        (e) => e.source === nodeToDelete.id || e.target === nodeToDelete.id
      );

      // Push the delete action to the undo stack with the node and its edges
      undoStack.current.push({
        action: "deleteNode",
        data: nodeToDelete,
        edges: connectedEdges, // Store the edges to restore later
      });

      // Clear the redo stack since a new action is performed
      redoStack.current = [];

      // Remove the node from the nodes state
      setNodes((nds) => nds.filter((n) => n.id !== nodeToDelete.id));

      // Remove the connected edges from the edges state
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== nodeToDelete.id && e.target !== nodeToDelete.id
        )
      );

      // Clear the selected node
      setSelectedNode(null);
    } else if (selectedEdge) {
      // Handle edge deletion
      const edgeToDelete = selectedEdge;

      // Push the delete action to the undo stack for the edge
      undoStack.current.push({
        action: "deleteEdge",
        data: edgeToDelete,
      });

      // Clear the redo stack since a new action is performed
      redoStack.current = [];

      // Remove the edge from the edges state
      setEdges((eds) => eds.filter((e) => e.id !== edgeToDelete.id));

      // Clear the selected edge
      setSelectedEdge(null);
    }
  };

  const handleAddNode = (type) => {
    if (!selectedNode) return;

    const id = `${+new Date()}`;

    const mainAttributes = {
      label: type,
      shapeType: type,
      backgroundColor: "#ffffff",
      borderColor: "#000000",
      description: "",
      taskType: "send",
      loopType: "none",
    };

    const moreAttributes = {
      processId: "",
      auditing: "",
      monitoring: "",
      categories: "",
      startQuantity: "1",
      completionQuantity: "1",
      implementation: "Unspecified",
      messageReference: "",
      operationReference: "",
      script: "",
      scriptFormat: "",
      testBefore: false,
      loopCondition: "",
      loopMaximum: "",
      loopCardinality: "",
      loopDataInput: "",
      loopDataOutput: "",
      inputDataItem: "",
      outputDataItem: "",
      behavior: "None",
      complexCondition: "",
      oneBehaviorEventReference: "None",
      noneBehaviorEventReference: "None",
      operationName: "",
      inMessageName: "",
      inMessageItemKind: "physical",
      inMessageStructure: "",
      inMessageIsCollection: false,
      outMessageName: "",
      outMessageItemKind: "physical",
      outMessageStructure: "",
      outMessageIsCollection: false,
    };

    const newNode = {
      id,
      type,
      position: {
        x: selectedNode.position.x + 250,
        y: selectedNode.position.y,
      },
      data: {
        mainAttributes,
        moreAttributes,
      },
    };

    const newEdge = {
      id: `e${selectedNode.id}-${id}`,
      source: selectedNode.id,
      target: id,
      type: "smoothstep",
      style: { stroke: "black", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "black",
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
    setShowSelectNodeDialog(false);
  };

  const onNodeClick = (_, node) => {
    setSelectedNode(node);
    setIsCanvasSelected(false);
    setSelectedEdge(null);
  };

  const setNodeLabel = (id, newLabel) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label: newLabel } } : n
      )
    );
    if (selectedNode && selectedNode.id === id) {
      setSelectedNode((prev) =>
        prev ? { ...prev, data: { ...prev.data, label: newLabel } } : null
      );
    }
  };

  const setNodeColor = (id, key, value) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n
      )
    );
    setSelectedNode((prev) =>
      prev ? { ...prev, data: { ...prev.data, [key]: value } } : null
    );
  };

  const onUpdateNode = (nodeId, updatedData) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId ? { ...node, data: updatedData } : node
      )
    );

    setSelectedNode((prev) => {
      if (!prev || prev.id !== nodeId) return prev;
      return { ...prev, data: updatedData };
    });
  };
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");

      const reactFlowBounds = event.target.getBoundingClientRect();
      const zoom = 1;

      const position = {
        x: (event.clientX - reactFlowBounds.left) / zoom,
        y: (event.clientY - reactFlowBounds.top) / zoom,
      };

      if (!type) return;

      const id = `${+new Date()}`;

      const mainAttributes = {
        label: type,
        shapeType: type,
        backgroundColor: "#ffffff",
        borderColor: "#000000",
        description: "",
        taskType: "send", // dropdown: send, receive, user, manual, ...
        loopType: "none", // dropdown: none, standard, mi parallel, ...
      };

      const moreAttributes = {
        processId: "",
        auditing: "",
        monitoring: "",
        categories: "",
        startQuantity: "1",
        completionQuantity: "1",
        implementation: "Unspecified", // dropdown
        messageReference: "",
        operationReference: "",
        script: "",
        scriptFormat: "",
        testBefore: false,
        loopCondition: "",
        loopMaximum: "",
        loopCardinality: "",
        loopDataInput: "",
        loopDataOutput: "",
        inputDataItem: "",
        outputDataItem: "",
        behavior: "None",
        complexCondition: "",
        oneBehaviorEventReference: "None", // dropdown
        noneBehaviorEventReference: "None", // dropdown
        operationName: "",
        inMessageName: "",
        inMessageItemKind: "physical",
        inMessageStructure: "",
        inMessageIsCollection: false,
        outMessageName: "",
        outMessageItemKind: "physical",
        outMessageStructure: "",
        outMessageIsCollection: false,
      };

      const newNode = {
        id,
        type,
        position,
        data: {
          mainAttributes,
          moreAttributes,
        },
      };

      undoStack.current.push({ action: "addNode", data: newNode });
      redoStack.current = [];

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params) => {
      const { source, target } = params;

      if (source === target) {
        alert("Cannot connect a node to itself.");
        return;
      }

      const sourceNode = nodes.find((node) => node.id === source);
      const targetNode = nodes.find((node) => node.id === target);

      if (!sourceNode || !targetNode) {
        alert("Invalid connection between nodes.");
        return;
      }

      if (targetNode.type === "Start-event") {
        alert("Not Possible");
        return;
      }
      if (
        sourceNode.type === "end-event" ||
        sourceNode.type === "Terminating-end-event"
      ) {
        alert("Not Possible");
        return;
      }

      // Check for existing connection
      const existingConnection = edges.some(
        (edge) =>
          (edge.source === source && edge.target === target) ||
          (edge.source === target && edge.target === source)
      );

      if (existingConnection) {
        return;
      }

      // Directly finalize the connection with the selected type
      finalizeConnection(params, type);
    },
    [nodes, edges, type] // Add type to the dependency array
  );

  const finalizeConnection = (params, selectedType) => {
    if (!params) return;

    const connectionStyles = {
      "Sequence Flow": {
        type: "smoothstep",
        label: "sequence flow",
        style: { stroke: "black", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
      },
      "Association (undirected)": {
        type: "smoothstep",
        label: "association-undirected",
        style: { stroke: "black", strokeWidth: 1, strokeDasharray: "5,5" },
        markerEnd: null,
      },
      "Association (unidirectional)": {
        type: "smoothstep",
        label: "association-unidirectional",
        style: { stroke: "black", strokeWidth: 1, strokeDasharray: "5,5" },
        markerEnd: { type: MarkerType.Arrow, color: "black" },
      },
      "Association (bidirectional)": {
        type: "smoothstep",
        label: "association-bidirectional",
        style: { stroke: "black", strokeWidth: 1, strokeDasharray: "5,5" },
        markerEnd: { type: MarkerType.Arrow, color: "black" },
        markerStart: { type: MarkerType.Arrow, color: "black" },
      },
      "Message Flow": {
        type: "smoothstep",
        label: "message-flow",
        style: { stroke: "black", strokeWidth: 1, strokeDasharray: "5,5" },
        markerEnd: { type: MarkerType.Arrow, color: "black" },
        markerStart: { type: MarkerType.Circle, color: "black", radius: 3 },
      },
    };

    // Default to Sequence Flow if selectedType is not found
    const connectionStyle =
      connectionStyles[selectedType] || connectionStyles["Sequence Flow"];

    const newEdge = {
      ...params,
      id: `${+new Date()}-edge`,
      type: connectionStyle.type,
      style: connectionStyle.style,
      markerEnd: connectionStyle.markerEnd,
      markerStart: connectionStyle.markerStart,
    };

    undoStack.current.push({ action: "addEdge", data: newEdge });
    redoStack.current = [];
    setEdges((eds) => [...eds, newEdge]);
  };

  const cancelConnection = () => {
    setPendingConnection(null);
    setIsOpenDailogBox(false);
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const undo = () => {
    const lastAction = undoStack.current.pop();
    if (!lastAction) return;
    redoStack.current.push(lastAction);

    switch (lastAction.action) {
      case "deleteNode":
        // Restore the deleted node
        setNodes((nds) => [...nds, lastAction.data]);
        // Restore the connected edges
        if (lastAction.edges && lastAction.edges.length > 0) {
          setEdges((eds) => [...eds, ...lastAction.edges]);
        }
        break;

      case "deleteEdge":
        // Restore the deleted edge
        setEdges((eds) => [...eds, lastAction.data]);
        break;

      case "addNode":
        // Remove the added node
        setNodes((nds) => nds.filter((n) => n.id !== lastAction.data.id));
        // Also remove edges connected to this node if any (optional)
        setEdges((eds) =>
          eds.filter(
            (e) =>
              e.source !== lastAction.data.id && e.target !== lastAction.data.id
          )
        );
        break;

      case "addEdge":
        // Remove the added edge
        setEdges((eds) => eds.filter((e) => e.id !== lastAction.data.id));
        break;

      default:
        break;
    }
  };

  const redo = () => {
    const lastRedoAction = redoStack.current.pop();
    if (!lastRedoAction) return;
    undoStack.current.push(lastRedoAction);

    switch (lastRedoAction.action) {
      case "deleteNode":
        // Re-delete the node
        setNodes((nds) => nds.filter((n) => n.id !== lastRedoAction.data.id));
        // Remove connected edges again
        if (lastRedoAction.edges && lastRedoAction.edges.length > 0) {
          const edgeIdsToRemove = new Set(
            lastRedoAction.edges.map((e) => e.id)
          );
          setEdges((eds) => eds.filter((e) => !edgeIdsToRemove.has(e.id)));
        }
        break;

      case "deleteEdge":
        // Re-delete the edge
        setEdges((eds) => eds.filter((e) => e.id !== lastRedoAction.data.id));
        break;

      case "addNode":
        // Re-add the node
        setNodes((nds) => [...nds, lastRedoAction.data]);
        break;

      case "addEdge":
        // Re-add the edge
        setEdges((eds) => [...eds, lastRedoAction.data]);
        break;

      default:
        break;
    }
  };

  const copyNode = () => {
    if (selectedNode) copiedNodeRef.current = selectedNode;
    // else if (selectedEdge) copiedNodeRef.current = selectedEdge;
  };

  const cutNode = () => {
    if (selectedNode) {
      copiedNodeRef.current = selectedNode;
      deleteNode();
    }
    // else if (selectedEdge) {
    //   copiedNodeRef.current = selectedEdge;
    //   deleteNode();
    // }
  };

  const pasteNode = () => {
    if (!copiedNodeRef.current) return;
    // if (copiedNodeRef.current.source && copiedNodeRef.current.target) {
    //   // it's an edge
    //   const newEdge = {
    //     ...copiedNodeRef.current,
    //     id: `${+new Date()}-edge`,
    //   };
    //   undoStack.current.push({ action: "addEdge", data: newEdge });
    //   redoStack.current = [];
    //   setEdges((eds) => [...eds, newEdge]);
    // }
    // else {
    // it's a node
    const newNode = {
      ...copiedNodeRef.current,
      id: `${+new Date()}`,
      position: {
        x: copiedNodeRef.current.position.x + 50,
        y: copiedNodeRef.current.position.y + 50,
      },
    };
    undoStack.current.push({ action: "addNode", data: newNode });
    redoStack.current = [];
    setNodes((nds) => [...nds, newNode]);
    // }
  };

  const getEdgeStyle = (edge) => {
    return selectedEdge && selectedEdge.id === edge.id
      ? { stroke: "red", strokeWidth: 4 }
      : { stroke: "black", strokeWidth: 2 };
  };

  const styledEdges = edges.map((edge) => ({
    ...edge,
    style: getEdgeStyle(edge),
  }));

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = window.navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
      const key = event.key.toLowerCase();

      // Delete or Backspace triggers deleteNode regardless of ctrl/cmd
      if (key === "delete") {
        if (selectedNode || selectedEdge) {
          event.preventDefault();
          deleteNode();
          return;
        }
      }

      // Handle ctrl/cmd + C, X, V with copyNode, cutNode, pasteNode
      if (!ctrlOrCmd) return; // Only proceed if ctrl or cmd key pressed

      switch (key) {
        case "c":
          if (selectedNode || selectedEdge) {
            event.preventDefault();
            copyNode();
          }
          break;
        case "x":
          if (selectedNode || selectedEdge) {
            event.preventDefault();
            cutNode();
          }
          break;
        case "v":
          event.preventDefault();
          pasteNode();
          break;
        case "z": // Undo
          event.preventDefault();
          undo();
          break;
        case "y": // Redo
          event.preventDefault();
          redo();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedNode,
    selectedEdge,
    copyNode,
    cutNode,
    pasteNode,
    deleteNode,
    undo,
    redo,
  ]);

  const onCanvasClick = useCallback(
    (event) => {
      if (
        event.currentTarget.className === "react-flow__pane draggable" &&
        reactFlowWrapper.current.className === "reactflow-wrapper"
      ) {
        setSelectedNode(null);
        setSelectedEdge(null);
        setIsCanvasSelected(true);

        // Update canvas state with the latest nodes and edges
        setCanvas((prevCanvas) => ({
          ...prevCanvas,
          nodes: nodes, // Update canvas nodes with the latest nodes
          edges: edges, // Update canvas edges with the latest edges
        }));
      }
    },
    [nodes, edges]
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ToolBar
        nodes={nodes}
        edges={edges}
        setFromJson={({ nodes, edges }) => {
          setNodes(nodes);
          setEdges(edges);
          setSelectedNode(null);
        }}
        setIsNewModalOpen={setIsNewModalOpen}
        undo={undo}
        redo={redo}
        selectedNode={selectedNode || selectedEdge}
        setNodeLabel={setNodeLabel}
        copyNode={copyNode}
        cutNode={cutNode}
        pasteNode={pasteNode}
        deleteNode={deleteNode}
        onAddNodeClick={() => setShowSelectNodeDialog(true)}
        canvas={canvas}
        reactFlowWrapper={reactFlowWrapper}
      />
      <div style={{ display: "flex", flex: 1 }}>
        <OptionsTable type={type} setType={setType} />
        <div
          ref={reactFlowWrapper} // Attach ref to the wrapper
          className="reactflow-wrapper"
          style={{ flex: 1, position: "relative" }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onWheel={handleWheel}
        >
          <ReactFlow
            nodes={nodes}
            edges={styledEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onEdgeClick={onEdgeClick}
            onPaneClick={onCanvasClick}
            onNodeContextMenu={onNodeContextMenu}
            fitView
            zoomOnDoubleClick={false}
            zoomOnScroll={false}
          >
            <MiniMap bgColor="#aaa" />
            <Background />
          </ReactFlow>
        </div>
        {isAttributePanelOpen && (
          <AttributePanel
            selectedNode={selectedNode}
            setNodeLabel={setNodeLabel}
            setNodeColor={setNodeColor}
            onUpdateNode={onUpdateNode}
            togglePanel={() => setIsAttributePanelOpen(!isAttributePanelOpen)}
            isCanvasSelected={isCanvasSelected}
            canvas={canvas}
            setCanvas={setCanvas}
          />
        )}
        {!isAttributePanelOpen && (
          <div
            style={{
              width: "30px",
              padding: "10px",
              borderLeft: "1px solid #ccc",
              cursor: "pointer",
            }}
            onClick={() => setIsAttributePanelOpen(true)}
          >
            {"<"}
          </div>
        )}
      </div>

      {isRightClickModalOpen && (
        <NodeClickModal
          selectedNode={selectedNode}
          onUpdateNode={onUpdateNode}
          onClose={() => setIsRightClickModalOpen(false)}
          setNodeLabel={setNodeLabel}
          setNodeColor={setNodeColor}
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          setEdges={setEdges}
        />
      )}
      {isOpenDailogBox && (
        <DailogBox
          onClose={cancelConnection}
          onSelectType={(selectedType) => finalizeConnection(selectedType)}
        />
      )}

      {isNewModalOpen && (
        <NewModal
          edges={edges}
          nodes={nodes}
          canvas={canvas}
          setCanvas={setCanvas}
          onClose={() => setIsNewModalOpen(false)}
          setFromJson={({ nodes, edges }) => {
            setNodes(nodes);
            setEdges(edges);
            setSelectedNode(null);
          }}
        />
      )}
      {showSelectNodeDialog && (
        <SelectNode
          onSelect={handleAddNode}
          onClose={() => setShowSelectNodeDialog(false)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  );
}
