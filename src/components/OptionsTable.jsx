import React, { useState } from "react";
import "./OptionsTable.css";
import { FaFolder, FaChevronDown, FaChevronRight } from "react-icons/fa";
import "bpmn-font/dist/css/bpmn.css";

// const iconMap = {
//   Task: "task",
//   "Event Subprocesses": "subprocess-collapsed",
//   "Data-based Exclusive(XOR) gateway": "gateway-xor",
//   "Start-event": "start-event-compensation",
//   "end-event": "end-event-cancel",
//   "Terminating End Event": "end-event-cancel",
//   "Event-based Gateway": "gateway-eventbased",
//   "Parallel Gateway": "gateway-parallel",
//   "Inclusive Gateway": "gateway-parallel",
//   "Complex Gateway": "gateway-complex",
//   "Collapsed Subprocesses": "subprocess-collapsed",
//   "Expanded Subprocesses": "subprocess-expanded",
//   "Collapsed Event-Subprocesses": "subprocess-collapsed",
// };

// const options = {
//   BPMN: {
//     Activities: [
//       { id: 2, name: "Task" },
//       { id: 6, name: "Event Subprocesses" },
//       { id: 13, name: "Collapsed Subprocesses" },
//       { id: 14, name: "Expanded Subprocesses" },
//       { id: 15, name: "Collapsed Event-Subprocesses" },
//     ],
//     Swimlanes: [
//       //Pool
//       //Collapsed Pool
//       //Lane
//       //Additional Participant
//     ],
//     Artifacts: [
//       //Group
//       //Text Annotation
//       //IT System
//     ],
//     CatchingIntermediateEvents:[
//       //Intermediate Message Event
//       //Intermediate Timer Event
//       //Intermediate Escalation Event
//       //Intermediate Conditional Event
//       //Intermediate Link Event
//       //Intermediate Error Event
//       //Intermediate Cancel Event
//       //Intermediate Compensation Event
//       //Intermediate Signal Event
//       //Intermediate Multiple Event
//       //Intermediate Parallel Multiple Event
//     ],
//     ThrowingIntermediateEvents:[
//       //Intermediate Event
//       //Intermediate Message Event
//       //Intermediate Escalation Event
//       //Intermediate Link Event
//       //Intermediate Compensation Event
//       //Intermediate Signal Event
//       //Intermediate Multiple Event
//     ],
//     Gateways: [
//       { id: 3, name: "Data-based Exclusive(XOR) gateway" },
//       { id: 9, name: "Event-based Gateway" },
//       { id: 10, name: "Parallel Gateway" },
//       { id: 11, name: "Inclusive Gateway" },
//       { id: 12, name: "Complex Gateway" },
//     ],
//     StartEvents: [
//       { id: 5, name: "Start-event" }
//       //Start Message Event
//       //Start Timer Event
//       //Start Escalation Event
//       //Start Conditional Event
//       //Start Error Event
//       //Start Compensation Event
//       //Start Signal Event
//       //start Multiple Event
//       //Start Parallel Multipe Event
//     ],
//     EndEvents: [
//       { id: 4, name: "end-event" },
//       { id: 7, name: "Terminating End Event" },
//       //End Message Event
//       //End Escalation Event
//       //End Error Event
//       //Cancel End Event
//       //End Compensation Event
//       //End Signal Event
//       //End Multiple Event
//     ],
//   },
// };

const iconMap = {
  // Original entries (unchanged)
  Task: "task",
  "Event Subprocesses": "subprocess-event",
  "Data-based Exclusive(XOR) gateway": "gateway-xor", // Retained original name
  "Start-event": "start-event-compensation", // Retained original name
  "end-event": "end-event-cancel", // Retained original name
  "Terminating End Event": "end-event-terminate",
  "Event-based Gateway": "gateway-eventbased",
  "Parallel Gateway": "gateway-parallel",
  "Inclusive Gateway": "gateway-inclusive", // Corrected icon
  "Complex Gateway": "gateway-complex",
  "Collapsed Subprocesses": "subprocess-collapsed",
  "Expanded Subprocesses": "subprocess-expanded",
  "Collapsed Event-Subprocesses": "subprocess-event-collapsed",

  // Added icons for new entries while retaining original names
  Pool: "pool",
  "Collapsed Pool": "pool-collapsed",
  Lane: "lane",
  "Additional Participant": "participant",
  Group: "group",
  "Text Annotation": "text-annotation",
  "IT System": "it-system",
  "Data Object": "data-object",
  "Data Store": "data-store",
  Message: "message",
  "Intermediate Message Event": "intermediate-event-message",
  "Intermediate Timer Event": "intermediate-event-timer",
  "Intermediate Escalation Event": "intermediate-event-escalation",
  "Intermediate Conditional Event": "intermediate-event-condition",
  "Intermediate Link Event": "intermediate-event-link",
  "Intermediate Error Event": "intermediate-event-error",
  "Intermediate Cancel Event": "intermediate-event-cancel",
  "Intermediate Compensation Event": "intermediate-event-compensation",
  "Intermediate Signal Event": "intermediate-event-signal",
  "Intermediate Multiple Event": "intermediate-event-multiple",
  "Intermediate Parallel Multiple Event":
    "intermediate-event-parallel-multiple",
  "Intermediate Event": "intermediate-event-none",
  "Start Message Event": "start-event-message",
  "Start Timer Event": "start-event-timer",
  "Start Escalation Event": "start-event-escalation",
  "Start Conditional Event": "start-event-condition",
  "Start Error Event": "start-event-error",
  "Start Compensation Event": "start-event-compensation",
  "Start Signal Event": "start-event-signal",
  "start Multiple Event": "start-event-multiple", // Retained original name
  "Start Parallel Multipe Event": "start-event-parallel-multiple", // Retained original name
  "End Message Event": "end-event-message",
  "End Escalation Event": "end-event-escalation",
  "End Error Event": "end-event-error",
  "Cancel End Event": "end-event-cancel",
  "End Compensation Event": "end-event-compensation",
  "End Signal Event": "end-event-signal",
  "End Multiple Event": "end-event-multiple",

  // New entries for Connecting Objects
  "Sequence Flow": "sequence-flow",
  "Association (undirected)": "association-undirected",
  "Association (unidirectional)": "association-unidirectional",
  "Association (bidirectional)": "association-bidirectional",
  "Message Flow": "message-flow",
};

const options = {
  BPMN: {
    // Original entries (unchanged)
    Activities: [
      { id: 1, name: "Task" },
      { id: 2, name: "Event Subprocesses" },
      { id: 3, name: "Collapsed Subprocesses" },
      { id: 4, name: "Expanded Subprocesses" },
      { id: 5, name: "Collapsed Event-Subprocesses" },
    ],
    Swimlanes: [
      { id: 6, name: "Pool" },
      { id: 7, name: "Collapsed Pool" },
      { id: 8, name: "Lane" },
      { id: 9, name: "Additional Participant" },
    ],
    Artifacts: [
      { id: 10, name: "Group" },
      { id: 11, name: "Text Annotation" },
      { id: 12, name: "IT System" },
    ],
    DataObjects: [
      { id: 13, name: "Data Object" },
      { id: 14, name: "Data Store" },
      { id: 15, name: "Message" },
    ],
    "Catching Intermediate Events": [
      { id: 16, name: "Intermediate Message Event" },
      { id: 17, name: "Intermediate Timer Event" },
      { id: 18, name: "Intermediate Escalation Event" },
      { id: 19, name: "Intermediate Conditional Event" },
      { id: 20, name: "Intermediate Link Event" },
      { id: 21, name: "Intermediate Error Event" },
      { id: 22, name: "Intermediate Cancel Event" },
      { id: 23, name: "Intermediate Compensation Event" },
      { id: 24, name: "Intermediate Signal Event" },
      { id: 25, name: "Intermediate Multiple Event" },
      { id: 26, name: "Intermediate Parallel Multiple Event" },
    ],
    "Throwing Intermediate Events": [
      { id: 27, name: "Intermediate Event" },
      { id: 28, name: "Intermediate Message Event" },
      { id: 29, name: "Intermediate Escalation Event" },
      { id: 30, name: "Intermediate Link Event" },
      { id: 31, name: "Intermediate Compensation Event" },
      { id: 32, name: "Intermediate Signal Event" },
      { id: 33, name: "Intermediate Multiple Event" },
    ],
    Gateways: [
      { id: 34, name: "Data-based Exclusive(XOR) gateway" }, // Retained original name
      { id: 35, name: "Event-based Gateway" },
      { id: 36, name: "Parallel Gateway" },
      { id: 37, name: "Inclusive Gateway" },
      { id: 38, name: "Complex Gateway" },
    ],
    "Start Events": [
      { id: 39, name: "Start-event" }, // Retained original name
      { id: 40, name: "Start Message Event" },
      { id: 41, name: "Start Timer Event" },
      { id: 42, name: "Start Escalation Event" },
      { id: 43, name: "Start Conditional Event" },
      { id: 44, name: "Start Error Event" },
      { id: 45, name: "Start Compensation Event" },
      { id: 46, name: "Start Signal Event" },
      { id: 47, name: "start Multiple Event" }, // Retained original name
      { id: 48, name: "Start Parallel Multipe Event" }, // Retained original name
    ],
    "End Events": [
      { id: 49, name: "end-event" }, // Retained original name
      { id: 50, name: "Terminating End Event" },
      { id: 51, name: "End Message Event" },
      { id: 52, name: "End Escalation Event" },
      { id: 53, name: "End Error Event" },
      { id: 54, name: "Cancel End Event" },
      { id: 55, name: "End Compensation Event" },
      { id: 56, name: "End Signal Event" },
      { id: 57, name: "End Multiple Event" },
    ],

    // Updated Connecting Objects (fixed typo and added entries)
    "Connecting Objects": [
      { id: 58, name: "Sequence Flow" },
      { id: 59, name: "Association (undirected)" },
      { id: 60, name: "Association (unidirectional)" },
      { id: 61, name: "Association (bidirectional)" },
      { id: 62, name: "Message Flow" },
    ],
  },
};

const OptionsTable = ({ type, setType }) => {
  const [openCategory, setOpenCategory] = useState(null);
  const [openSubCategory, setOpenSubCategory] = useState({});
  const [isOpen, setIsOpen] = useState(true);

  const handleCategoryClick = (category) => {
    setOpenCategory((prev) => (prev === category ? null : category));
  };

  const handleSubCategoryClick = (subCategory) => {
    setOpenSubCategory((prev) => ({
      ...prev,
      [subCategory]: !prev[subCategory],
    }));
  };

  const handleConnectingObjectClick = (objectName) => {
    console.log("Setting type to:", objectName); // Debugging
    setType(objectName); // Update the type using setType prop
  };

  const handleDragStart = (event, option) => {
    event.dataTransfer.setData("application/reactflow", option.name);
    event.dataTransfer.effectAllowed = "move";
  };

  const toggleTable = () => {
    setIsOpen((prev) => !prev);
  };

  if (!isOpen) {
    return (
      <div className="toggle-bar" onClick={toggleTable}>
        <strong className="toggle-label">Modelling Elements</strong>
      </div>
    );
  }

  return (
    <aside className="options-table">
      <div className="options-header">
        <h3 className="title">Shape Repository</h3>
        <button className="toggle-button" onClick={toggleTable}>
          {"<<"}
        </button>
      </div>

      {Object.entries(options).map(([category, subCategories]) => (
        <div key={category} className="category-block">
          <div
            className="category-header"
            onClick={() => handleCategoryClick(category)}
          >
            <FaFolder className="icon-left" />
            <span>{category}</span>
            <span className="chevron-icon">
              {openCategory === category ? (
                <FaChevronDown />
              ) : (
                <FaChevronRight />
              )}
            </span>
          </div>

          {openCategory === category && (
            <div className="subcategory-container">
              {Object.entries(subCategories).map(([sub, items]) => (
                <div key={sub} className="subcategory-block">
                  <div
                    className="subcategory-header"
                    onClick={() => handleSubCategoryClick(sub)}
                  >
                    {openSubCategory[sub] ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronRight />
                    )}
                    <span>{sub}</span>
                  </div>
                  {openSubCategory[sub] && (
                    <div className="option-list">
                      {sub === "Connecting Objects"
                        ? items.map((option) => (
                            <button
                              key={option.id}
                              className={`connecting-object-button ${
                                type === option.name ? "selected" : ""
                              }`}
                              onClick={() =>
                                handleConnectingObjectClick(option.name)
                              }
                            >
                              <span
                                className={`bpmn-icon-${
                                  iconMap[option.name]
                                } icon`}
                              ></span>
                              <span>{option.name}</span>
                            </button>
                          ))
                        : items.map((option) => (
                            <div
                              key={option.id}
                              className="option-item"
                              draggable
                              onDragStart={(e) => handleDragStart(e, option)}
                            >
                              <span
                                className={`bpmn-icon-${
                                  iconMap[option.name]
                                } icon`}
                              ></span>
                              <span>{option.name}</span>
                            </div>
                          ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
};

export default OptionsTable;
