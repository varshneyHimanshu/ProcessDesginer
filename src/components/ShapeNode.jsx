import React, { useEffect, useRef, useState } from "react";
import { Handle, useUpdateNodeInternals } from "@xyflow/react";
import { debounce } from "lodash";
import { Position, useConnection } from "@xyflow/react";
import NodeConnectorHandle from "./NodeConnectorHandle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./ShapeNode.css";
import { FaBackward } from "react-icons/fa";
import { render } from "@testing-library/react";

const ShapeNode = ({ id, data, selected }) => {
  // const {
  //   label = "",s
  //   shapeType = "Task",
  //   width = 120,
  //   height = 80,
  //   color = "#FFFFCC",
  //   onLabelClick,
  // } = data;
  const { mainAttributes = {}, moreAttributes = {} } = data;

  // From mainAttributes, destructure required props
  const {
    label = "",
    shapeType = "Task",
    width = 120,
    height = 80,
    color = "#FFFFCC",
    onLabelClick,
  } = mainAttributes;

  const connection = useConnection();
  const isTarget = connection.inProgress && connection.fromNode.id !== id;

  const updateNodeInternals = useUpdateNodeInternals();
  const debouncedUpdateNodeInternals = debounce(updateNodeInternals, 200);
  const [nodeSize, setNodeSize] = useState({ width, height });
  const [isHovered, setIsHovered] = useState(false);
  const [isStartEvent, setIsStartEvent] = useState(false);
  const [isEndEvent, setIsEndEvent] = useState(false);
  const [isTerminatingEvent, setIsTerminatingEvent] = useState(false);

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  useEffect(() => {
    console.log(shapeType);
    if (shapeType === "Start-event") {
      setIsStartEvent(true);
    } else if (shapeType === "end-event") {
      setIsEndEvent(true);
    } else if (shapeType === "Terminating End Event") {
      setIsTerminatingEvent(true);
    }
  }, [shapeType]);

  const getPentagonPoints = (cx, cy, radius) => {
    const points = [];
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Start from the top
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  const getHandlePosition = (type) => {
    if (connection.inProgress) {
      const isSource = type === "source";
      const node = isSource ? connection.fromNode : connection.toNode;
      const handle = isSource ? connection.fromHandle : connection.toHandle;

      if (node?.id === id && handle?.position) {
        return handle.position;
      }
    }
    return type === "source" ? Position.Right : Position.Left;
  };

  const renderShape = () => {
    let { width, height } = nodeSize;
    const gradientId = "taskGradient";
    width = width - 10;
    height = height - 10;
    const diamondPoints = `${width / 2},0 ${width},${height / 2} ${
      width / 2
    },${height} 0,${height / 2}`;
    const crossLength = 15;
    const crossOffset = 20;

    const r = Math.min(width, height) / 2.5;
    const cx = width / 2;
    const cy = height / 2;

    const innerR = r * 0.8;

    const triangleSize = innerR * 0.8; // Adjust size relative to inner circle
    const trianglePoints = `${cx},${cy - triangleSize} ${cx + triangleSize},${
      cy + triangleSize / 2
    } ${cx - triangleSize},${cy + triangleSize / 2}`;

    const pentagonSize = innerR * 0.8; // Pentagon ka size adjust karna
    const angle = (2 * Math.PI) / 5; // 5 sides ke liye angle calculation

    const pentagonPoints = Array.from({ length: 5 })
      .map((_, i) => {
        const x = cx + pentagonSize * Math.cos(i * angle - Math.PI / 2);
        const y = cy + pentagonSize * Math.sin(i * angle - Math.PI / 2);
        return `${x},${y}`;
      })
      .join(" ");

    const renderDoubleCircle = (children) => (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="white"
          stroke="black"
          strokeWidth={1}
        />
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          fill="white"
          stroke="black"
          strokeWidth={1}
        />
        {children}
      </g>
    );
    switch (shapeType) {
      case "Task":
        return (
          <>
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                {/* gradient from a lighter color to the main color */}
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="100%" stopColor={color} stopOpacity="1" />
              </linearGradient>
            </defs>
            <rect
              width={width}
              height={height}
              rx={20}
              ry={20}
              fill={`url(#${gradientId})`}
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`} // Added highlight class here
            />
          </>
        );
      case "Event Subprocesses":
        return (
          <rect
            width={width}
            height={height}
            rx={20}
            ry={20}
            // fill={shapeType === "Task" ? "#FFFFCC" : "white"}
            fill="white"
            stroke="black"
            strokeWidth="2"
            strokeDasharray="5,5"
            className={`shape-node ${selected ? "highlight" : ""}`}
          />
        );

      case "Pool":
        const leftSectionWidth = width * 0.3; // 30% of the width for the left section
        const rightSectionWidth = width - leftSectionWidth; // Remaining 70% for the right section

        return (
          <>
            {/* Main Rectangle */}
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="white" // Background color
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />

            {/* Vertical Divider (slightly to the left) */}
            <line
              x1={leftSectionWidth} // Position of the vertical line
              y1={0}
              x2={leftSectionWidth}
              y2={height}
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
          </>
        );

      case "Collapsed Pool":
        return (
          <>
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="white" // Background color
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
          </>
        );

      case "Lane":
        return (
          <rect
            width={width}
            height={height}
            fill="lightgreen"
            stroke="black"
            strokeWidth="2"
            className={`shape-node ${selected ? "highlight" : ""}`}
          />
        );

      case "Additional Participant":
        return (
          <polygon
            points={diamondPoints}
            fill="lightcoral"
            stroke="black"
            strokeWidth="2"
            className={`shape-node ${selected ? "highlight" : ""}`}
          />
        );

      case "Group":
        return (
          <rect
            width={width}
            height={height}
            fill="lightyellow"
            stroke="black"
            strokeWidth="2"
            rx={10}
            className={`shape-node ${selected ? "highlight" : ""}`}
          />
        );

      case "Text Annotation":
        return (
          <rect
            width={width}
            height={height}
            fill="white"
            stroke="black"
            strokeWidth="2"
            rx={5}
            className={`shape-node ${selected ? "highlight" : ""}`}
          />
        );

      case "IT System":
        return (
          <rect
            width={width}
            height={height}
            fill="lightgray"
            stroke="black"
            strokeWidth="2"
            className={`shape-node ${selected ? "highlight" : ""}`}
          />
        );

      case "Data Object":
        return (
          <polygon
            points={diamondPoints}
            fill="lightpink"
            stroke="black"
            strokeWidth="2"
            className={`shape-node ${selected ? "highlight" : ""}`}
          />
        );

      case "Data Store":
        return (
          <>
            <polygon
              points={diamondPoints}
              fill="lightcyan"
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            <line
              x1={width / 2 - 10}
              y1={height / 2 + 20}
              x2={width / 2 + 10}
              y2={height / 2 + 20}
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
          </>
        );

      case "Message":
        const arrowPoints = `${width},${height / 2} ${width - 20},${
          height / 2 - 10
        } ${width - 20},${height / 2 + 10}`;
        return (
          <>
            <rect
              width={width - 20}
              height={height}
              fill="white"
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            <polygon
              points={arrowPoints}
              fill="black"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
          </>
        );
      case "Collapsed Subprocesses":
        return (
          <g>
            <rect
              width={width}
              height={height}
              rx={20}
              ry={20}
              // fill="#FFFFCC"
              fill={color}
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            {/* Square with plus sign at the bottom edge */}
            <rect
              x={width / 2 - 10} // Centering the square horizontally
              y={height - 21} // Positioning the square 30 units from the bottom
              width={20}
              height={20}
              rx={20}
              ry={20}
              // fill="#FFFFCC"
              fill={color}
              stroke="black"
              strokeWidth="1"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            <text
              x={width / 2} // Centering the square horizontally
              y={height - 3} // Centering the plus sign vertically in the square
              textAnchor="middle"
              fill="black"
              fontSize="25"
              fontWeight="bold"
              className={`shape-node ${selected ? "highlight" : ""}`}
            >
              +
            </text>
          </g>
        );

      case "Expanded Subprocesses":
        return (
          <rect
            width={width}
            height={height}
            rx={20}
            ry={20}
            fill="white"
            stroke="black"
            strokeWidth="2"
            className={`shape-node ${selected ? "highlight" : ""}`}
          />
        );

      case "Collapsed Event-Subprocesses":
        return (
          <g>
            <rect
              width={width}
              height={height}
              rx={20}
              ry={20}
              fill="white"
              stroke="black"
              strokeWidth="2"
              strokeDasharray="5,5"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            {/* Hollow circle for the mail icon */}
            <circle
              cx={14}
              cy={14}
              r={8} // Outer radius for the hollow circle
              fill="none"
              stroke="black"
              strokeWidth="1"
            />
            {/* Envelope icon positioned inside the circle */}

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="10" // Adjust width to fit inside the circle
              height="10" // Adjust height to fit inside the circle
              x={9} // Centering the SVG horizontally within the circle
              y={9} // Centering the SVG vertically within the circle
            >
              <path d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
            </svg>

            <rect
              x={width / 2 - 10} // Centering the square horizontally
              y={height - 21} // Positioning the square 30 units from the bottom
              width={20}
              height={20}
              fill="white"
              stroke="black"
              strokeWidth="1"
            />
            <text
              x={width / 2} // Centering the plus sign horizontally
              y={height - 3} // Centering the plus sign vertically in the square
              textAnchor="middle"
              fill="black"
              fontSize="25"
              fontWeight="bold"
            >
              +
            </text>
          </g>
        );
      case "Data-based Exclusive(XOR) gateway":
        return (
          <svg width={width} height={height}>
            <polygon
              points={`${width / 2},0 ${width},${height / 2} ${
                width / 2
              },${height} 0,${height / 2}`}
              // fill="#e3da0e"
              fill={color}
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            {/* Cross (X) in the middle */}
            <line
              x1={width / 2 - crossLength}
              y1={height / 2 - crossOffset}
              x2={width / 2 + crossLength}
              y2={height / 2 + crossOffset}
              stroke="black"
              strokeWidth="5"
            />
            <line
              x1={width / 2 - crossLength}
              y1={height / 2 + crossOffset}
              x2={width / 2 + crossLength}
              y2={height / 2 - crossOffset}
              stroke="black"
              strokeWidth="5"
            />
          </svg>
        );
      case "Event-based Gateway":
        return (
          <g>
            <polygon
              points={diamondPoints}
              fill="white"
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            <circle
              cx={width / 2}
              cy={height / 2}
              r={Math.min(width, height) / 3} // Hollow circle
              fill="none"
              stroke="black"
              strokeWidth="2"
            />
            {/* Pentagon inside the circle */}
            <polygon
              points={getPentagonPoints(
                width / 2,
                height / 2,
                (Math.min(width, height) / 3) * 0.8
              )} // Adjust size to fit inside the circle
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
          </g>
        );

      case "Parallel Gateway":
        return (
          <g>
            <polygon
              points={diamondPoints}
              fill="white"
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            {/* Vertical part of the plus sign */}
            <rect
              x={width / 2 - 2} // Centered vertical rectangle
              y={height / 2 - height / 2 + 15} // Start from the top edge with some spacing
              width={4} // Thinner width for the vertical part
              height={height - 30} // Height of the vertical part to leave space from edges
              fill="black"
            />
            {/* Horizontal part of the plus sign */}
            <rect
              x={15} // Start from the left edge with some spacing
              y={height / 2 - 2} // Centered horizontal rectangle
              width={width - 30} // Width of the horizontal part to leave space from edges
              height={4} // Thinner height for the horizontal part
              fill="black"
            />
          </g>
        );

      case "Inclusive Gateway":
        return (
          <g>
            <polygon
              points={diamondPoints}
              fill="white"
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            <circle
              cx={width / 2}
              cy={height / 2}
              r={Math.min(width, height) / 3} // Hollow circle
              fill="none"
              stroke="black"
              strokeWidth="2"
            />
          </g>
        );

      case "Complex Gateway":
        return (
          <g>
            <polygon
              points={diamondPoints}
              fill="white"
              stroke="black"
              strokeWidth="2"
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            {/* Simple star shape made of lines */}
            <g fill="none" stroke="black" strokeWidth="2">
              {/* Lines forming the star */}
              <line
                x1={width / 2}
                y1={height / 2 - 15}
                x2={width / 2}
                y2={height / 2 + 15}
              />{" "}
              // Vertical line
              <line
                x1={width / 2 - 15}
                y1={height / 2}
                x2={width / 2 + 15}
                y2={height / 2}
              />{" "}
              // Horizontal line
              <line
                x1={width / 2 - 10.5}
                y1={height / 2 - 10.5}
                x2={width / 2 + 10.5}
                y2={height / 2 + 10.5}
              />{" "}
              // Diagonal line \
              <line
                x1={width / 2 + 10.5}
                y1={height / 2 - 10.5}
                x2={width / 2 - 10.5}
                y2={height / 2 + 10.5}
              />{" "}
              // Diagonal line /
            </g>
          </g>
        );
      case "Start-event":
        return (
          <g>
            <circle
              cx={cx + 27}
              cy={cy - 2}
              r={r}
              fill="white"
              stroke="black"
              strokeWidth={
                shapeType === "end-event"
                  ? 3
                  : shapeType === "Terminating End Event"
                  ? 4
                  : 1
              }
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            {shapeType === "Terminating End Event" && (
              <circle cx={cx} cy={cy} r={r / 1.6} fill="black" />
            )}
          </g>
        );

      case "Intermediate Message Event":
        return (
          <g>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="white"
              stroke="black"
              strokeWidth={1}
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="40" // Adjust width to fit inside the circle
              height="40" // Adjust height to fit inside the circle
              x={35}
              y={15}
            >
              <path d="M64 112c-8.8 0-16 7.2-16 16l0 22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1l0-22.1c0-8.8-7.2-16-16-16L64 112zM48 212.2L48 384c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-171.8L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128z" />
            </svg>
          </g>
        );

      case "Intermediate Timer Event":
        return renderDoubleCircle(
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="50"
            height="50"
            x={cx - 25}
            y={cy - 25}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
          </svg>
        );

      case "Intermediate Escalation Event":
        return renderDoubleCircle(
          <polygon
            points={trianglePoints}
            fill="black"
            stroke="black"
            strokeWidth={1}
          />
        );

      case "Intermediate Conditional Event":
        const lineSpacing = innerR * 0.3;
        const yStart = cy - innerR + lineSpacing / 2;

        return renderDoubleCircle(
          <>
            <line
              x1={cx - innerR}
              y1={yStart}
              x2={cx + innerR}
              y2={yStart}
              stroke="black"
              strokeWidth={2}
            />
            <line
              x1={cx - innerR}
              y1={yStart + lineSpacing}
              x2={cx + innerR}
              y2={yStart + lineSpacing}
              stroke="black"
              strokeWidth={2}
            />
            <line
              x1={cx - innerR}
              y1={yStart + lineSpacing * 2}
              x2={cx + innerR}
              y2={yStart + lineSpacing * 2}
              stroke="black"
              strokeWidth={2}
            />
          </>
        );

      case "Intermediate Link Event":
        const arrowSize = innerR * 0.8; // Increased size for a larger horizontal arrow
        const shaftLength = arrowSize * 1.2; // Extend the shaft length
        const headSize = arrowSize / 1.5; // Size of the triangle head

        const arrowPath = `
        M -18 0 
        L ${shaftLength} 0 
        M ${shaftLength} 0 
        L ${shaftLength - headSize} ${headSize} 
        L ${shaftLength - headSize} -${headSize} 
        Z
      `;

        return renderDoubleCircle(
          <g transform={`translate(${cx}, ${cy})`}>
            <path d={arrowPath} fill="none" stroke="black" strokeWidth={2} />
          </g>
        );

      case "Intermediate Event":
        return renderDoubleCircle();

      case "Intermediate Error Event":
        return renderDoubleCircle(
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="50"
            height="50"
            x={cx - 25}
            y={cy - 25}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
          </svg>
        );

      case "Intermediate Cancel Event":
        return renderDoubleCircle(
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="50"
            height="50"
            x={cx - 25}
            y={cy - 25}
          >
            {/* Cross */}
            <path
              d="M16 8L8 16M8 8L16 16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );

      case "Intermediate Compensation Event":
        return renderDoubleCircle(
          // <FontAwesomeIcon icon="fa-solid fa-backward" />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="10 10 912 912"
            style={{ paddingLeft: "90px" }}
          >
            <path d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3l0 41.7 0 41.7L459.5 440.6zM256 352l0-96 0-128 0-32c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-64z" />
          </svg>
        );

      case "Intermediate Signal Event":
        return renderDoubleCircle(
          <polygon
            points={trianglePoints}
            fill="white"
            stroke="black"
            strokeWidth={1}
          />
        );

      case "Intermediate Multiple Event":
        return renderDoubleCircle(
          <polygon
            points={pentagonPoints}
            fill="white"
            stroke="black"
            strokeWidth={1}
          />
        );

      case "Intermediate Parallel Multiple Event":
        return renderDoubleCircle(
          <>
            {/* Hollow Plus */}
            <g stroke="black" strokeWidth="2" fill="black">
              {/* Vertical Line */}
              <rect
                x={cx - 5}
                y={cy - innerR * 0.5}
                width="10"
                height={innerR}
              />
              {/* Horizontal Line */}
              <rect
                x={cx - innerR * 0.5}
                y={cy - 5}
                width={innerR}
                height="10"
              />
            </g>
          </>
        );

      case "end-event":
        // const r = Math.min(width, height) / 2.5;
        // const cx = width / 2;
        // const cy = height / 2;
        return (
          <g>
            <circle
              cx={cx - 26}
              cy={cy - 2}
              r={r}
              fill="white"
              stroke="black"
              strokeWidth={
                shapeType === "end-event"
                  ? 3
                  : shapeType === "Terminating End Event"
                  ? 4
                  : 1
              }
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            {shapeType === "Terminating End Event" && (
              <circle cx={cx} cy={cy} r={r / 1.6} fill="black" />
            )}
          </g>
        );
      case "Terminating End Event":
        // const r = Math.min(width, height) / 2.5;
        // const cx = width / 2;
        // const cy = height / 2;
        return (
          <g>
            <circle
              cx={cx - 25}
              cy={cy - 2}
              r={r}
              fill="white"
              stroke="black"
              strokeWidth={
                shapeType === "end-event"
                  ? 3
                  : shapeType === "Terminating End Event"
                  ? 4
                  : 1
              }
              className={`shape-node ${selected ? "highlight" : ""}`}
            />
            {shapeType === "Terminating End Event" && (
              <circle cx={cx - 25} cy={cy - 2} r={r / 1.6} fill="black" />
            )}
          </g>
        );

      default:
        return (
          <rect
            width={width}
            height={height}
            fill="gray"
            stroke="black"
            strokeWidth="10"
          />
        );
    }
  };

  return (
    <div
      style={{
        width: nodeSize.width + 10,
        height: nodeSize.height + 10,
        alignContent: "center",
      }}
      className={`node-container ${selected ? "selected" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width={nodeSize.width - 10} height={nodeSize.height - 10}>
        {renderShape()}
      </svg>

      <Handle
        className={`customHandle ${selected ? "source-visible" : ""}`}
        position={Position.Right}
        type="source"
        isConnectable={true}
        style={{
          width: nodeSize.width - 10,
          height: nodeSize.height - 10,
        }}
      />

      {/* Target handle: always visible */}
      <Handle
        className="customHandle"
        position={Position.Left}
        type="target"
        isConnectableStart={false}
        style={{
          width: nodeSize.width - 10,
          height: nodeSize.height - 10,
        }}
      />

      {isStartEvent && (
        <div
          style={{
            textAlign: "center",
            marginLeft: "40px",
          }}
        >
          {label}
        </div>
      )}
      {isEndEvent && (
        <div
          style={{
            width: "100px",
            textAlign: "center",
            marginLeft: "-18px",
          }}
        >
          {label}
        </div>
      )}
      {isTerminatingEvent && (
        <div
          style={{
            width: "100px",
            textAlign: "center",
            marginLeft: "-18px",
          }}
        >
          {label}
        </div>
      )}
      {!isStartEvent && !isEndEvent && !isTerminatingEvent && (
        <div className="label">{label}</div>
      )}
    </div>
  );
};

export default ShapeNode;
