import React, { useState, useMemo } from "react";
import patternsData from "../patterns.json";
import { DOMAINS, getQuestion } from "../questionsData";
import { Search, Info, Grid, List, Shield, HelpCircle } from "lucide-react";

export default function PatternExplorer() {
  const [selectedId, setSelectedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list for questions

  // Helper to get domain details
  const getDomainInfo = (id) => {
    return DOMAINS[id] || { name: `Implementer Defined Pattern`, description: `Custom schema defined by the developer/platform.` };
  };

  const selectedPattern = useMemo(() => {
    if (selectedId === 0) {
      return { id: 0, range: "open-reference", fingerprint: "0000000000000000", bits: new Array(256).fill(0) };
    }
    return patternsData.patterns[selectedId.toString()];
  }, [selectedId]);

  // Filter patterns based on search query
  const filteredPatternsList = useMemo(() => {
    const list = [];
    
    // Add Pattern 0
    const p0 = { id: 0, range: "open-reference", fingerprint: "0000000000000000", bits: new Array(256).fill(0) };
    const domain0 = getDomainInfo(0);
    const match0 = 
      "0".includes(searchQuery) ||
      domain0.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain0.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (match0) {
      list.push({ id: 0, ...p0 });
    }

    // 1 to 255
    for (let i = 1; i <= 255; i++) {
      const p = patternsData.patterns[i.toString()];
      if (!p) continue;
      
      const domain = getDomainInfo(i);
      const idStr = i.toString();
      const match = 
        idStr.includes(searchQuery) ||
        domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        domain.description.toLowerCase().includes(searchQuery.toLowerCase());
        
      if (match) {
        list.push({ id: i, ...p });
      }
    }
    return list;
  }, [searchQuery]);

  // Questions layout for the selected pattern
  const selectedQuestions = useMemo(() => {
    if (!selectedPattern) return [];
    
    // selectedPattern.bits is a 256-element array, index 0 is reserved
    return selectedPattern.bits.map((bit, idx) => {
      if (idx === 0) return null;
      return {
        slot: idx,
        bitValue: bit,
        question: getQuestion(selectedId, idx)
      };
    }).filter(Boolean);
  }, [selectedPattern, selectedId]);

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>Pattern Explorer</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Explore the 255 binary patterns defined in the OH2M Layer 2 specification.
        </p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1.25fr", alignItems: "start" }}>
        
        {/* Left Column: Explorer Selector */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "80vh", overflowY: "auto" }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search patterns (e.g. Cardiovascular, 5...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.625rem 1rem 0.625rem 2.25rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                outline: "none"
              }}
            />
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          </div>

          <div>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield size={16} style={{ color: "var(--color-primary)" }} />
              Open Reference Patterns (0–16)
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {filteredPatternsList.filter(p => p.id <= 16).map(p => {
                const domain = getDomainInfo(p.id);
                const isSelected = selectedId === p.id;
                return (
                  <div
                    onClick={() => setSelectedId(p.id)}
                    key={p.id}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid",
                      borderColor: isSelected ? "var(--color-primary)" : "var(--border-color)",
                      backgroundColor: isSelected ? "var(--color-primary-light)" : "transparent",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem", color: isSelected ? "var(--color-primary-hover)" : "inherit" }}>
                        Pattern {p.id}: {domain.name}
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: "0.65rem" }}>
                        open-ref
                      </span>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {domain.description}
                    </p>
                  </div>
                );
              })}
              {filteredPatternsList.filter(p => p.id <= 16).length === 0 && (
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>No open reference patterns match your search.</p>
              )}
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <HelpCircle size={16} style={{ color: "var(--text-muted)" }} />
              Implementer Defined Patterns (17–255)
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Custom patterns for vendor-specific question blocks (e.g. Fitbit, Garmin, clinical systems).
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "0.375rem" }}>
              {Array.from({ length: 239 }, (_, i) => i + 17).map(id => {
                const isSelected = selectedId === id;
                const p = patternsData.patterns[id.toString()];
                
                // If it is filtered out by query
                const isFiltered = !filteredPatternsList.some(item => item.id === id);
                if (isFiltered) return null;

                return (
                  <button
                    key={id}
                    onClick={() => setSelectedId(id)}
                    title={`Pattern ${id} (${p ? 'Generated' : 'Reserved'})`}
                    style={{
                      aspectRatio: "1/1",
                      borderRadius: "4px",
                      border: "1px solid",
                      borderColor: isSelected ? "var(--color-primary)" : "var(--border-color)",
                      backgroundColor: isSelected 
                        ? "var(--color-primary-light)" 
                        : (p ? "var(--border-color)" : "rgba(255, 255, 255, 0.02)"),
                      color: isSelected ? "var(--color-primary)" : "var(--text-muted)",
                      fontSize: "0.7rem",
                      fontWeight: isSelected ? "bold" : "normal",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    {id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Pattern Details */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {selectedPattern ? (
            <>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                    <span className="badge badge-primary" style={{ textTransform: "uppercase" }}>
                      Pattern {selectedId}
                    </span>
                    <span className="badge badge-success" style={{ textTransform: "capitalize", fontSize: "0.7rem" }}>
                      {selectedPattern.range}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 700 }}>
                    {getDomainInfo(selectedId).name}
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {getDomainInfo(selectedId).description}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-light)", textTransform: "uppercase" }}>Fingerprint</span>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {selectedPattern.fingerprint}
                  </div>
                </div>
              </div>

              {/* Bit Grid visualization (16x16) */}
              <div>
                <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Grid size={14} /> 256-Bit Inversion Matrix (16x16 Grid)
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "center", backgroundColor: "var(--bg-app)", padding: "1.25rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(16, minmax(0, 1fr))", gap: "4px", width: "100%", maxWidth: "360px" }}>
                      {selectedPattern.bits.map((bit, idx) => {
                        const isReserved = idx === 0;
                        let bg = "#cbd5e1"; // 0: not inverted (gray)
                        let border = "#94a3b8";
                        let title = `Slot ${idx} (Answer Not Inverted)`;

                        if (isReserved) {
                          bg = "transparent";
                          border = "dashed 1px var(--text-light)";
                          title = "Slot 0 (Reserved)";
                        } else if (bit === 1) {
                          bg = "var(--color-primary)"; // 1: inverted (teal)
                          border = "var(--color-primary-hover)";
                          title = `Slot ${idx} (Answer Inverted)`;
                        }

                        return (
                          <div
                            key={idx}
                            title={title}
                            style={{
                              aspectRatio: "1/1",
                              backgroundColor: bg,
                              border: `1px solid ${border}`,
                              borderRadius: "2px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "8px",
                              cursor: isReserved ? "not-allowed" : "pointer",
                              position: "relative"
                            }}
                          >
                            {isReserved && (
                              <span style={{ color: "var(--text-light)", fontSize: "6px" }}>R</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <div style={{ width: "10px", height: "10px", backgroundColor: "var(--color-primary)", borderRadius: "2px" }}></div>
                      <span>Bit = 1 (Answer Inverted)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <div style={{ width: "10px", height: "10px", backgroundColor: "#cbd5e1", borderRadius: "2px" }}></div>
                      <span>Bit = 0 (Answer Not Inverted)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <div style={{ width: "10px", height: "10px", border: "dashed 1px var(--text-light)", borderRadius: "2px" }}></div>
                      <span>Reserved</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions/Mapping list */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <List size={14} /> Question Slot Definitions
                  </h4>
                  <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "4px", overflow: "hidden" }}>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`btn ${viewMode === "grid" ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "0.25rem 0.5rem", borderRadius: 0, fontSize: "0.75rem" }}
                    >
                      All Slots
                    </button>
                    <button
                      onClick={() => setViewMode("active")}
                      className={`btn ${viewMode === "active" ? "btn-primary" : "btn-secondary"}`}
                      style={{ padding: "0.25rem 0.5rem", borderRadius: 0, fontSize: "0.75rem" }}
                    >
                      Inverted Only (Bit=1)
                    </button>
                  </div>
                </div>

                <div style={{ maxHeight: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.5rem", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.75rem" }}>
                  {selectedQuestions
                    .filter(q => viewMode === "grid" || q.bitValue === 1)
                    .map((q) => {
                      return (
                        <div
                          key={q.slot}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.75rem",
                            padding: "0.5rem",
                            borderRadius: "4px",
                            backgroundColor: q.bitValue === 1 ? "var(--color-primary-light)" : "transparent",
                            borderBottom: "1px solid var(--border-color)"
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "42px" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-light)" }}>
                              SLOT {q.slot}
                            </span>
                            <span
                              className={`badge ${q.bitValue === 1 ? 'badge-success' : 'badge-danger'}`}
                              style={{ fontSize: "0.55rem", padding: "1px 4px", marginTop: "2px" }}
                            >
                              Bit = {q.bitValue}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "var(--text-main)", alignSelf: "center" }}>
                            <div style={{ fontWeight: 500, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1px" }}>
                              {q.bitValue === 1 ? "Inverted" : "Not Inverted"}
                            </div>
                            {q.question}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          ) : (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
              <Info size={32} style={{ margin: "0 auto 1rem", color: "var(--text-light)" }} />
              <p>Pattern not generated or reserved.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
