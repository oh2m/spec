import React, { useState, useEffect, useMemo } from "react";
import { generateOH2M, sha256 } from "../utils/oh2mParser";
import { DOMAINS, getQuestion } from "../questionsData";
import { Clipboard, Download, Plus, Trash2, Check, Sparkles, Sliders, Upload } from "lucide-react";

export default function FileGenerator() {
  const [endianness, setEndianness] = useState("MSB");
  
  // Layer 1 Predefined State
  const [l1Data, setL1Data] = useState({
    name: "Alex Johnson",
    date: new Date().toISOString().split('T')[0],
    activity: "running",
    distance_miles: "6.21",
    pace_min_per_mile: "8.44",
    heart_rate_avg_bpm: "142",
    goal: "sub-51 minute 10k by next month"
  });

  // Layer 1 Custom Fields State (extensible metadata)
  const [customL1Fields, setCustomL1Fields] = useState([
    { key: "weight_lbs", value: "172" },
    { key: "blood_pressure", value: "118/76" }
  ]);

  // Layer 2 State (list of active chunks)
  const [chunks, setChunks] = useState([
    {
      patternId: 1, // Cardiovascular
      answers: {
        "1": { answered: true, value: 1 }, // Family history
        "2": { answered: true, value: 0 }, // Hypertension
        "3": { answered: true, value: 1 }  // Heart attack
      }
    }
  ]);

  // Layer 3 State (extensible line list of structured objects)
  // The sha256 value starts empty and is auto-filled by the payload-sync
  // effect below — a hardcoded constant can never be correct here because
  // the default Layer 1 includes today's date (fixed 2026-06-10).
  const [l3Lines, setL3Lines] = useState([
    { id: "1", type: "hash", key: "sha256", value: "" }
  ]);
  const [includeL3, setIncludeL3] = useState(true);

  const [copied, setCopied] = useState(false);

  // Parse questions for active chunks
  const getChunkQuestionsList = (patternId) => {
    const questions = [];
    for (let slot = 1; slot <= 15; slot++) {
      questions.push({
        slot,
        questionText: getQuestion(patternId, slot)
      });
    }
    return questions;
  };

  // Generate output file text
  const generatedFileText = useMemo(() => {
    const layer3 = includeL3 ? l3Lines : [];
    
    // Combine predefined and custom fields
    const combinedL1 = { ...l1Data };
    customL1Fields.forEach(f => {
      if (f.key.trim()) {
        combinedL1[f.key.trim()] = f.value;
      }
    });

    return generateOH2M(combinedL1, chunks, layer3, endianness);
  }, [l1Data, customL1Fields, chunks, l3Lines, includeL3, endianness]);

  // Hash of the Layer 1+2 payload (the file WITHOUT Layer 3, up to but not
  // including the ---oh2m-end--- line — same boundary the validator uses).
  // Depends only on payload inputs, never on l3Lines, so syncing the hash
  // into l3Lines below cannot loop.
  const payloadHash = useMemo(() => {
    const combinedL1 = { ...l1Data };
    customL1Fields.forEach(f => {
      if (f.key.trim()) {
        combinedL1[f.key.trim()] = f.value;
      }
    });
    const fileWithoutL3 = generateOH2M(combinedL1, chunks, [], endianness);
    const lines = fileWithoutL3.split(/\r?\n/);
    const endIdx = lines.findIndex(l => l.trim() === "---oh2m-end---");
    const payload = endIdx !== -1 ? lines.slice(0, endIdx).join("\n") + "\n" : fileWithoutL3;
    return sha256(payload.replace(/\r\n/g, "\n"));
  }, [l1Data, customL1Fields, chunks, endianness]);

  // Keep sha256 hash lines in sync with the payload automatically, so the
  // generated file always carries a verifiable integrity hash (added
  // 2026-06-10; previously a stale hardcoded hash shipped in every file
  // until the user clicked Recalculate).
  useEffect(() => {
    setL3Lines(prev => {
      let changed = false;
      const next = prev.map(line => {
        if (line.type === "hash" && line.key === "sha256" && line.value !== payloadHash) {
          changed = true;
          return { ...line, value: payloadHash };
        }
        return line;
      });
      return changed ? next : prev;
    });
  }, [payloadHash]);

  // Handle Layer 1 Input Changes
  const handleL1Change = (e) => {
    const { name, value } = e.target;
    setL1Data(prev => ({ ...prev, [name]: value }));
  };

  // Custom Fields Actions
  const handleAddCustomField = () => {
    setCustomL1Fields(prev => [...prev, { key: "", value: "" }]);
  };

  const handleRemoveCustomField = (index) => {
    setCustomL1Fields(prev => prev.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setCustomL1Fields(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Layer 3 Actions
  const handleAddL3Line = () => {
    setL3Lines(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        type: "kv",
        key: "",
        value: ""
      }
    ]);
  };

  const handleRemoveL3Line = (index) => {
    setL3Lines(prev => prev.filter((_, i) => i !== index));
  };

  const handleL3LineChange = (index, field, value) => {
    setL3Lines(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      
      // Auto-fill typical keys based on type select
      if (field === "type") {
        if (value === "hash") {
          copy[index].key = "sha256";
        } else if (value === "url") {
          copy[index].key = "keys_url";
        } else if (value === "key") {
          copy[index].key = "public_key";
        } else if (value === "raw") {
          copy[index].key = "";
        } else if (value === "kv") {
          copy[index].key = "";
        }
      }
      return copy;
    });
  };

  // Auto-calculate SHA-256 of payload (Layers 1 and 2)
  const handleAutoCalculateHash = (index) => {
    const combinedL1 = { ...l1Data };
    customL1Fields.forEach(f => {
      if (f.key.trim()) {
        combinedL1[f.key.trim()] = f.value;
      }
    });
    
    const fileWithoutL3 = generateOH2M(combinedL1, chunks, [], endianness);
    
    // The payload is everything up to the ---oh2m-end--- line
    const lines = fileWithoutL3.split(/\r?\n/);
    const endIdx = lines.findIndex(l => l.trim() === "---oh2m-end---");
    let payload = "";
    if (endIdx !== -1) {
      payload = lines.slice(0, endIdx).join("\n") + "\n";
    } else {
      payload = fileWithoutL3;
    }
    
    // Normalize newlines
    const normalizedPayload = payload.replace(/\r\n/g, "\n");
    const calculatedHash = sha256(normalizedPayload);
    
    handleL3LineChange(index, "value", calculatedHash);
  };

  // Add Chunk
  const handleAddChunk = () => {
    // Find first unused open-reference pattern id
    const existingIds = chunks.map(c => c.patternId);
    let nextId = 1;
    for (let i = 1; i <= 16; i++) {
      if (!existingIds.includes(i)) {
        nextId = i;
        break;
      }
    }
    if (nextId > 16) nextId = existingIds.length + 1; // Fallback

    setChunks(prev => [...prev, { patternId: nextId, answers: {} }]);
  };

  // Remove Chunk
  const handleRemoveChunk = (index) => {
    setChunks(prev => prev.filter((_, i) => i !== index));
  };

  // Update Chunk Pattern ID
  const handleChunkPatternChange = (index, patternId) => {
    setChunks(prev => {
      const copy = [...prev];
      copy[index] = {
        patternId: parseInt(patternId, 10),
        answers: {} // Clear answers when pattern changes
      };
      return copy;
    });
  };

  // Toggle/Update Answer
  const handleAnswerToggle = (chunkIndex, slot, field, value) => {
    setChunks(prev => {
      const copy = [...prev];
      const chunk = copy[chunkIndex];
      const slotStr = slot.toString();
      
      const current = chunk.answers[slotStr] || { answered: false, value: 0 };
      
      if (field === "answered") {
        chunk.answers[slotStr] = {
          ...current,
          answered: value
        };
      } else if (field === "value") {
        chunk.answers[slotStr] = {
          ...current,
          value: value ? 1 : 0
        };
      }
      
      return copy;
    });
  };

  // Copy to Clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedFileText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download File
  const handleDownload = () => {
    const blob = new Blob([generatedFileText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `health_data_${l1Data.name.toLowerCase().replace(/\s+/g, "_")}.oh2m`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        
        // 1. Layer 1
        if (imported.layer1) {
          const newL1 = { ...l1Data };
          const customFields = [];
          
          Object.entries(imported.layer1).forEach(([k, v]) => {
            if (k in newL1) {
              newL1[k] = v;
            } else {
              customFields.push({ key: k, value: String(v) });
            }
          });
          
          setL1Data(newL1);
          setCustomL1Fields(customFields);
        }

        // 2. Layer 2
        if (imported.layer2 && Array.isArray(imported.layer2.chunks)) {
          const newChunks = imported.layer2.chunks.map(chunk => {
            const answers = {};
            if (chunk.decodedAnswers) {
              Object.entries(chunk.decodedAnswers).forEach(([slot, val]) => {
                answers[slot] = { answered: true, value: val === 1 ? 1 : 0 };
              });
            }
            return {
              patternId: parseInt(chunk.patternId, 10) || 1,
              answers
            };
          });
          setChunks(newChunks);
        }

        // 3. Layer 3
        if (imported.layer3 && Array.isArray(imported.layer3)) {
          const newL3Lines = imported.layer3.map((line, idx) => {
            if (typeof line === "string") {
              const hasColon = line.includes(":");
              if (hasColon) {
                const colonIdx = line.indexOf(":");
                const k = line.substring(0, colonIdx).trim();
                const v = line.substring(colonIdx + 1).trim();
                
                let type = "kv";
                if (["sha256", "sha512", "md5"].includes(k.toLowerCase())) type = "hash";
                else if (k.toLowerCase().endsWith("url") || k.toLowerCase().endsWith("link") || v.startsWith("http")) type = "url";
                else if (k.toLowerCase().includes("key") || k.toLowerCase().includes("signature")) type = "key";
                
                return {
                  id: String(idx + 1),
                  type,
                  key: k,
                  value: v
                };
              } else {
                return {
                  id: String(idx + 1),
                  type: "raw",
                  key: "",
                  value: line
                };
              }
            } else if (line && typeof line === "object") {
              return {
                id: line.id || String(idx + 1),
                type: line.type || "kv",
                key: line.key || "",
                value: line.value || ""
              };
            }
            return null;
          }).filter(Boolean);
          
          setL3Lines(newL3Lines);
          setIncludeL3(true);
        }
        
        alert("Configuration imported successfully!");
      } catch (err) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>File Generator</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Build custom, valid `.oh2m` file datasets with an interactive form UI.
          </p>
        </div>
        <div>
          <input
            type="file"
            accept=".json"
            id="import-json-config"
            onChange={handleImportJSON}
            style={{ display: "none" }}
          />
          <label
            htmlFor="import-json-config"
            className="btn btn-secondary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.8rem", gap: "0.375rem", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
          >
            <Upload size={14} /> Import JSON Config
          </label>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr", alignItems: "start" }}>
        
        {/* Left Column: Form Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          {/* Settings & Endianness */}
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <Sliders size={16} style={{ color: "var(--color-primary)" }} /> Encoding Parameters
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Binary Bit Indexing:</span>
              <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                <button
                  onClick={() => setEndianness("MSB")}
                  className={`btn ${endianness === "MSB" ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "0.35rem 0.75rem", borderRadius: 0, fontSize: "0.75rem" }}
                >
                  MSB (Big Endian - Default)
                </button>
                <button
                  onClick={() => setEndianness("LSB")}
                  className={`btn ${endianness === "LSB" ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "0.35rem 0.75rem", borderRadius: 0, fontSize: "0.75rem" }}
                >
                  LSB (Little Endian)
                </button>
              </div>
            </div>
          </div>

          {/* Layer 1 Form */}
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Layer 1: Plain-Text Metadata</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>Subject Name</label>
                  <input
                    type="text"
                    name="name"
                    value={l1Data.name}
                    onChange={handleL1Change}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={l1Data.date}
                    onChange={handleL1Change}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", outline: "none" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>Activity</label>
                  <input
                    type="text"
                    name="activity"
                    value={l1Data.activity}
                    onChange={handleL1Change}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>Distance (miles)</label>
                  <input
                    type="text"
                    name="distance_miles"
                    value={l1Data.distance_miles}
                    onChange={handleL1Change}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>Pace (min/mile)</label>
                  <input
                    type="text"
                    name="pace_min_per_mile"
                    value={l1Data.pace_min_per_mile}
                    onChange={handleL1Change}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", outline: "none" }}
                  />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>Avg Heart Rate (BPM)</label>
                  <input
                    type="text"
                    name="heart_rate_avg_bpm"
                    value={l1Data.heart_rate_avg_bpm}
                    onChange={handleL1Change}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>Fitness Goal</label>
                  <input
                    type="text"
                    name="goal"
                    value={l1Data.goal}
                    onChange={handleL1Change}
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", outline: "none" }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px dashed var(--border-color)", margin: "1rem 0" }}></div>
              
              {/* Custom Extensible Fields */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Custom Extensible Fields</h4>
                  <button 
                    type="button"
                    onClick={handleAddCustomField} 
                    className="btn btn-secondary" 
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem", gap: "0.25rem" }}
                  >
                    <Plus size={12} /> Add Field
                  </button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {customL1Fields.map((field, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="Key (e.g. weight_lbs)"
                        value={field.key}
                        onChange={(e) => handleCustomFieldChange(idx, "key", e.target.value)}
                        style={{ flex: 1, padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.8rem", outline: "none", fontFamily: "var(--font-mono)" }}
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 175)"
                        value={field.value}
                        onChange={(e) => handleCustomFieldChange(idx, "value", e.target.value)}
                        style={{ flex: 1.5, padding: "0.4rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.8rem", outline: "none" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomField(idx)}
                        style={{ border: "none", background: "none", color: "var(--color-danger)", cursor: "pointer", padding: "0.25rem" }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {customL1Fields.length === 0 && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-light)", fontStyle: "italic" }}>
                      No custom metadata fields defined. Click "Add Field" to extend.
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Layer 2 Form Chunks */}
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Layer 2: Cipher Chunks</h3>
              <button onClick={handleAddChunk} className="btn btn-primary" style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem", gap: "0.25rem" }}>
                <Plus size={14} /> Add Chunk
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {chunks.map((chunk, cIdx) => {
                const questionsList = getChunkQuestionsList(chunk.patternId);
                return (
                  <div
                    key={cIdx}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-sm)",
                      padding: "1rem",
                      backgroundColor: "var(--bg-app)",
                      position: "relative"
                    }}
                  >
                    <button
                      onClick={() => handleRemoveChunk(cIdx)}
                      title="Remove Chunk"
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem",
                        border: "none",
                        background: "none",
                        color: "var(--color-danger)",
                        cursor: "pointer"
                      }}
                    >
                      <Trash2 size={16} />
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", width: "85%" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Chunk {cIdx + 1}:</span>
                      <select
                        value={chunk.patternId}
                        onChange={(e) => handleChunkPatternChange(cIdx, e.target.value)}
                        style={{
                          padding: "0.35rem",
                          borderRadius: "4px",
                          border: "1px solid var(--border-color)",
                          fontSize: "0.85rem",
                          outline: "none",
                          backgroundColor: "var(--bg-input)"
                        }}
                      >
                        {Object.entries(DOMAINS).map(([idStr, domain]) => (
                          <option key={idStr} value={idStr}>
                            Pattern {idStr}: {domain.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Question check grids */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
                        Select active slots and define answers (subject to pattern inversion):
                      </span>
                      <div style={{ maxHeight: "200px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.375rem", backgroundColor: "var(--bg-input)", padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)" }}>
                        {questionsList.map((q) => {
                          const slotStr = q.slot.toString();
                          const state = chunk.answers[slotStr] || { answered: false, value: 0 };
                          return (
                            <div key={q.slot} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.25rem", borderBottom: "1px solid var(--border-color)", fontSize: "0.75rem" }}>
                              <input
                                type="checkbox"
                                checked={state.answered}
                                onChange={(e) => handleAnswerToggle(cIdx, q.slot, "answered", e.target.checked)}
                                style={{ cursor: "pointer" }}
                                id={`c-${cIdx}-s-${q.slot}`}
                              />
                              <span style={{ fontWeight: 600, color: state.answered ? "var(--text-main)" : "var(--text-light)", minWidth: "24px" }}>S{q.slot}</span>
                              <label htmlFor={`c-${cIdx}-s-${q.slot}`} style={{ flex: 1, cursor: "pointer", color: state.answered ? "inherit" : "var(--text-light)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {q.questionText}
                              </label>
                              {state.answered && (
                                <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                                  <button
                                    onClick={() => handleAnswerToggle(cIdx, q.slot, "value", true)}
                                    className={`btn ${state.value === 1 ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: "0.15rem 0.35rem", fontSize: "0.6rem", borderRadius: 0 }}
                                  >
                                    YES (1)
                                  </button>
                                  <button
                                    onClick={() => handleAnswerToggle(cIdx, q.slot, "value", false)}
                                    className={`btn ${state.value === 0 ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ padding: "0.15rem 0.35rem", fontSize: "0.6rem", borderRadius: 0 }}
                                  >
                                    NO (0)
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
              {chunks.length === 0 && (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "1rem" }}>
                  No cipher chunks active. Add a chunk above.
                </p>
              )}
            </div>
          </div>

          {/* Layer 3 Form */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1.1rem" }}>Layer 3: Cryptography & Extensible Info</h3>
              <input
                type="checkbox"
                checked={includeL3}
                onChange={(e) => setIncludeL3(e.target.checked)}
                id="include-l3-checkbox"
                style={{ cursor: "pointer" }}
              />
            </div>
            
            {includeL3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Extensible Layer 3 Lines (Hashes, Keys, Links)</span>
                  <button
                    type="button"
                    onClick={handleAddL3Line}
                    className="btn btn-secondary"
                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem", gap: "0.25rem" }}
                  >
                    <Plus size={12} /> Add Line
                  </button>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {l3Lines.map((item, idx) => (
                    <div key={item.id || idx} style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      padding: "0.75rem",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      backgroundColor: "var(--bg-app)"
                    }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        {/* Type Dropdown */}
                        <select
                          value={item.type}
                          onChange={(e) => handleL3LineChange(idx, "type", e.target.value)}
                          style={{
                            padding: "0.35rem",
                            borderRadius: "4px",
                            border: "1px solid var(--border-color)",
                            fontSize: "0.75rem",
                            backgroundColor: "var(--bg-input)",
                            outline: "none",
                            fontWeight: 500
                          }}
                        >
                          <option value="hash">Cryptographic Hash</option>
                          <option value="url">Web Link / URL</option>
                          <option value="key">Public Key / Identity</option>
                          <option value="kv">Custom Key-Value</option>
                          <option value="raw">Arbitrary Raw Line</option>
                        </select>

                        <div style={{ flex: 1 }}></div>

                        {/* Action buttons (Delete) */}
                        <button
                          type="button"
                          onClick={() => handleRemoveL3Line(idx)}
                          title="Remove Line"
                          style={{ border: "none", background: "none", color: "var(--color-danger)", cursor: "pointer", padding: "0.25rem" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Render inputs based on type */}
                      {item.type === "hash" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <select
                              value={item.key}
                              onChange={(e) => handleL3LineChange(idx, "key", e.target.value)}
                              style={{
                                padding: "0.35rem",
                                borderRadius: "4px",
                                border: "1px solid var(--border-color)",
                                fontSize: "0.75rem",
                                backgroundColor: "var(--bg-input)",
                                outline: "none",
                                fontFamily: "var(--font-mono)"
                              }}
                            >
                              <option value="sha256">sha256</option>
                              <option value="sha512">sha512</option>
                              <option value="md5">md5</option>
                            </select>
                            <input
                              type="text"
                              placeholder="Checksum value (64-char hex for sha256)"
                              value={item.value}
                              onChange={(e) => handleL3LineChange(idx, "value", e.target.value)}
                              style={{ flex: 1, padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.75rem", outline: "none", fontFamily: "var(--font-mono)" }}
                            />
                          </div>
                          {item.key === "sha256" && (
                            <button
                              type="button"
                              onClick={() => handleAutoCalculateHash(idx)}
                              className="btn btn-secondary"
                              style={{
                                padding: "0.25rem 0.5rem",
                                fontSize: "0.7rem",
                                alignSelf: "flex-start",
                                backgroundColor: "rgba(13, 148, 136, 0.08)",
                                border: "1px solid rgba(13, 148, 136, 0.2)",
                                color: "var(--color-primary-hover)",
                                cursor: "pointer"
                              }}
                            >
                              ✨ Auto-Calculate SHA-256
                            </button>
                          )}
                        </div>
                      )}

                      {item.type === "url" && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <input
                            type="text"
                            placeholder="Key Name (e.g. keys_url)"
                            value={item.key}
                            onChange={(e) => handleL3LineChange(idx, "key", e.target.value)}
                            style={{ flex: 0.4, padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.75rem", outline: "none", fontFamily: "var(--font-mono)" }}
                          />
                          <input
                            type="text"
                            placeholder="https://example.com/keys"
                            value={item.value}
                            onChange={(e) => handleL3LineChange(idx, "value", e.target.value)}
                            style={{ flex: 1, padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.75rem", outline: "none" }}
                          />
                        </div>
                      )}

                      {item.type === "key" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                          <input
                            type="text"
                            placeholder="Identifier (e.g. pgp_key or public_key)"
                            value={item.key}
                            onChange={(e) => handleL3LineChange(idx, "key", e.target.value)}
                            style={{ padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.75rem", outline: "none", fontFamily: "var(--font-mono)" }}
                          />
                          <textarea
                            placeholder="Paste key content here..."
                            value={item.value}
                            onChange={(e) => handleL3LineChange(idx, "value", e.target.value)}
                            style={{ height: "60px", padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.75rem", outline: "none", fontFamily: "var(--font-mono)", resize: "vertical" }}
                          />
                        </div>
                      )}

                      {item.type === "kv" && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <input
                            type="text"
                            placeholder="Key"
                            value={item.key}
                            onChange={(e) => handleL3LineChange(idx, "key", e.target.value)}
                            style={{ flex: 1, padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.75rem", outline: "none", fontFamily: "var(--font-mono)" }}
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => handleL3LineChange(idx, "value", e.target.value)}
                            style={{ flex: 1.5, padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.75rem", outline: "none" }}
                          />
                        </div>
                      )}

                      {item.type === "raw" && (
                        <input
                          type="text"
                          placeholder="Arbitrary unstructured line content..."
                          value={item.value}
                          onChange={(e) => handleL3LineChange(idx, "value", e.target.value)}
                          style={{ padding: "0.35rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)", fontSize: "0.75rem", outline: "none" }}
                        />
                      )}
                    </div>
                  ))}
                  {l3Lines.length === 0 && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-light)", fontStyle: "italic" }}>
                      No lines defined. Click "Add Line" to extend Layer 3.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Code Generator Preview */}
        <div className="card" style={{ position: "sticky", top: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
            <div>
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Sparkles size={16} style={{ color: "var(--color-primary)" }} /> Live output preview
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Generates valid .oh2m markup structure.</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleCopyToClipboard}
                className={`btn ${copied ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", gap: "0.25rem" }}
              >
                {copied ? <Check size={14} /> : <Clipboard size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-primary"
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem", gap: "0.25rem" }}
              >
                <Download size={14} /> Download
              </button>
            </div>
          </div>

          <pre style={{
            margin: 0,
            padding: "1rem",
            backgroundColor: "var(--bg-app)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            overflowX: "auto",
            height: "550px",
            fontSize: "0.775rem",
            color: "var(--text-main)",
            lineHeight: "1.4"
          }}>
            {generatedFileText}
          </pre>
        </div>

      </div>
    </div>
  );
}
