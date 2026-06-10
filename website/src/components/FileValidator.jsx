import React, { useState, useEffect } from "react";
import { parseOH2M, sha256 } from "../utils/oh2mParser";
import { getQuestion, DOMAINS } from "../questionsData";
import { Upload, AlertCircle, CheckCircle, HelpCircle, FileText, Clipboard, Lock, ExternalLink, Copy, Check, Download } from "lucide-react";

const SAMPLE_VALID_FILE = `---oh2m-v0.1.1---
[LAYER:1]
name: Alex Johnson
date: 2026-06-09
activity: running
distance_miles: 6.21
pace_min_per_mile: 8.44
heart_rate_avg_bpm: 142
goal: sub-51 minute 10k by June 18th
[/LAYER:1]
[LAYER:2]
manifest: 000000000000000000000000000000000000000000000000000000000000000e
chunk: 1  pattern: 1
mask: 000000000000000000000000000000000000000000000000000000000000000e
bits: 101000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  (255 bits)
chunk: 2  pattern: 2
mask: 000000000000000000000000000000000000000000000000000000000000000c
bits: 010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  (255 bits)
chunk: 3  pattern: 3
mask: 000000000000000000000000000000000000000000000000000000000000000c
bits: 010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  (255 bits)
[/LAYER:2]
[LAYER:3]
sha256: 4ac85958e5326ff09f65d698e727faec402f2e4f7408722635528589ae25a8aa
[/LAYER:3]
---oh2m-end---`;

const SAMPLE_TAMPERED_FILE = `---oh2m-v0.1.1---
[LAYER:1]
name: Alex Johnson
date: 2026-06-09
activity: running
[/LAYER:1]
[LAYER:2]
manifest: 0000000000000000000000000000000000000000000000000000000000000000
chunk: 1  pattern: 1
mask: 000000000000000000000000000000000000000000000000000000000000000e
bits: 101000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000  (255 bits)
[/LAYER:2]
---oh2m-end---`;

export default function FileValidator() {
  const [fileText, setFileText] = useState("");
  const [parsedResult, setParsedResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedKeyIndex, setCopiedKeyIndex] = useState(null);

  const handleCopyKey = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyIndex(idx);
    setTimeout(() => setCopiedKeyIndex(null), 2000);
  };

  useEffect(() => {
    // Auto-parse on text change
    if (fileText.trim()) {
      const parsed = parseOH2M(fileText);
      setParsedResult(parsed);
    } else {
      setParsedResult(null);
    }
  }, [fileText]);

  // Load a sample
  const handleLoadSample = (type) => {
    if (type === "valid") {
      setFileText(SAMPLE_VALID_FILE);
    } else if (type === "tampered") {
      setFileText(SAMPLE_TAMPERED_FILE);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleExportJSON = () => {
    if (!parsedResult) return;
    
    const exportData = {
      version: parsedResult.version,
      status: parsedResult.status,
      layer1: parsedResult.layer1,
      layer2: parsedResult.layer2 ? {
        endianness: parsedResult.layer2.endianness,
        declaredManifest: parsedResult.layer2.declaredManifest,
        calculatedManifestMSB: parsedResult.layer2.calculatedManifestMSB,
        calculatedManifestLSB: parsedResult.layer2.calculatedManifestLSB,
        manifestValid: parsedResult.layer2.manifestValid,
        chunks: parsedResult.layer2.chunks.map(chunk => ({
          chunkNumber: chunk.chunkNumber,
          patternId: chunk.patternId,
          maskHex: chunk.maskHex,
          decodedAnswers: chunk.answeredSlots.reduce((acc, slot) => {
            acc[slot] = chunk.decodedValues[slot];
            return acc;
          }, {})
        }))
      } : null,
      layer3: parsedResult.layer3 ? parsedResult.layer3.lines : []
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `decoded_oh2m_${parsedResult.layer1?.name?.toLowerCase().replace(/\s+/g, "_") || "data"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Get validation status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "VALID":
        return (
          <span className="badge badge-success" style={{ gap: "0.25rem", fontSize: "0.85rem", padding: "0.375rem 0.75rem" }}>
            <CheckCircle size={14} /> VALID OH2M FILE
          </span>
        );
      case "SUSPECT":
        return (
          <span className="badge badge-warning" style={{ gap: "0.25rem", fontSize: "0.85rem", padding: "0.375rem 0.75rem" }}>
            <AlertCircle size={14} /> SUSPECT / TAMPERED
          </span>
        );
      case "INVALID":
      default:
        return (
          <span className="badge badge-danger" style={{ gap: "0.25rem", fontSize: "0.85rem", padding: "0.375rem 0.75rem" }}>
            <AlertCircle size={14} /> MALFORMED / INVALID
          </span>
        );
    }
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h2 style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>File Validator & Viewer</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
          Upload or paste an `.oh2m` file to parse and inspect its cryptographic layers.
        </p>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1.1fr 0.9fr", alignItems: "start" }}>
        
        {/* Left Column: Editor and Drag/Drop */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: isDragOver ? "dashed 2px var(--color-primary)" : "dashed 2px var(--border-color)",
              backgroundColor: isDragOver ? "var(--color-primary-light)" : "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all var(--transition-normal)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            <Upload size={32} style={{ color: isDragOver ? "var(--color-primary)" : "var(--text-light)" }} />
            <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              Drag and drop an `.oh2m` file here
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              or click to upload from your computer
            </div>
            <input
              type="file"
              accept=".oh2m,.txt"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="file-upload"
            />
            <label htmlFor="file-upload" className="btn btn-secondary" style={{ marginTop: "0.5rem", fontSize: "0.8rem", padding: "0.5rem 1rem" }}>
              Choose File
            </label>
          </div>

          <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Paste File Content</span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleLoadSample("valid")} className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                  Load Valid Sample
                </button>
                <button onClick={() => handleLoadSample("tampered")} className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", color: "var(--color-danger)" }}>
                  Load Tampered Sample
                </button>
              </div>
            </div>

            <textarea
              value={fileText}
              onChange={(e) => setFileText(e.target.value)}
              placeholder="Paste raw .oh2m file content here..."
              style={{
                width: "100%",
                height: "350px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.825rem",
                padding: "0.75rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                resize: "vertical",
                outline: "none"
              }}
            />
            {fileText && (
              <button
                onClick={() => setFileText("")}
                className="btn btn-secondary"
                style={{ alignSelf: "flex-end", padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Parsed Results Panel */}
        <div className="card" style={{ minHeight: "500px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {parsedResult ? (
            <>
              {/* Validation Status Banner */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-light)", textTransform: "uppercase" }}>File Status</div>
                    <div style={{ marginTop: "0.25rem" }}>
                      {renderStatusBadge(parsedResult.status)}
                    </div>
                  </div>
                  {parsedResult.isValid && (
                    <button
                      onClick={handleExportJSON}
                      className="btn btn-secondary"
                      title="Export decoded layers as JSON file"
                      style={{ padding: "0.35rem 0.6rem", fontSize: "0.7rem", gap: "0.25rem", alignSelf: "flex-end" }}
                    >
                      <Download size={12} /> Export JSON
                    </button>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-light)", textTransform: "uppercase" }}>Format Version</div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>v{parsedResult.version}</div>
                </div>
              </div>

              {/* Error list if invalid/suspect */}
              {parsedResult.errors.length > 0 && (
                <div style={{
                  backgroundColor: parsedResult.status === "SUSPECT" ? "var(--color-warning-light)" : "var(--color-danger-light)",
                  border: `1px solid ${parsedResult.status === "SUSPECT" ? "var(--color-warning-border)" : "var(--color-danger-border)"}`,
                  borderRadius: "var(--radius-sm)",
                  padding: "0.75rem 1rem"
                }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: parsedResult.status === "SUSPECT" ? "var(--color-warning)" : "var(--color-danger)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <AlertCircle size={14} /> Validation Logs ({parsedResult.errors.length})
                  </div>
                  <ul style={{ paddingLeft: "1.25rem", marginTop: "0.375rem", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {parsedResult.errors.map((err, idx) => (
                      <li key={idx} style={{ color: "var(--text-main)" }}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Layer 1 Panel */}
              {parsedResult.layer1 && (
                <div>
                  <h3 style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <FileText size={14} /> Layer 1 — Open Metadata
                  </h3>
                  <div className="scroll-container" style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", textAlign: "left" }}>
                      <thead>
                        <tr style={{ backgroundColor: "var(--bg-app)", borderBottom: "1px solid var(--border-color)" }}>
                          <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Field</th>
                          <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(parsedResult.layer1).map(([key, val]) => (
                          <tr key={key} style={{ borderBottom: "1px solid var(--border-color)" }}>
                            <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--color-primary-hover)" }}>{key}</td>
                            <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-main)" }}>{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Layer 2 Panel */}
              {parsedResult.layer2 && (
                <div>
                  <h3 style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <Clipboard size={14} /> Layer 2 — Masked Cipher Data
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {/* Manifest info */}
                    <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.75rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                        <span style={{ fontWeight: 600 }}>Manifest Status:</span>
                        <span style={{ fontWeight: 700, color: parsedResult.layer2.manifestValid ? "var(--color-success)" : "var(--color-danger)" }}>
                          {parsedResult.layer2.manifestValid ? "VERIFIED CONSISTENT" : "SUSPECT / TAMPERED"}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "1px", fontFamily: "var(--font-mono)" }}>
                        <div>Declared: {parsedResult.layer2.declaredManifest}</div>
                        <div>Calculated (MSB): {parsedResult.layer2.calculatedManifestMSB}</div>
                      </div>
                    </div>

                    {/* Chunks */}
                    {parsedResult.layer2.chunks.map((chunk, idx) => {
                      const domainName = DOMAINS[chunk.patternId]?.name || `Implementer Pattern ${chunk.patternId}`;
                      return (
                        <div key={idx} style={{ border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-main)" }}>
                              Chunk {chunk.chunkNumber}: {domainName} (Pattern {chunk.patternId})
                            </span>
                            <span className="badge badge-success" style={{ fontSize: "0.6rem" }}>
                              {chunk.answeredSlots.length} Answers
                            </span>
                          </div>
                          
                          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                            <div>Mask: {chunk.maskHex.substring(0, 32)}...</div>
                          </div>

                          <div style={{ maxHeight: "150px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.35rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}>
                            {chunk.answeredSlots.map(slot => {
                              const question = getQuestion(chunk.patternId, slot);
                              const val = chunk.decodedValues[slot];
                              return (
                                <div key={slot} style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem", alignItems: "flex-start", backgroundColor: "rgba(13, 148, 136, 0.03)", padding: "4px 6px", borderRadius: "4px" }}>
                                  <span style={{ fontWeight: 700, color: "var(--text-light)", minWidth: "40px" }}>S{slot}</span>
                                  <span className={`badge ${val === 1 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: "0.55rem", padding: "1px 4px", minWidth: "36px", textAlign: "center", justifyContent: "center" }}>
                                    {val === 1 ? "YES" : "NO"}
                                  </span>
                                  <span style={{ color: "var(--text-main)" }}>{question}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Layer 3 Panel */}
              {parsedResult.layer3 && (() => {
                const lines = fileText.split(/\r?\n/);
                const l3Idx = lines.findIndex(l => l.trim() === "[LAYER:3]");
                let payload = "";
                if (l3Idx !== -1) {
                  payload = lines.slice(0, l3Idx).join("\n") + "\n";
                } else {
                  const endIdx = lines.findIndex(l => l.trim() === "---oh2m-end---");
                  if (endIdx !== -1) {
                    payload = lines.slice(0, endIdx).join("\n") + "\n";
                  } else {
                    payload = fileText;
                  }
                }
                const normalizedPayload = payload.replace(/\r\n/g, "\n");

                return (
                  <div>
                    <h3 style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <Lock size={14} /> Layer 3 — Extensible Data & Keys
                    </h3>
                    <div style={{ padding: "0.75rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {parsedResult.layer3.lines.map((line, idx) => {
                        const hasColon = line.includes(":");
                        if (hasColon) {
                          const colonIdx = line.indexOf(":");
                          const key = line.substring(0, colonIdx).trim();
                          const val = line.substring(colonIdx + 1).trim();
                          
                          // 1. Check if it's a hash algorithm
                          const isHash = ["sha256", "sha512", "md5"].includes(key.toLowerCase());
                          if (isHash) {
                            let isMatch = false;
                            let calculated = "";
                            if (key.toLowerCase() === "sha256") {
                              calculated = sha256(normalizedPayload);
                              isMatch = calculated === val.toLowerCase();
                            }
                            
                            return (
                              <div key={idx} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{key}:</span>
                                  {key.toLowerCase() === "sha256" ? (
                                    <span className={`badge ${isMatch ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: "0.6rem", padding: "2px 6px" }}>
                                      {isMatch ? "✓ INTEGRITY VERIFIED" : "⚠ PAYLOAD CHANGED"}
                                    </span>
                                  ) : (
                                    <span className="badge badge-secondary" style={{ fontSize: "0.6rem", padding: "2px 6px" }}>
                                      UNSUPPORTED CHECKSUM
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontFamily: "var(--font-mono)", wordBreak: "break-all", color: "var(--text-main)", fontSize: "0.7rem", backgroundColor: "var(--bg-input)", padding: "0.25rem 0.5rem", borderRadius: "4px", border: "1px solid var(--border-color)" }}>
                                  {val}
                                </div>
                                {key.toLowerCase() === "sha256" && !isMatch && (
                                  <div style={{ fontSize: "0.65rem", color: "var(--color-danger)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                                    Expected: {calculated}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          
                          // 2. Check if it's a URL
                          const isUrl = val.startsWith("http://") || val.startsWith("https://") || key.toLowerCase().endsWith("url") || key.toLowerCase().endsWith("link");
                          if (isUrl) {
                            return (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", alignItems: "center", gap: "1rem" }}>
                                <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{key}:</span>
                                <a
                                  href={val.startsWith("http") ? val : `https://${val}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--color-primary)",
                                    textDecoration: "underline",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    wordBreak: "break-all",
                                    textAlign: "right"
                                  }}
                                >
                                  {val} <ExternalLink size={10} />
                                </a>
                              </div>
                            );
                          }

                          // 3. Check if it looks like a public key, signature or key
                          const isKey = key.toLowerCase().includes("key") || key.toLowerCase().includes("signature") || key.toLowerCase().includes("identity");
                          if (isKey) {
                            const isCopied = copiedKeyIndex === idx;
                            return (
                              <div key={idx} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                    <Lock size={10} /> {key}:
                                  </span>
                                  <button
                                    onClick={() => handleCopyKey(val, idx)}
                                    style={{
                                      border: "none",
                                      background: "none",
                                      color: isCopied ? "var(--color-success)" : "var(--color-primary)",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.2rem",
                                      fontSize: "0.65rem",
                                      fontWeight: 600
                                    }}
                                  >
                                    {isCopied ? <Check size={10} /> : <Copy size={10} />}
                                    {isCopied ? "Copied" : "Copy"}
                                  </button>
                                </div>
                                <pre style={{
                                  margin: 0,
                                  fontFamily: "var(--font-mono)",
                                  fontSize: "0.7rem",
                                  backgroundColor: "var(--bg-input)",
                                  padding: "0.35rem 0.5rem",
                                  borderRadius: "4px",
                                  border: "1px solid var(--border-color)",
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-all",
                                  maxHeight: "80px",
                                  overflowY: "auto"
                                }}>
                                  {val}
                                </pre>
                              </div>
                            );
                          }

                          // 4. Standard Custom Key-Value
                          return (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px", gap: "1rem" }}>
                              <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{key}:</span>
                              <span style={{ fontFamily: "var(--font-mono)", wordBreak: "break-all", textAlign: "right", color: "var(--text-main)" }}>{val}</span>
                            </div>
                          );
                        } else {
                          // Check if raw line is a URL
                          const isUrl = line.startsWith("http://") || line.startsWith("https://");
                          if (isUrl) {
                            return (
                              <div key={idx} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
                                <a
                                  href={line}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    color: "var(--color-primary)",
                                    textDecoration: "underline",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    wordBreak: "break-all"
                                  }}
                                >
                                  {line} <ExternalLink size={10} />
                                </a>
                              </div>
                            );
                          }

                          return (
                            <div key={idx} style={{ fontFamily: "var(--font-mono)", wordBreak: "break-all", borderBottom: "1px solid var(--border-color)", paddingBottom: "2px", color: "var(--text-main)" }}>
                              {line}
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            <div style={{ margin: "auto 0", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              <FileText size={48} style={{ margin: "0 auto 1.25rem", color: "var(--text-light)" }} />
              <div style={{ fontWeight: 600, fontSize: "1.05rem", color: "var(--text-main)", marginBottom: "0.25rem" }}>
                No active report parsed
              </div>
              <p style={{ fontSize: "0.85rem" }}>
                Paste or drop a file in the validator to start decoding.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
