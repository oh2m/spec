**OH2M**

Open Heart-to-Model Standard

*Specification v0.1.1 — Draft*

*Your health data, on your terms.*

License: Apache 2.0  |  Status: DRAFT  |  github.com/oh2m/spec  |  oh2m.org

# **1. Introduction**

OH2M (Open Heart-to-Model) defines a file format standard for personal health and fitness data designed to be read by both humans and Large Language Models (LLMs). An OH2M file — called an Open Heart File — uses a three-layer architecture that balances openness with privacy.

| **WHY** | Existing health data formats were designed for hospitals and databases. OH2M is designed for individuals, AI tools, and the people who build them. |
| --- | --- |

## **1.1 Origin**

This standard was conceived on April 3rd, 2026, by Jamal Bakari — after a run.

The problem was simple and personal: how do you get an AI to coach you meaningfully without handing over your entire medical history to a language model you don't fully control? Existing formats either shared everything or nothing. There was no middle ground built for the reality that AI would be reading your health data.

| **NOTE** | OH2M was designed with AI in mind — and designed with AI. The specification was developed collaboratively between its creator and Claude, an AI assistant made by Anthropic. This is noted not as a disclaimer but as a statement of intent: OH2M is built for the era where humans and AI systems work together, and its creation reflects that reality from the first line. |
| --- | --- |

## **1.2 Why This Standard Exists**

AI coaching tools — fitness assistants, health advisors, recovery coaches — are becoming part of daily life. They are useful precisely because they are personal. But to be personal, they need data. And health data is among the most sensitive information a person carries.

| **The Problem** | **The OH2M Answer** |
| --- | --- |
| AI needs context to coach effectively | Layer 1 provides rich open fitness data — immediately useful to any LLM |
| Health data is sensitive | Layer 2 obfuscates sensitive flags — readable only with the question key |
| Some data should never be in an LLM | Layer 3 uses full cryptography — the AI sees only that protected data exists |
| Platforms lock in your data | Open format, Apache 2.0 — your file works with any app, any AI |
| No standard for health + AI | OH2M is that standard — built for this era from the ground up |

## **1.3 Design Philosophy**

### **The standard provides the container. Implementers provide the content.**

OH2M defines the file structure, the layer boundaries, the pattern system, and the rules. It does not define what questions are asked, what health domains matter, or how companies use their data.

### **Layer 2 is obfuscation. Layer 3 is encryption. Know which you need.**

Layer 2 provides meaningful friction against casual scraping and automated ingestion. For data that requires true security — genetics, prescriptions, medical records — Layer 3 provides cryptographic protection. The standard gives you both tools and trusts you to choose the right one.

### **Layer 1 is as trustworthy as any text document.**

Plain text can always be edited. What cannot be forged or silently altered is Layer 2 — the manifest and mask provide structural integrity — and Layer 3, which is cryptographically sealed.

### **255 binary questions form a compressed decision tree, not 255 independent splits.**

Informed by information theory — 21 well-chosen binary questions can identify anything from a space of over 2 million possibilities. 255 questions operate on a scale that exceeds the number of atoms in the observable universe. Critically, questions are conditionally related: some questions are only meaningful if prior questions were answered a certain way. The mask handles this branching naturally — apps activate relevant question clusters and ignore the rest.

### **Provenance and consent live in the file — at the right layer.**

Who created this file, when, and with whose consent can be recorded in any layer. A public creator stamp belongs in Layer 1. A semi-private identity signature belongs in Layer 2. A cryptographically verified creator proof belongs in Layer 3.

### **The format grows through community — not through central control.**

Patterns 1–16 are community-governed open reference patterns. Patterns 17–255 are free for anyone to use however they choose. Apache 2.0. No single entity controls it.

## **1.4 Design Goals**

- Human readable — open an .oh2m file in any text editor and understand it
- LLM-friendly — structured so AI models can reason about health data directly
- Privacy by design — sensitive data is structurally separated, not bolted on
- Platform neutral — any wearable, app, or health system can implement it
- Extensible — companies can branch off the standard without breaking it
- Lightweight — no heavy cryptography required for basic use
- AI-native — built from the ground up for the era of personal AI assistants
## **1.5 Terminology**

| **Term** | **Definition** |
| --- | --- |
| Open Heart File | A file conforming to the OH2M standard, with extension .oh2m |
| Layer 1 | The open, human-readable section of an Open Heart File |
| Layer 2 | The cipher section — manifest, plus unlimited 255-bit chunks with masks |
| Layer 3 | The hash section — proprietary or personal cryptographic data |
| Pattern | One of 255 positional orderings defined by OH2M. Contains no questions or meaning. |
| Pattern Index | A number 1–255 identifying which positional ordering to apply to a chunk |
| Manifest | A 256-bit block declaring which patterns are present in a Layer 2 block |
| Mask | A 256-bit / 64 hex character field declaring which question slots a chunk answers |
| Question Key | The private set of 255 questions shared between sender and receiver. Not part of OH2M. |
| Chunk | A single 255-bit data block within Layer 2, addressed by a pattern index |
| Off-Grid Signal | A hash value indicating proprietary Layer 3 cryptography |
| Implementer | Any app, platform, or system that produces or consumes .oh2m files |
| Suspect File | A file where the manifest does not match the actual chunks present |

# **2. File Format**

## **2.1 Overview**

An Open Heart File is a plain text file with the extension .oh2m, divided into three clearly delimited sections. Each section is optional but must appear in order if present.

| **NOTE** | A valid .oh2m file may contain only Layer 1 data. Layers 2 and 3 are optional extensions. |
| --- | --- |

## **2.2 Structure**

`---oh2m-v0.1.1---`

`[LAYER:1]`

`... human readable data ...`

`[/LAYER:1]`

`[LAYER:2]`

`manifest: <64 hex characters>`

`chunk: 1  pattern: 3`

`mask: <64 hex characters>`

`bits: <255 bits>`

`[/LAYER:2]`

`[LAYER:3]`

`method: hash`

`signal: <hex string>`

`data: <encrypted payload>`

`[/LAYER:3]`

`---oh2m-end---`

# **3. Layer 1 — Open Data**

## **3.1 Purpose**

Layer 1 is the open, human-readable section. It contains data the user is comfortable sharing publicly. An LLM reading only Layer 1 has enough information to provide meaningful fitness coaching, activity analysis, and goal tracking.

## **3.2 Core Fields**

| **Field** | **Type** | **Description** | **Example** |
| --- | --- | --- | --- |
| name | string | User display name | Alex Johnson |
| date | ISO 8601 | Date of the record | 2026-04-03 |
| activity | string | Type of activity | running |
| distance_miles | float | Distance in miles | 6.21 |
| duration_seconds | integer | Duration in seconds | 3252 |
| pace_min_per_mile | float | Pace in min/mile | 8.44 |
| heart_rate_avg_bpm | integer | Average heart rate | 142 |
| heart_rate_max_bpm | integer | Max heart rate | 158 |
| heart_rate_resting_bpm | integer | Resting heart rate | 52 |
| hrv_rmssd_ms | float | HRV RMSSD in ms | 48.3 |
| cadence_spm | integer | Steps per minute | 174 |
| elevation_gain_ft | float | Elevation gain in feet | 312 |
| calories_kcal | integer | Calories burned | 612 |
| sleep_duration_hours | float | Total sleep in hours | 7.4 |
| sleep_score | integer | Platform sleep score 0-100 | 76 |
| weight_lbs | float | Weight in pounds | 172 |
| vo2max_estimated | float | Estimated VO2 max | 48.2 |
| training_load | float | Platform training load score | 142 |
| body_battery | integer | Platform recovery score 0-100 | 73 |
| goal | string | User-stated goal in plain text | sub-51 min 10k by April 18th |
| notes | string | Free text notes | Felt strong in mile 4 |
| source_platform | string | Platform that generated the file | Garmin |
| source_device | string | Device that recorded the data | Forerunner 965 |
| oh2m_generated_at | ISO 8601 | Timestamp file was created | 2026-04-03T15:30:00Z |

## **3.3 Custom Fields**

Implementers may add custom fields prefixed with their platform name:

`garmin_body_battery_charge_rate: 4.2`

`whoop_strain_score: 14.3`

# **4. Layer 2 — The Cipher**

## **4.1 Purpose**

Layer 2 is a universal open binary broadcasting system. It encodes boolean information as 255-bit chunks, each addressed by a pattern number. The pattern defines only the positional ordering of the 255 bits. The questions mapped to those positions are the private agreement between sender and receiver — completely separate from the pattern itself.

| **KEY INSIGHT** | OH2M owns the patterns. Senders own the questions. They are completely independent. The same pattern used by two senders with different question keys produces entirely different information from identical bit strings. |
| --- | --- |

## **4.2 The Pattern Range**

| **Range** | **Owner** | **Purpose** | **Decodable by** |
| --- | --- | --- | --- |
| Patterns 1–16 | OH2M Standard | Open reference. 16 x 255 = 4,080 community-ratified questions. Anyone may use them. | Any reader with the OH2M spec |
| Patterns 17–255 | Implementer | App-specific, versioned, private, or any other use. OH2M takes no position. | Readers with the sender's question key |

| **RULE** | Patterns 1–16 are reserved exclusively for OH2M open reference questions. Implementers must not use patterns 1–16 for proprietary or custom question sets. |
| --- | --- |

## **4.3 Patterns and Questions Are Decoupled**

A pattern is purely a positional key — a permutation that says read the bits in this order. It contains no questions, no domain knowledge, and no data definitions.

A question can be framed positively or negatively — the sender decides. A 1 bit always means yes to however the question is framed. Without the pattern, the question key, AND the framing direction — the data is uninterpretable. This is by design.

| **CORE PRINCIPLE** | For patterns 17–255: OH2M owns the positional ordering. Senders own the meaning. A 1 or 0 in the data can mean yes, no, not-yes, or not-no depending on question framing. The standard never picks sides on what implementer questions should be. |
| --- | --- |

## **4.4 The Manifest**

Every Layer 2 block must begin with a manifest — a 256-bit / 64 hex character field declaring which pattern numbers are present in this file. The manifest is not a chunk. It is the Layer 2 header.

| **Bit position** | **Meaning** |
| --- | --- |
| 0 | Reserved — always 0 |
| 1 | Pattern 1 is present in this file (1) or not (0) |
| 2 | Pattern 2 is present in this file (1) or not (0) |
| ... | ... |
| 255 | Pattern 255 is present in this file (1) or not (0) |

When an importer reads a Layer 2 block it reads the manifest first, builds an expected pattern list, then verifies every declared pattern is present and no undeclared patterns appear.

| **RULE** | If the manifest declares a pattern that is absent — or a chunk appears that the manifest did not declare — the file is flagged SUSPECT. Tampering is indicated. |
| --- | --- |

`[LAYER:2]`

`manifest: 0000000000000000480000000000000000000000000000000000000000000000`

`(pattern 3 and pattern 42 declared — all other positions 0)`

## **4.5 The Mask**

Every chunk must declare a mask — a 256-bit / 64 hex character field indicating which of the 255 question slots are being answered in this chunk.

| **Mask bit** | **Data bit** | **Meaning** |
| --- | --- | --- |
| 1 | 1 | Question was asked — answer is yes to the framing |
| 1 | 0 | Question was asked — answer is no to the framing |
| 0 | either | Question not transmitted — importer ignores this slot entirely |

A mask bit of 0 means the slot was not transmitted. The data bit value at that position is irrelevant and must be ignored. This resolves the ambiguity between a genuine no answer and an unanswered question.

| **RULE** | Position 0 of the mask is reserved — always 0. Positions 1–255 map to question slots 1–255. A mask of all zeros is valid — it means no questions were answered in this chunk. |
| --- | --- |

## **4.6 The Multi-Chunk System**

Layer 2 supports an unlimited number of chunks. Each chunk is 255 bits and declares its own pattern and mask. Chunks are numbered sequentially from 1. A reader decodes each chunk independently — partial decoding is valid.

| **Chunk** | **Pattern** | **Range** | **Example Use** |
| --- | --- | --- | --- |
| 1 | 3 | OH2M open | Musculoskeletal flags — decodable by any reader |
| 2 | 9 | OH2M open | Recent medical activity — decodable by any reader |
| 3 | 42 | Implementer | Garmin-specific flags — needs Garmin's question key |
| 4–N | Any | Either | Any domain, any question set |

## **4.7 Complete Layer 2 Format**

`[LAYER:2]`

`manifest: 0000000000000000480000000000000000000000000000000000000000000000`

`chunk: 1  pattern: 3`

`mask: FFA300B2C14400000000000000000000000000000000000000000000000000000000`

`bits: 10110010110100101110001010010110...  (255 bits)`

`chunk: 2  pattern: 42  qset: garmin-health-v2026.04`

`mask: 00FF00FF00000000000000000000000000000000000000000000000000000000`

`bits: 00101101001011100110100101110001...  (255 bits)`

`[/LAYER:2]`

| **RULE** | Every field in Layer 2 is 256 bits / 64 hex characters. Position 0 is always reserved. This fixed-width design — inspired by IPv4 — ensures any parser knows exactly what to expect at every position with no ambiguity. |
| --- | --- |

## **4.8 Bit Positions, Question Numbering, and the V Flag**

### **Numbering Convention**
Bit positions in a Layer 2 block are numbered 0–255. Position 0 is permanently reserved at the spec level and does not represent a question. Questions are numbered 1–255, with Question N stored exactly at bit position N. This alignment eliminates mapping translations between human-readable question indices and physical bit slots. Importers or decoders written in 0-indexed programming languages must skip index 0 when iterating over the question bit field.

### **Rationale for Reserving Position 0**
Position 0 is reserved as a structural safety slot, inspired by IPv4 address reservation patterns. For version v0.1.1, position 0 is reserved-and-unused. Future specification amendments may assign a metadata or version signal to position 0; in the meantime, it must remain set to 0.

### **The V Flag (Inversion)**
The V flag is a per-question metadata flag (capital `V`, short for "inVert") specified in the question definition. The V flag decouples human-readable question text from physical bit storage. When the V flag is set to `true` for a question, the stored bit is the logical inverse of the natural answer.
*   **Encoding Rule**: The encoder applies the V flag inversion before writing the bit: if the user's natural answer is "yes" (1), and V is set, the encoder writes `0` to the on-disk bit. If the natural answer is "no" (0), the encoder writes `1`.
*   **Decoding Rule**: The decoder reads the stored bit and applies the V flag inversion before presenting the decoded answer: if the stored bit is `0` and V is set, the decoded answer is presented as "yes" (1).
*   **Question Text Rule**: The human-readable question text is never modified or inverted by the V flag. Only the physical storage is affected.
*   **Mask Interaction**: The V flag applies only to answered slots where the mask bit is `1`. If the mask bit for a slot is `0`, the slot is ignored entirely, and the V flag has no effect.

### **Usage Guidance**
The choice to apply the V flag is entirely up to question authors and is permissive. Authors typically use the V flag to maintain consistent bit polarity across an entire pattern (for example, ensuring that a 1 bit always represents a "notable condition or risk presence" and a 0 bit represents the "baseline or healthy state"), regardless of whether a question is phrased in a positive or negative way.

### **Worked Example**
Consider a question defined at bit position 47:
*   **Question**: *Do you exercise regularly?*
*   **Position**: 47
*   **V flag**: `true` (applied by the author to ensure a `1` bit stored represents the risk/notable condition "does not exercise regularly", keeping 0 as the healthy baseline).

Round-trip behavior:
1.  **User Answer**: The user answers "yes" to "Do you exercise regularly?".
2.  **Encoding**: The user's natural answer is `1` (yes). Because `v: true`, the encoder inverts this value: `1` XOR `1` = `0`. The bit stored at position 47 is `0`.
3.  **Decoding**: The importer reads the bit at position 47, which is `0`. Observing that `v: true` for this slot, the decoder inverts it back: `0` XOR `1` = `1`. The decoded answer is correctly presented to the application as "yes" (1).

## **4.9 The OH2M Open Reference Questions — Patterns 1–16**

Patterns 1–16 are reserved for community-ratified open reference questions. Each pattern covers a distinct domain of health and fitness boolean data. Together they provide 4,080 open questions covering the full scope of what fitness apps and LLMs need.

| **Pattern** | **Domain** | **Description** |
| --- | --- | --- |
| 1 | Cardiovascular | Heart disease, hypertension, medications, family history, cardiac devices |
| 2 | Metabolic | Diabetes, thyroid, metabolic syndrome, weight management |
| 3 | Musculoskeletal | Injuries, surgeries, chronic pain, physical therapy, mobility |
| 4 | Respiratory | Asthma, COPD, sleep apnea, inhalers, breathing conditions |
| 5 | Mental Health | Depression, anxiety, stress, therapy, psychiatric conditions |
| 6 | Reproductive | Pregnancy, hormonal health, fertility, menopause |
| 7 | Nutrition & Diet | Dietary restrictions, allergies, supplements, eating patterns |
| 8 | Substances | Alcohol, tobacco, medications, recreational substances |
| 9 | Recent Medical Activity | Doctor visits, hospitalizations, surgeries, current prescriptions |
| 10 | Demographics & Context | Age ranges, disability, sensory impairment, mobility aids |
| 11 | Fitness History | Training background, sport history, performance milestones |
| 12 | Recovery & Sleep | Sleep disorders, recovery patterns, fatigue flags |
| 13 | Environmental | Altitude, heat, cold tolerance, outdoor conditions |
| 14 | Genetics & Family History | Family conditions, hereditary flags, ancestry health context |
| 15 | Immunological | Autoimmune, immunocompromised, allergies, transplant history |
| 16 | Reserved | Community proposals welcome — not yet ratified |

| **NOTE** | The specific 255 questions for each pattern domain are maintained at github.com/oh2m/spec/open-questions. This spec defines the domains and governance. The full question lists are maintained separately to allow community updates without requiring a spec revision. All questions are DRAFT pending community ratification before v1.0. |
| --- | --- |

## **4.10 Conditional Question Logic**

The 255 questions per pattern are not 255 independent binary splits. They form a compressed decision tree — clusters of related questions where some are only meaningful if others were answered a certain way.

Example: A question about insulin dosage is only meaningful if a prior question about diabetes was answered yes. An app that knows the user does not have diabetes leaves the insulin slot unmasked — the importer ignores it entirely.

The mask is the mechanism for conditional logic. Apps activate relevant question clusters based on prior answers and leave irrelevant slots unmasked. The full 255 slots are always present in the pattern — but most files will activate only a fraction of them.

| **NOTE** | When writing open reference questions for patterns 1–16, question sets should be designed as decision trees first, then flattened into 255 slots. Trunk questions open or close entire branches. Branch questions are only relevant if trunk questions were answered a certain way. Leaf questions are highly specific. |
| --- | --- |

## **4.11 OH2M Does Not Define Implementer Questions**

For patterns 17–255, OH2M takes no position on what questions are asked, how they are framed, or what domains they cover. The standard defines only the positional ordering of the 255 bit slots.

A question can be framed any way the sender chooses. The sender and receiver share the question key privately. OH2M carries the bits — the sender and receiver own the meaning.

# **5. Layer 3 — The Hash**

## **5.1 Purpose**

Layer 3 is the off-grid escape hatch for data that is too sensitive, too complex, or too proprietary to fit in Layers 1 or 2. This includes genetics, detailed medical records, family history, prescription details, and any information requiring full cryptographic protection.

| **IMPORTANT** | OH2M does not govern Layer 3. The standard only defines how a Layer 3 block is signaled and delimited. The cryptographic method, key management, and data structure inside Layer 3 are entirely the responsibility of the implementer. |
| --- | --- |

## **5.2 Per-Person Keys**

Each person should have a unique Layer 3 key. This limits the blast radius of any breach — cracking one person's Layer 3 key reveals nothing about anyone else's file.

## **5.3 Format**

`[LAYER:3]`

`method: hash`

`signal: a3f9c2b1d8e4f70293a1b5c6d7e8f9a0`

`data: <base64 or binary encrypted payload>`

`[/LAYER:3]`

## **5.4 Example Layer 3 Use Cases**

- Full genetic sequencing data
- Detailed prescription history with dosages
- Family medical history with diagnoses
- Insurance-sensitive conditions
- Detailed clinical notes from doctor visits
- Mental health session summaries
# **6. LLM Interaction Model**

## **6.1 Reading an Open Heart File**

| **LLM Access Level** | **Layers Available** | **Capability** |
| --- | --- | --- |
| No key | Layer 1 only | Fitness coaching, activity analysis, goal tracking |
| OH2M spec | Layer 1 + Layer 2 patterns 1-16 | Health-aware coaching using open reference questions |
| Implementer question key | Layer 1 + Layer 2 all patterns | Full platform-specific health context |
| Layer 3 key | All layers | Full medical context, comprehensive health coaching |

## **6.2 Referencing Protected Data**

An LLM encountering Layer 2 chunks it cannot decode should acknowledge their presence:

| **EXAMPLE** | Your file contains Layer 2 health context I can partially decode. Chunks using patterns 1-16 are readable with the OH2M spec. Chunks using implementer patterns require your platform's question key to decode. |
| --- | --- |

An LLM encountering a Layer 3 hash signal it cannot decode:

| **EXAMPLE** | Your file contains protected medical data in Layer 3 that I don't have access to. If you share the key or relevant details directly, I can incorporate them into your coaching. |
| --- | --- |

# **7. Pattern Generation**

## **7.1 The 255 Patterns**

The OH2M standard defines 255 positional patterns numbered 1–255. Each pattern is a 16x16 binary grid (256 positions, position 0 reserved) that determines the ordering of the 255 question slots.

Each pixel in the 16x16 grid is either 1 (positive framing) or 0 (negative framing) for that question slot position. The pixel value determines how the question at that slot is framed — not what the question is.

| **Pixel value** | **Question framing** | **Data bit 1 means** |
| --- | --- | --- |
| 1 | Positive — Do you have X? | Yes, I have X |
| 0 | Negative — Do you NOT have X? | Yes, I do not have X |

## **7.2 Pattern Generation Seed**

All 255 patterns were generated using the following public seed:

`OH2M-OPEN-HEART-TO-MODEL-2026-04-03-JAMAL-BAKARI`

This seed is published so anyone can verify the patterns were generated transparently and not manipulated. The generation script is available at github.com/oh2m/spec.

## **7.3 Pattern Files**

Patterns are published in three formats in the OH2M spec repository:

*   `patterns.json` — Authoritative data file for developers containing the 255 positional permutations.
*   `pattern-001.png` through `pattern-255.png` — 16x16 visual representations.
*   `open-reference-preview.png` — All 16 open reference patterns on one sheet.

### **JSON Schema for patterns.json**
The `patterns.json` file is a JSON object with the following root-level schema:
*   `standard` (string): Standard identifier, always `"OH2M"`.
*   `version` (string): The standard version.
*   `generated` (string): Generation date.
*   `seed` (string): The public generation seed.
*   `description` (string): Description of the patterns and reserving of position 0.
*   `grid` (string): Pattern display grid dimensions, e.g., `"16x16"`.
*   `total_patterns` (integer): Total number of patterns defined, always `255`.
*   `total_slots` (integer): Total question slots per pattern, always `255`.
*   `patterns` (object): A key-value dictionary where keys are pattern indices `"1"` through `"255"`.

Each pattern object inside `patterns` has the following schema:
*   `id` (integer): The pattern index (1–255).
*   `range` (string): The scope category (`"open-reference"` or `"implementer"`).
*   `fingerprint` (string): A unique 64-bit hex fingerprint for the pattern.
*   `bits` (array of integers): A 256-element array of bits (`0` or `1`). Index `0` is always `0` (reserved). Positions `1` through `255` represent the framing of each question slot.

### **Question-Level Schema (YAML format)**
Open reference questions (patterns 1–16) are maintained under `/open-questions/` as YAML files. Each file contains a header block and an ordered flat list of exactly 255 question entries.

#### **Header Schema**
*   `pattern` (integer): The pattern index (1–16).
*   `domain` (string): Name of the clinical/health domain.
*   `spec_version` (string): Standard version (e.g., `"0.1.1"`).
*   `status` (string): Ratification state (typically `"DRAFT"`).
*   `authored_by` (string): Authorship credit.
*   `last_revised` (string): Date of last revision.
*   `polarity_note` (string): Guidance on V flag usage.
*   `ratification` (string): Review status details.
*   `scope_exclusions` (array of strings): Specific clinical areas explicitly excluded from the question set.

#### **Question Entry Schema**
Each question entry in the list is defined by:
*   `pos` (integer): Bit position number (1–255). Position `0` is reserved and must not have a question.
*   `q` (string): Human-readable yes/no question text.
*   `v` (boolean, optional): Decoupled storage polarity inversion flag. When `true`, indicates the stored bit is inverted relative to the natural answer. Defaults to `false`.
*   `notes` (string, optional): Extra clinical or context notes.
# **8. Versioning**

## **8.1 Version Format**

OH2M versions follow semantic versioning: MAJOR.MINOR.PATCH

- MAJOR — breaking changes to layer structure or cipher question set
- MINOR — new fields, new questions, new platform patterns
- PATCH — clarifications, corrections, no functional change
## **8.2 This Version**

| **Version** | **Date** | **Changes** |
| --- | --- | --- |
| v0.1 | 2026-04-03 | Initial release. Three-layer architecture. 255 patterns generated. |
| v0.1.1 | 2026-04-03 | Added manifest block. Added mask field to chunks. Clarified bit framing. Added conditional question logic to design philosophy. Fixed-width 256-bit fields throughout Layer 2. |

# **9. Complete Example File**

`---oh2m-v0.1.1---`

`[LAYER:1]`

`name: Alex Johnson`

`date: 2026-04-03`

`activity: running`

`distance_miles: 6.21`

`duration_seconds: 3252`

`pace_min_per_mile: 8.44`

`heart_rate_avg_bpm: 142`

`heart_rate_max_bpm: 158`

`heart_rate_resting_bpm: 52`

`hrv_rmssd_ms: 48.3`

`cadence_spm: 174`

`elevation_gain_ft: 312`

`calories_kcal: 612`

`sleep_duration_hours: 7.2`

`sleep_score: 76`

`weight_lbs: 172`

`vo2max_estimated: 48.2`

`training_load: 142`

`body_battery: 73`

`goal: sub-51 minute 10k, Monument 10k race April 18th 2026`

`notes: Felt strong through mile 4. Slight left knee tightness at end.`

`source_platform: Garmin`

`source_device: Forerunner 965`

`oh2m_generated_at: 2026-04-03T15:30:00Z`

`[/LAYER:1]`

`[LAYER:2]`

`manifest: 0000000000000000480000000000000000000000000000000000000000000000`

`(pattern 3 declared for chunk 1, pattern 42 declared for chunk 2)`

`chunk: 1  pattern: 3`

`mask: FFA300B2C14400000000000000000000000000000000000000000000000000000000`

`bits: 00100000000000000001000000000000000000000000000000000000000000000000`

`00000000000000000000000000000000000000000000000000000000000000000000`

`00000000000000000000000000000000000000000000000000000000000000000000`

`00000000000000000000000000000000000000000000000000000000000000000`

`(255 bits — OH2M open reference pattern 3: musculoskeletal)`

`chunk: 2  pattern: 42  qset: garmin-health-v2026.04`

`mask: 00FF00FF00000000000000000000000000000000000000000000000000000000`

`bits: 00000000000000000000000000000000000000000000000000000000000000000000`

`00000000000000000000000000010000000000000000000000000000000000000000`

`00000000000000000000000000000000000000000000000000000000000000000000`

`0000000000000000000000000000000000000000000000000000000000000000000`

`(255 bits — Garmin implementer pattern 42)`

`[/LAYER:2]`

`---oh2m-end---`

| **NOTE** | Chunk 1 uses OH2M open reference pattern 3 (musculoskeletal) — decodable by any reader with the OH2M spec. The mask declares which slots were answered. Chunk 2 uses Garmin implementer pattern 42 — requires Garmin's question key for April 2026. The manifest declares both patterns are present. Any modification to the chunks would cause a manifest mismatch and flag the file as SUSPECT. |
| --- | --- |

# **10. Governance**

## **10.1 License**

The OH2M specification is published under the Apache License 2.0. Anyone may implement, extend, or build upon the standard. Contributors grant a patent license covering their contributions.

## **10.2 Contributing**

The specification is maintained at github.com/oh2m/spec. Contributions welcome via GitHub Issues and pull requests. The most important open contribution right now is ratifying the 4,080 open reference questions for patterns 1–16 at github.com/oh2m/spec/open-questions.

## **10.3 Stewardship**

OH2M is an independent open standard. It is not owned by any company, platform, or wearable manufacturer. The goal is eventual transfer to a neutral standards body as adoption grows.

# **Appendix A: Open Questions for Community**

- Should the qset field be required for implementer chunks (patterns 17-255)?
- Should there be a standard format for versioned question key feeds?
- Should OH2M define a standard question key registry for platforms that publish openly?
- Should there be a Layer 2 extension for non-binary values in a future version?
- How should .oh2m files be digitally signed to verify Layer 1 integrity?
- Should there be an official MIME type registration for .oh2m?
- How should user consent and data provenance be recorded in the file?
- Should OH2M define a standard API response format for streaming .oh2m data?
- Should there be a recommended maximum number of Layer 2 chunks per file?
# **Appendix B: Revision History**

| **Version** | **Date** | **Notes** |
| --- | --- | --- |
| v0.1 | 2026-04-03 | Initial release. Three-layer architecture. 255 patterns generated with public seed. |
| v0.1.1 | 2026-04-03 | Manifest block added. Mask field added to chunks. Bit framing clarified. Conditional question logic documented. Fixed-width 256-bit fields throughout Layer 2 (inspired by IPv4). |

*OH2M — Open Heart-to-Model — Apache 2.0 — oh2m.org — github.com/oh2m/spec — Your health data, on your terms.*
