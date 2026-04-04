# OH2M — Open Heart-to-Model

**The open standard for personal health data files designed for humans, apps, and AI.**

> *Your health data, on your terms.*

---

## What is an Open Heart File?

An Open Heart File (`.oh2m`) is a simple, portable file that carries your personal health and fitness data. Open it in a text editor and you can read it. Hand it to an AI and it can coach you. Share just the parts you want to share — and protect the rest.

It is built on three layers:

```
---oh2m-v0.1---
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
chunk: 1  pattern: 3
bits: 00100000000000000...  (255 bits — protected health context)
[/LAYER:2]
---oh2m-end---
```

**Layer 1 — Open.** Human readable. LLM readable. Your activity, metrics, goals. Anyone can read this.

**Layer 2 — Cipher.** 255-bit binary chunks. The pattern is open. The questions are yours. Garmin can use pattern 42. Fitbit can use pattern 42 with completely different questions. The standard carries the bits — you own the meaning.

**Layer 3 — Hash.** Full cryptography. Genetics, prescriptions, medical history. One key per person. A breach of one file reveals nothing about anyone else.

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

### Patterns 1–16 — OH2M Open Reference
Community-ratified questions covering health and fitness. **Any reader with this spec can decode them.** 16 patterns × 255 bits = 4,080 open questions across:

| Pattern | Domain |
|---------|--------|
| 1 | Cardiovascular health |
| 2 | Metabolic health |
| 3 | Musculoskeletal |
| 4 | Respiratory |
| 5 | Mental health |
| 6 | Reproductive health |
| 7 | Nutrition and diet |
| 8 | Substances |
| 9 | Recent medical activity |
| 10 | Demographics and context |
| 11 | Fitness history |
| 12 | Recovery and sleep |
| 13 | Environmental context |
| 14 | Genetic and family history |
| 15 | Immunological |
| 16 | Reserved — community proposals welcome |

### Patterns 17–255 — Implementer Defined
Garmin, Fitbit, hospitals, anyone. Use any question set you want. Publish it openly, version it monthly, or keep it private. OH2M takes no position. The standard carries the bits.

---

## For Implementers

### Writing an `.oh2m` file

1. Start with `---oh2m-v0.1---`
2. Write Layer 1 as `key: value` pairs — any fields you have
3. Optionally add Layer 2 chunks with pattern numbers
4. Optionally add a Layer 3 hash block
5. End with `---oh2m-end---`

### Reading an `.oh2m` file

- Layer 1 is always plain text — no decoding needed
- Layer 2 chunks with patterns 1–16 decode with this spec
- Layer 2 chunks with patterns 17–255 need the sender's question key
- Layer 3 needs the implementer's cryptographic key
- Partial decoding is valid — skip what you can't decode

### Using with an LLM

Pass the Layer 1 section directly. The LLM has everything it needs to provide meaningful fitness coaching, goal tracking, and trend analysis from Layer 1 alone. If you share your Layer 2 question key, it can factor in protected health context too.

---

## Specification

📄 **[OH2M Specification v0.1](./OH2M-Specification-v0.1.docx)** — The full technical spec. File format, layer definitions, pattern architecture, cipher system, governance.

---

## Status

| Item | Status |
|------|--------|
| Specification | v0.1 Draft |
| Open reference questions (patterns 1–16) | Community input needed |
| Reference implementation | Coming soon |
| GitHub org | `oh2m` |
| Website | `oh2m.org` |
| License | Apache 2.0 |

This is an early draft. The architecture is stable. The open reference questions for patterns 1–16 need community ratification. Contributions, questions, and challenges are welcome.

---

## Contributing

The spec lives here. Questions, corrections, and proposals go in [Issues](../../issues). Pull requests welcome.

The most important open contribution right now: **help define the 255 questions for patterns 1–16.** These are the community-owned open reference questions that any LLM or app can use without contacting anyone. They should be thoughtful, neutral, and broadly useful.

See [`/open-questions`](./open-questions) for the current working drafts by domain.

---

## License

Apache 2.0. Use it, build on it, extend it. If you build something on OH2M, you're welcome to tell us — not required, just appreciated.

---

## A Note

This standard was conceived after a run by one person who wanted better AI coaching without giving away sensitive health data.

It turns out that problem — personal health data flowing safely into AI — is unsolved. This is one attempt at a clean answer.

If OH2M has helped you or your project, you're welcome to [buy me a coffee](https://buymeacoffee.com/jamalbakari). It's never expected and always appreciated.

---

*OH2M — Open Heart-to-Model — oh2m.org*
