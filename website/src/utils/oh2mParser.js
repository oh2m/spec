/**
 * OH2M Parser & Validator Utility
 * Specifications: v0.1.1
 */
import patternsData from "../patterns.json";

// Helper to convert a 256-bit array to 64-char hex string (MSB-first)
export function bitsToHexMSB(bitsArray) {
  let hex = "";
  for (let i = 0; i < 64; i++) {
    const b0 = bitsArray[i * 4] || 0;
    const b1 = bitsArray[i * 4 + 1] || 0;
    const b2 = bitsArray[i * 4 + 2] || 0;
    const b3 = bitsArray[i * 4 + 3] || 0;
    const val = (b0 << 3) | (b1 << 2) | (b2 << 1) | b3;
    hex += val.toString(16);
  }
  return hex;
}

// Helper to convert a 256-bit array to 64-char hex string (LSB-first)
export function bitsToHexLSB(bitsArray) {
  let hex = "";
  for (let i = 0; i < 64; i++) {
    const b0 = bitsArray[i * 4] || 0;
    const b1 = bitsArray[i * 4 + 1] || 0;
    const b2 = bitsArray[i * 4 + 2] || 0;
    const b3 = bitsArray[i * 4 + 3] || 0;
    const val = b0 | (b1 << 1) | (b2 << 2) | (b3 << 3);
    hex += val.toString(16);
  }
  return hex;
}

// Helper to convert a 64-char hex string to 256-bit array (MSB-first)
export function hexToBitsMSB(hexStr) {
  const bits = new Array(256).fill(0);
  const cleanHex = hexStr.trim().toLowerCase();
  for (let i = 0; i < Math.min(cleanHex.length, 64); i++) {
    const val = parseInt(cleanHex[i], 16);
    if (!isNaN(val)) {
      bits[i * 4] = (val >> 3) & 1;
      bits[i * 4 + 1] = (val >> 2) & 1;
      bits[i * 4 + 2] = (val >> 1) & 1;
      bits[i * 4 + 3] = val & 1;
    }
  }
  return bits;
}

// Helper to convert a 64-char hex string to 256-bit array (LSB-first)
export function hexToBitsLSB(hexStr) {
  const bits = new Array(256).fill(0);
  const cleanHex = hexStr.trim().toLowerCase();
  for (let i = 0; i < Math.min(cleanHex.length, 64); i++) {
    const val = parseInt(cleanHex[i], 16);
    if (!isNaN(val)) {
      bits[i * 4] = val & 1;
      bits[i * 4 + 1] = (val >> 1) & 1;
      bits[i * 4 + 2] = (val >> 2) & 1;
      bits[i * 4 + 3] = (val >> 3) & 1;
    }
  }
  return bits;
}

/**
 * Parse an .oh2m file content string
 */
export function parseOH2M(fileContent) {
  const result = {
    isValid: false,
    status: "INVALID", // INVALID, SUSPECT, VALID
    version: "0.1.1",
    errors: [],
    layer1: null,
    layer2: null,
    layer3: null,
    raw: fileContent
  };

  if (!fileContent || typeof fileContent !== "string") {
    result.errors.push("Empty or invalid file content.");
    return result;
  }

  const lines = fileContent.split(/\r?\n/).map(l => l.trim());
  
  // Find boundaries
  const headerIdx = lines.findIndex(l => l.startsWith("---oh2m-v"));
  const trailerIdx = lines.findIndex(l => l === "---oh2m-end---");

  if (headerIdx === -1) {
    result.errors.push("Missing header. File must start with '---oh2m-v*---'.");
    return result;
  }
  if (trailerIdx === -1) {
    result.errors.push("Missing trailer. File must end with '---oh2m-end---'.");
    return result;
  }

  // Extract version from header e.g. "---oh2m-v0.1.1---"
  const headerMatch = lines[headerIdx].match(/---oh2m-v([0-9.]+)---/);
  if (headerMatch) {
    result.version = headerMatch[1];
  }

  // Extract layers
  let l1Start = -1, l1End = -1;
  let l2Start = -1, l2End = -1;
  let l3Start = -1, l3End = -1;

  for (let i = headerIdx; i < trailerIdx; i++) {
    if (lines[i] === "[LAYER:1]") l1Start = i;
    if (lines[i] === "[/LAYER:1]") l1End = i;
    if (lines[i] === "[LAYER:2]") l2Start = i;
    if (lines[i] === "[/LAYER:2]") l2End = i;
    if (lines[i] === "[LAYER:3]") l3Start = i;
    if (lines[i] === "[/LAYER:3]") l3End = i;
  }

  // Parse Layer 1
  if (l1Start !== -1 && l1End !== -1 && l1End > l1Start) {
    const l1Data = {};
    for (let i = l1Start + 1; i < l1End; i++) {
      const line = lines[i];
      if (line && line.includes(":")) {
        const colonIdx = line.indexOf(":");
        const key = line.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim();
        l1Data[key] = val;
      }
    }
    result.layer1 = l1Data;
  } else {
    result.errors.push("Layer 1 block [LAYER:1] is missing or malformed.");
  }

  // Parse Layer 2
  if (l2Start !== -1 && l2End !== -1 && l2End > l2Start) {
    const l2Data = {
      declaredManifest: "",
      calculatedManifestMSB: "",
      calculatedManifestLSB: "",
      chunks: [],
      manifestValid: false,
      endianness: "MSB"
    };

    let currentChunk = null;

    for (let i = l2Start + 1; i < l2End; i++) {
      const line = lines[i];
      if (!line) continue;

      if (line.startsWith("manifest:")) {
        l2Data.declaredManifest = line.replace("manifest:", "").trim().toLowerCase();
        continue;
      }

      const chunkHeaderMatch = line.match(/chunk:\s*(\d+)\s+pattern:\s*(\d+)/i);
      if (chunkHeaderMatch) {
        if (currentChunk) {
          l2Data.chunks.push(currentChunk);
        }
        currentChunk = {
          chunkNumber: parseInt(chunkHeaderMatch[1], 10),
          patternId: parseInt(chunkHeaderMatch[2], 10),
          maskHex: "",
          bitsStr: "",
          answeredSlots: [],
          unansweredSlots: [],
          decodedValues: {} // slot -> value
        };
        continue;
      }

      if (line.startsWith("mask:") && currentChunk) {
        currentChunk.maskHex = line.replace("mask:", "").trim().toLowerCase();
        continue;
      }

      if (line.startsWith("bits:") && currentChunk) {
        currentChunk.bitsStr = line.replace("bits:", "").trim().replace(/\s*\(.*\)/, ""); // Strip trailing text like (255 bits)
        continue;
      }
    }

    if (currentChunk) {
      l2Data.chunks.push(currentChunk);
    }

    // Recalculate Manifest to check consistency
    const manifestBitsMSB = new Array(256).fill(0);
    const manifestBitsLSB = new Array(256).fill(0);
    
    l2Data.chunks.forEach(chunk => {
      const pid = chunk.patternId;
      if (pid >= 1 && pid <= 255) {
        // In MSB order
        manifestBitsMSB[pid] = 1;
        // In LSB order
        manifestBitsLSB[pid] = 1;
      }
    });

    l2Data.calculatedManifestMSB = bitsToHexMSB(manifestBitsMSB);
    l2Data.calculatedManifestLSB = bitsToHexLSB(manifestBitsLSB);

    // Determine which manifest matches
    const decManifest = l2Data.declaredManifest;
    if (decManifest) {
      if (decManifest === l2Data.calculatedManifestMSB) {
        l2Data.manifestValid = true;
        l2Data.endianness = "MSB";
      } else if (decManifest === l2Data.calculatedManifestLSB) {
        l2Data.manifestValid = true;
        l2Data.endianness = "LSB";
      } else {
        l2Data.manifestValid = false;
        result.errors.push(`Manifest validation failed. Declared: ${decManifest}, Calculated (MSB): ${l2Data.calculatedManifestMSB}`);
      }
    } else {
      result.errors.push("Layer 2 declared manifest is missing.");
    }

    // Decode chunks
    l2Data.chunks.forEach(chunk => {
      const maskBits = l2Data.endianness === "MSB" 
        ? hexToBitsMSB(chunk.maskHex) 
        : hexToBitsLSB(chunk.maskHex);

      const patternKey = chunk.patternId.toString();
      let defaultBits = [];
      if (patternKey === "0") {
        defaultBits = new Array(256).fill(0);
      } else {
        defaultBits = patternsData.patterns[patternKey]?.bits || [];
      }

      // Bits string has length 255. Bit at index s-1 corresponds to slot s.
      for (let slot = 1; slot <= 255; slot++) {
        const isAnswered = maskBits[slot] === 1;
        if (isAnswered) {
          chunk.answeredSlots.push(slot);
          const bitVal = parseInt(chunk.bitsStr[slot - 1], 10) || 0;
          const patternBit = defaultBits[slot] !== undefined ? defaultBits[slot] : 0;
          // Decode by XORing the bit value with the pattern's default bit
          chunk.decodedValues[slot] = bitVal ^ patternBit;
        } else {
          chunk.unansweredSlots.push(slot);
        }
      }
    });

    result.layer2 = l2Data;
  }

  // Parse Layer 3
  if (l3Start !== -1 && l3End !== -1 && l3End > l3Start) {
    const l3Lines = [];
    for (let i = l3Start + 1; i < l3End; i++) {
      if (lines[i]) l3Lines.push(lines[i]);
    }
    result.layer3 = {
      lines: l3Lines,
      rawContent: l3Lines.join("\n")
    };
  }

  // Compute final status
  if (result.errors.length === 0) {
    result.isValid = true;
    result.status = "VALID";
  } else if (result.layer1 && result.layer2 && !result.layer2.manifestValid) {
    result.isValid = false;
    result.status = "SUSPECT"; // Parsable but manifest mismatch indicates tampering
  } else {
    result.isValid = false;
    result.status = "INVALID"; // Formatting errors
  }

  return result;
}

/**
 * Generate .oh2m file content string
 */
export function generateOH2M(layer1Data, chunksData, layer3Data = null, endianness = "MSB") {
  let output = `---oh2m-v0.1.1---\n`;

  // Layer 1
  output += `[LAYER:1]\n`;
  Object.entries(layer1Data).forEach(([key, val]) => {
    if (key && val) {
      output += `${key}: ${val}\n`;
    }
  });
  output += `[/LAYER:1]\n`;

  // Layer 2
  if (chunksData && chunksData.length > 0) {
    output += `[LAYER:2]\n`;

    // Recalculate manifest
    const manifestBits = new Array(256).fill(0);
    chunksData.forEach(c => {
      const pid = parseInt(c.patternId, 10);
      if (pid >= 1 && pid <= 255) {
        manifestBits[pid] = 1;
      }
    });

    const manifestHex = endianness === "MSB" ? bitsToHexMSB(manifestBits) : bitsToHexLSB(manifestBits);
    output += `manifest: ${manifestHex}\n`;

    // Write chunks
    chunksData.forEach((c, idx) => {
      output += `chunk: ${idx + 1}  pattern: ${c.patternId}\n`;

      // Build mask hex
      const maskBits = new Array(256).fill(0);

      // Initialize bitsArr with default pattern bits from patterns.json
      const patternKey = c.patternId.toString();
      let defaultBits = [];
      if (patternKey === "0") {
        defaultBits = new Array(256).fill(0);
      } else {
        defaultBits = patternsData.patterns[patternKey]?.bits || [];
      }
      const bitsArr = new Array(255).fill(0);
      for (let s = 1; s <= 255; s++) {
        bitsArr[s - 1] = defaultBits[s] !== undefined ? defaultBits[s] : 0;
      }

      // c.answers is an object: { slotIndex: { answered: boolean, value: 0 | 1 } }
      Object.entries(c.answers || {}).forEach(([slotStr, answer]) => {
        const slot = parseInt(slotStr, 10);
        if (slot >= 1 && slot <= 255) {
          if (answer.answered) {
            maskBits[slot] = 1;
            const patternBit = defaultBits[slot] !== undefined ? defaultBits[slot] : 0;
            const answerVal = answer.value ? 1 : 0;
            // Output bit is XOR of the answer and the pattern default bit
            bitsArr[slot - 1] = answerVal ^ patternBit;
          }
        }
      });

      const maskHex = endianness === "MSB" ? bitsToHexMSB(maskBits) : bitsToHexLSB(maskBits);
      const bitsStr = bitsArr.join("");

      output += `mask: ${maskHex}\n`;
      output += `bits: ${bitsStr}  (255 bits)\n`;
    });

    output += `[/LAYER:2]\n`;
  }

  // Layer 3
  if (layer3Data && Array.isArray(layer3Data) && layer3Data.length > 0) {
    output += `[LAYER:3]\n`;
    layer3Data.forEach(item => {
      if (typeof item === "string") {
        if (item.trim()) {
          output += `${item.trim()}\n`;
        }
      } else if (item && typeof item === "object") {
        const key = (item.key || "").trim();
        const value = (item.value || "").trim();
        if (key && value) {
          output += `${key}: ${value}\n`;
        } else if (value) {
          output += `${value}\n`;
        } else if (key) {
          output += `${key}:\n`;
        }
      }
    });
    output += `[/LAYER:3]\n`;
  } else if (layer3Data && typeof layer3Data === "object" && layer3Data.hashValue) {
    // Legacy support for single hash object if passed
    output += `[LAYER:3]\n`;
    output += `${layer3Data.hashType || "sha256"}: ${layer3Data.hashValue}\n`;
    output += `[/LAYER:3]\n`;
  }

  output += `---oh2m-end---`;
  return output;
}

/**
 * Pure JavaScript synchronous SHA-256 implementation
 * Used for instant, zero-dependency hashing in generator and validator
 */
export function sha256(str) {
  function rotateRight(n, shift) {
    return (n >>> shift) | (n << (32 - shift));
  }

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a,
      h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  // Convert string to bytes
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else if (code < 2048) {
      bytes.push((code >> 6) | 192);
      bytes.push((code & 63) | 128);
    } else {
      bytes.push((code >> 12) | 224);
      bytes.push(((code >> 6) & 63) | 128);
      bytes.push((code & 63) | 128);
    }
  }

  const words = [];
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    words[i >> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }

  const bitLen = len * 8;
  words[bitLen >> 5] |= 0x80 << (24 - (bitLen % 32));
  
  const targetWordCount = ((bitLen + 64) >> 9 << 4) + 15;
  while (words.length < targetWordCount) {
    words.push(0);
  }
  words.push(bitLen >>> 32);
  words.push(bitLen & 0xffffffff);

  const w = new Array(64);
  for (let chunkStart = 0; chunkStart < words.length; chunkStart += 16) {
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let i = 0; i < 64; i++) {
      if (i < 16) {
        w[i] = words[chunkStart + i] || 0;
      } else {
        const s0 = rotateRight(w[i - 15], 7) ^ rotateRight(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rotateRight(w[i - 2], 17) ^ rotateRight(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) | 0;
      const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + s1 + ch + k[i] + w[i]) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  const hex = (val) => {
    let s = "";
    for (let i = 0; i < 4; i++) {
      s += ((val >>> (24 - i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return s;
  };

  return hex(h0) + hex(h1) + hex(h2) + hex(h3) + hex(h4) + hex(h5) + hex(h6) + hex(h7);
}
