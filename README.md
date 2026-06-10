# OH2M — Open Heart-to-Model

**The open standard for personal health data files designed for humans, apps, and AI.**

> *Your health data, on your terms.*

---

## What is an Open Heart File?

An Open Heart File (`.oh2m`) is a simple, portable file that carries your personal health and fitness data. Open it in a text editor and you can read it. Hand it to an AI and it can coach you. Share just the parts you want to share — and protect the rest.

It is built on three layers:

```
---oh2m-v0.1.1---
[LAYER:1]
name: Alex Johnson
date: 2026-04-03
activity: running
distance_miles: 6.21
pace_min_per_mile: 8.44
heart_rate_avg_bpm: 142
goal: sub-51 minute 10k by April 18th
[/LAYER:1]
[LAYER:2]
manifest: 0000000000000000480000000000000000000000000000000000000000000000
chunk: 1  pattern: 3
mask: FFA300B2C14400000000000000000000000000000000000000000000000000000000
bits: 00100000000000000001000...  (255 bits)
[/LAYER:2]
---oh2m-end---
```

**Layer 1 — Open.** Human readable. LLM readable. Your activity, metrics, goals. Anyone can read this.

**Layer 2 — Cipher.** 255-bit binary chunks. Each chunk declares a pattern and a mask. The pattern is open — the questions are yours. The mask tells the importer which slots were answered and which to ignore. A casual scraper sees noise. A legitimate reader with the question key sees meaning.

**Layer 3 — Hash.** Full cryptography. Genetics, prescriptions, medical history. One key per person. Bitcoin wallet-level protection. OH2M defines the container — you choose the cryptography.

---

## Why OH2M?

Every existing health data standard was designed for hospitals and databases.

OH2M is designed for **individuals, AI tools, and the people who build them.**

- A fitness app exports your data as an Open Heart File
- You hand it to any LLM — Claude, GPT, Gemini, a local model
- The LLM reads Layer 1 and coaches you immediately
- It can reference Layer 2 context without ever seeing your raw sensitive data
- Layer 3 stays locked unless you explicitly share the key

No platform lock-in. No scraping. No giving a company permission to train on your medical history. **Your file. Your data. Your terms.**

---

## The Architecture

### Layer 2 — How It Works

Every Layer 2 block starts with a **manifest** — a 64 hex character / 256-bit field declaring which patterns are present. If the manifest doesn't match the actual chunks, the file is flagged **SUSPECT**. Tampering is indicated.

Every chunk declares a **mask** — a 64 hex character / 256-bit field indicating which of the 255 question slots are being answered. A masked-out slot is ignored entirely regardless of its bit value. This resolves the difference between a genuine "no" answer and an unanswered question.

Every field in Layer 2 is **256 bits / 64 hex characters**, position 0 always reserved. One rule, applied everywhere. Inspired by IPv4. Questions are numbered 1–255, with Question N stored exactly at bit position N. Position 0 is reserved.

Question definitions may include a V flag indicating storage inversion; this lets question authors keep natural question phrasing while controlling bit polarity. See spec Section 4.8 for details.

### Patterns 1–16 — OH2M Open Reference
Community-ratified questions covering health and fitness. **Any reader with this spec can decode them.** 16 patterns × 255 bits = 4,080 open questions across:

| Pattern | Domain |
|---------|--------|
| 1 | Cardiovascular |
| 2 | Metabolic |
| 3 | Musculoskeletal |
| 4 | Respiratory |
| 5 | Mental Health |
| 6 | Reproductive |
| 7 | Nutrition & Diet |
| 8 | Substances |
| 9 | Recent Medical Activity |
| 10 | Demographics & Context |
| 11 | Fitness History |
| 12 | Recovery & Sleep |
| 13 | Environmental |
| 14 | Genetics & Family History |
| 15 | Immunological |
| 16 | Reserved — community proposals welcome |

### Patterns 17–255 — Implementer Defined
Garmin, Fitbit, hospitals, anyone. Use any question set you want. Publish it openly, version it monthly, or keep it private. OH2M takes no position. The standard carries the bits.

---

## For Implementers

### Writing an `.oh2m` file

1. Start with `---oh2m-v0.1.1---`
2. Write Layer 1 as `key: value` pairs
3. If including Layer 2: write the manifest, then chunks with pattern, mask, and bits
4. Optionally add a Layer 3 hash block
5. End with `---oh2m-end---`

### Reading an `.oh2m` file

- Layer 1 is always plain text — no decoding needed
- Read the Layer 2 manifest first — verify chunks match
- Chunks with patterns 1–16 decode with this spec
- Chunks with patterns 17–255 need the sender's question key
- Mask bit 0 = ignore that slot entirely regardless of bit value
- Layer 3 needs the implementer's cryptographic key
- Partial decoding is valid — skip what you can't decode

### Using with an LLM

Pass the Layer 1 section directly. The LLM has everything it needs to provide meaningful fitness coaching, goal tracking, and trend analysis from Layer 1 alone. Share your Layer 2 question key and it can factor in protected health context too.

---

## Specification

📄 **[OH2M Specification v0.1.1](./OH2M-Specification-v0.1.1.docx)** — The full technical spec. File format, layer definitions, pattern architecture, manifest, mask, cipher system, governance.

🔢 **[patterns.json](./patterns.json)** — All 255 patterns as data. Load this to implement OH2M.

🖼️ **[open-reference-preview.png](./open-reference-preview.png)** — Visual preview of the 16 open reference patterns.

📦 **[patterns-oh2m-v0.1.zip](./patterns-oh2m-v0.1.zip)** — All 255 pattern PNG files.

---

## Open Reference Questions

The 4,080 open reference questions for patterns 1–16 are maintained at [`/open-questions`](./open-questions). All questions are **DRAFT** pending community ratification before v1.0.

This is the most important open contribution right now. If you have expertise in any of the 16 domains — open an issue or submit a pull request.

---

## Status

| Item | Status |
|------|--------|
| Specification | v0.1.1 Draft |
| Patterns 1–255 | Generated — permanent |
| Open reference questions (patterns 1–16) | Draft — community ratification needed |
| Reference implementation | Coming soon |
| Website | oh2m.org |
| License | Apache 2.0 |

---

## Contributing

The spec lives here. Questions, corrections, and proposals go in [Issues](../../issues). Pull requests welcome.

See [`/open-questions`](./open-questions) for the current working drafts of the 4,080 open reference questions.

---

## License

Apache 2.0. Use it, build on it, extend it.

---

## A Note

This standard was conceived after a run by one person who wanted better AI coaching without giving away sensitive health data.

It turns out that problem — personal health data flowing safely into AI — is unsolved. This is one attempt at a clean answer. Built with AI, designed for AI, given freely to the world.

If OH2M has helped you or your project, you're welcome to [buy me a coffee](https://buymeacoffee.com/jamalbakari). It's never expected and always appreciated.

---

*OH2M — Open Heart-to-Model — oh2m.org — github.com/oh2m/spec*
