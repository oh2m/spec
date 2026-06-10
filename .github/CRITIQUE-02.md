# Self-Critique: Ticket 02 — Spec Amendment: V Notation & Numbering

1. **V Definition Clarity**: The V definition is clear and mathematically precise: the decoder/encoder rules use straightforward boolean XOR logic (natural_value XOR V_flag = stored_value) so an implementer cannot get the round-trip wrong.
2. **patterns.json Matching**: The 1–255 numbering convention with position 0 reserved perfectly matches `patterns.json` as it exists today, since the first element (index 0) of every bit array is always `0` and there are exactly 256 bits (meaning positions 1–255 map to indices 1–255).
3. **Worked Example**: The worked example at position 47 lands cleanly and demonstrates both the encoding XOR step and the decoding XOR recovery, making it concrete.
4. **Version Bump**: This amendment does not trigger a version bump (remaining v0.1.1) because it is a draft amendment that clarifies existing ambiguity about bit polarity and numbering before any formal v1.0 release.
5. **Spec Tension**: There is no tension with other parts of the spec, as the V flag is isolated to Layer 2 static-question mode and doesn't affect Layer 1 or Layer 3.
