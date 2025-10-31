import React, { useState } from "react";
import "./AttributePanel.css";

const AttributePanel = ({ selectedNode, onUpdateNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMainOpen, setIsMainOpen] = useState(true);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(400);

  const togglePanel = () => setIsOpen(!isOpen);
  const toggleMain = () => setIsMainOpen(!isMainOpen);
  const toggleMore = () => setIsMoreOpen(!isMoreOpen);

  const handleMouseMove = (e) => {
    const newWidth = e.clientX;
    if (newWidth > 100 && newWidth < 600) {
      setPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
  };

  const handleMouseDown = () => {
    document.addEventListener("mousemove", handleMouseMove);
  };

  if (!isOpen) {
    return (
      <div
        className="panel-collapsed"
        onClick={togglePanel}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#e0e0e0")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#f4f4f4")
        }
      >
        <strong className="panel-title">Properties</strong>
      </div>
    );
  }

  if (!selectedNode) {
    return (
      <div className="attribute-panel-signavio" style={{ width: panelWidth }}>
        <div className="panel-header-signavio">
          <h3>Properties</h3>
          <button className="panel-toggle-btn" onClick={togglePanel}>
            {">>"}
          </button>
        </div>
        <p>No node selected.</p>
        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        />
      </div>
    );
  }

  const { id, data } = selectedNode;
  const { mainAttributes = {}, moreAttributes = {} } = data;

  const updateAttr = (section, key, value) => {
    const updatedSection = {
      ...data[section],
      [key]: value,
    };

    onUpdateNode(id, {
      ...data,
      [section]: updatedSection,
    });
  };

  const renderInput = (label, section, key, value) => (
    <div className="attribute-row" key={key}>
      <div>{label}</div>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => updateAttr(section, key, e.target.value)}
      />
    </div>
  );

  const renderTextArea = (label, section, key, value) => (
    <div className="attribute-row" key={key}>
      <div>{label}</div>
      <textarea
        value={value || ""}
        onChange={(e) => updateAttr(section, key, e.target.value)}
      />
    </div>
  );

  const renderDropdown = (label, section, key, value, options) => (
    <div className="attribute-row" key={key}>
      <div>{label}</div>
      <select
        value={value || ""}
        onChange={(e) => updateAttr(section, key, e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCheckbox = (label, section, key, value) => (
    <div className="attribute-row" key={key}>
      <div>{label}</div>
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => updateAttr(section, key, e.target.checked)}
      />
    </div>
  );

  return (
    <div className="attribute-panel-signavio" style={{ width: panelWidth }}>
      <div className="panel-header-signavio">
        <h3>Properties (BPMN-Diagram)</h3>
        <button className="panel-toggle-btn" onClick={togglePanel}>
          {">>"}
        </button>
      </div>

      <div className="panel-content-signavio">
        {/* Main Attributes */}
        <div className="collapsible-section">
          <div className="section-header" onClick={toggleMain}>
            <span>Main attributes</span>
            <span className="collapse-icon">{isMainOpen ? "−" : "+"}</span>
          </div>
          {isMainOpen && (
            <div className="section-content">
              {renderInput(
                "Label",
                "mainAttributes",
                "label",
                mainAttributes.label
              )}
              {renderInput(
                "Description",
                "mainAttributes",
                "description",
                mainAttributes.description
              )}
              {renderDropdown(
                "Task Type",
                "mainAttributes",
                "taskType",
                mainAttributes.taskType,
                [
                  "send",
                  "receive",
                  "user",
                  "manual",
                  "service",
                  "business rule",
                  "script",
                ]
              )}
              {renderDropdown(
                "Loop Type",
                "mainAttributes",
                "loopType",
                mainAttributes.loopType,
                ["none", "standard", "mi parallel", "mi sequential"]
              )}
              <div className="attribute-row">
                <div>Background Color</div>
                <div
                  className="color-box"
                  style={{ backgroundColor: mainAttributes.color || "#000" }}
                ></div>
                <input
                  type="color"
                  value={mainAttributes.color || "#000000"}
                  onChange={(e) =>
                    updateAttr("mainAttributes", "color", e.target.value)
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* More Attributes */}
        <div className="collapsible-section">
          <div className="section-header" onClick={toggleMore}>
            <span>More attributes</span>
            <span className="collapse-icon">{isMoreOpen ? "−" : "+"}</span>
          </div>
          {isMoreOpen && (
            <div className="section-content">
              {renderInput(
                "Process ID",
                "moreAttributes",
                "processId",
                moreAttributes.processId
              )}
              {renderTextArea(
                "Auditing",
                "moreAttributes",
                "auditing",
                moreAttributes.auditing
              )}
              {renderTextArea(
                "Monitoring",
                "moreAttributes",
                "monitoring",
                moreAttributes.monitoring
              )}
              {renderInput(
                "Categories",
                "moreAttributes",
                "categories",
                moreAttributes.categories
              )}
              {renderInput(
                "Start Quantity",
                "moreAttributes",
                "startQuantity",
                moreAttributes.startQuantity
              )}
              {renderInput(
                "Completion Quantity",
                "moreAttributes",
                "completionQuantity",
                moreAttributes.completionQuantity
              )}

              {renderDropdown(
                "Implementation",
                "moreAttributes",
                "implementation",
                moreAttributes.implementation,
                [
                  "HumanTaskWebService",
                  "BusinessRuleWebService",
                  "WebService",
                  "Other",
                  "Unspecified",
                ]
              )}

              {renderInput(
                "Message Reference",
                "moreAttributes",
                "messageReference",
                moreAttributes.messageReference
              )}
              {renderInput(
                "Operation Reference",
                "moreAttributes",
                "operationReference",
                moreAttributes.operationReference
              )}
              {renderInput(
                "Script",
                "moreAttributes",
                "script",
                moreAttributes.script
              )}
              {renderInput(
                "Script Format",
                "moreAttributes",
                "scriptFormat",
                moreAttributes.scriptFormat
              )}
              {renderCheckbox(
                "Test Before",
                "moreAttributes",
                "testBefore",
                moreAttributes.testBefore
              )}
              {renderInput(
                "Loop Condition",
                "moreAttributes",
                "loopCondition",
                moreAttributes.loopCondition
              )}
              {renderInput(
                "Loop Maximum",
                "moreAttributes",
                "loopMaximum",
                moreAttributes.loopMaximum
              )}
              {renderInput(
                "Loop Cardinality",
                "moreAttributes",
                "loopCardinality",
                moreAttributes.loopCardinality
              )}
              {renderInput(
                "Loop Data Input",
                "moreAttributes",
                "loopDataInput",
                moreAttributes.loopDataInput
              )}
              {renderInput(
                "Loop Data Output",
                "moreAttributes",
                "loopDataOutput",
                moreAttributes.loopDataOutput
              )}
              {renderInput(
                "Input Data Item",
                "moreAttributes",
                "inputDataItem",
                moreAttributes.inputDataItem
              )}
              {renderInput(
                "Output Data Item",
                "moreAttributes",
                "outputDataItem",
                moreAttributes.outputDataItem
              )}

              {renderDropdown(
                "Behavior",
                "moreAttributes",
                "behavior",
                moreAttributes.behavior,
                ["None", "One", "All", "Complex"]
              )}

              {renderInput(
                "Complex Condition",
                "moreAttributes",
                "complexCondition",
                moreAttributes.complexCondition
              )}

              {renderDropdown(
                "One Behavior Event Reference",
                "moreAttributes",
                "oneBehaviorEventReference",
                moreAttributes.oneBehaviorEventReference,
                [
                  "None",
                  "Message",
                  "Escalation",
                  "Error",
                  "Cancel",
                  "Compensation",
                  "Signal",
                  "Terminate",
                ]
              )}

              {renderDropdown(
                "None Behavior Event Reference",
                "moreAttributes",
                "noneBehaviorEventReference",
                moreAttributes.noneBehaviorEventReference,
                [
                  "None",
                  "Message",
                  "Escalation",
                  "Error",
                  "Cancel",
                  "Compensation",
                  "Signal",
                  "Terminate",
                ]
              )}

              {renderInput(
                "Operation Name",
                "moreAttributes",
                "operationName",
                moreAttributes.operationName
              )}
              {renderInput(
                "In Message Name",
                "moreAttributes",
                "inMessageName",
                moreAttributes.inMessageName
              )}

              {renderDropdown(
                "In Message Item Kind",
                "moreAttributes",
                "inMessageItemKind",
                moreAttributes.inMessageItemKind,
                ["physical", "information"]
              )}

              {renderInput(
                "In Message Structure",
                "moreAttributes",
                "inMessageStructure",
                moreAttributes.inMessageStructure
              )}
              {renderCheckbox(
                "In Message Is Collection",
                "moreAttributes",
                "inMessageIsCollection",
                moreAttributes.inMessageIsCollection
              )}

              {renderInput(
                "Out Message Name",
                "moreAttributes",
                "outMessageName",
                moreAttributes.outMessageName
              )}
              {renderDropdown(
                "Out Message Item Kind",
                "moreAttributes",
                "outMessageItemKind",
                moreAttributes.outMessageItemKind,
                ["physical", "information"]
              )}
              {renderInput(
                "Out Message Structure",
                "moreAttributes",
                "outMessageStructure",
                moreAttributes.outMessageStructure
              )}
              {renderCheckbox(
                "Out Message Is Collection",
                "moreAttributes",
                "outMessageIsCollection",
                moreAttributes.outMessageIsCollection
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className="resize-handle"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};

export default AttributePanel;
