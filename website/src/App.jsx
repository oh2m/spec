import React, { useState, useEffect } from "react";
import FileValidator from "./components/FileValidator";
import PatternExplorer from "./components/PatternExplorer";
import FileGenerator from "./components/FileGenerator";
import { Activity, Shield, FileText, Heart, Compass, PenTool, ExternalLink, Sun, Moon } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("explorer"); // Default to explorer so they see the patterns
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="app-container">
      
      {/* Sleek Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid var(--border-color)",
        marginBottom: "2rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--color-primary-light)",
            border: "1px solid var(--color-primary-border)",
            color: "var(--color-primary)"
          }}>
            <Heart size={20} fill="currentColor" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: "1.2" }}>
              OH2M <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>Open Heart-to-Model</span>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge badge-success" style={{ fontSize: "0.6rem", padding: "1px 6px" }}>
                v0.1.1 Spec Draft
              </span>
              <span style={{ fontSize: "0.7rem", color: "var(--text-light)" }}>
                Apache 2.0 License
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button
            onClick={() => setTheme(prev => prev === "light" ? "dark" : "light")}
            className="btn btn-secondary"
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            style={{
              padding: "0.4rem",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer"
            }}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <a
            href="../OH2M-Specification-v0.1.1.docx"
            download
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", gap: "0.375rem" }}
          >
            <FileText size={14} /> Download Spec (DOCX)
          </a>
          <a
            href="https://github.com/oh2m/spec"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--text-muted)", fontWeight: 500 }}
          >
            GitHub <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* Hero / Intro Section */}
      <section className="card" style={{ marginBottom: "2rem", backgroundColor: "var(--color-primary-light)", borderColor: "var(--color-primary-border)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary-hover)" }}>
          <Activity size={18} /> Personal Health Data for AI — Safely
        </h2>
        <p style={{ color: "var(--text-main)", fontSize: "0.925rem", maxWidth: "800px" }}>
          OH2M is the open standard for personal health and fitness data files. Built on three layers (Open metadata, Masked bit ciphers, and Cryptographic hashes), it allows individuals to feed structured health context directly into LLMs and coaching tools without exposing sensitive raw clinical history.
        </p>
      </section>

      {/* Navigation Tabs */}
      <nav style={{
        display: "flex",
        borderBottom: "1px solid var(--border-color)",
        marginBottom: "2rem",
        gap: "1.5rem"
      }}>
        <button
          onClick={() => setActiveTab("explorer")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 0.25rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
            color: activeTab === "explorer" ? "var(--color-primary)" : "var(--text-muted)",
            borderBottom: "2px solid",
            borderColor: activeTab === "explorer" ? "var(--color-primary)" : "transparent",
            transition: "all var(--transition-fast)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <Compass size={16} /> Pattern Explorer
        </button>
        <button
          onClick={() => setActiveTab("validator")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 0.25rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
            color: activeTab === "validator" ? "var(--color-primary)" : "var(--text-muted)",
            borderBottom: "2px solid",
            borderColor: activeTab === "validator" ? "var(--color-primary)" : "transparent",
            transition: "all var(--transition-fast)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <Shield size={16} /> Validator & Viewer
        </button>
        <button
          onClick={() => setActiveTab("generator")}
          style={{
            background: "none",
            border: "none",
            padding: "0.75rem 0.25rem",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
            color: activeTab === "generator" ? "var(--color-primary)" : "var(--text-muted)",
            borderBottom: "2px solid",
            borderColor: activeTab === "generator" ? "var(--color-primary)" : "transparent",
            transition: "all var(--transition-fast)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <PenTool size={16} /> File Generator
        </button>
      </nav>

      {/* Main Tab Views */}
      <main style={{ flex: 1 }}>
        {activeTab === "explorer" && <PatternExplorer />}
        {activeTab === "validator" && <FileValidator />}
        {activeTab === "generator" && <FileGenerator />}
      </main>

      {/* Premium Footer */}
      <footer style={{
        marginTop: "4rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid var(--border-color)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.8rem",
        color: "var(--text-muted)"
      }}>
        <div>
          © {new Date().getFullYear()} OH2M Standard. Conceived by Jamal Bakari.
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <span>Released under the Apache 2.0 License</span>
          <a href="https://github.com/oh2m/spec/issues" target="_blank" rel="noopener noreferrer">Submit Issue</a>
        </div>
      </footer>

    </div>
  );
}
