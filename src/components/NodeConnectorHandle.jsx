import React from "react";
import "./NodeConnectorHandle.css";
import { Position, useConnection } from "@xyflow/react";
import { Handle } from "@xyflow/react";
const NodeConnectorHandle = ({ isTarget }) => {
  console.log("here");
  const connection = useConnection();

  return (
    <div className="customNodeBody">
      {!connection.inProgress && (
        <Handle
          className="customHandle"
          position={Position.Right}
          type="source"
        />
      )}

      {(!connection.inProgress || isTarget) && (
        <Handle
          className="customHandle"
          position={Position.Left}
          type="target"
          isConnectableStart={false}
        />
      )}
    </div>
  );
};

export default NodeConnectorHandle;
