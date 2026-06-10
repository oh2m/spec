# Self-Critique: Ticket 03 — Spec Amendment: Appendix A

1. **Contract Distinction**: The appendix clearly establishes that patterns 1–16 are bound by the community-ratified static-question contract, whereas patterns 17–255 can employ any arbitrary encoding (like hashes, path traversals, or timelines) defined by the implementer.
2. **Worked Examples Distinctness**: The three worked examples are distinct in their mechanics: Example 1 uses the 256 bits as a flat cryptographic hash pointer, Example 2 uses the bits as state-dependent traversal choices (decision tree), and Example 3 uses structured packing ( Unix timestamp + event codes). None of them collapse into each other.
3. **Position 0 Clarity**: The explanation of position 0 explicitly states that implementer-defined patterns (17–255) are free to utilize bit position 0, since the position 0 reservation is purely a static-question convention.
4. **Spec Tension**: No tension is created with the main body of the spec; instead, it resolves potential confusion by clearly demarcating static-question rules (like mask semantics and V-flags) as properties of patterns 1–16, rather than universal requirements for Layer 2.
5. **Number of Examples**: Three examples are sufficient to show the diversity of encodings (pointers, dynamic questionnaire traversal, and packed timelines) without cluttering the specification.
