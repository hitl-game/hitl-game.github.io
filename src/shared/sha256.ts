import { SHA256_INITIAL_HASH, SHA256_ROUND_CONSTANTS } from './sha256Constants';

// Pure, synchronous SHA-256 (FIPS 180-4). Web Crypto is asynchronous and banned in core/, and
// the fingerprint (core) and the export checksum (platform/codec) must agree on every engine.

const WORD_BITS = 32;
const BYTES_PER_WORD = 4;
const BLOCK_BYTES = 64;
const BLOCK_WORDS = 16;
const SCHEDULE_WORDS = 64;
const HASH_WORDS = 8;
const LENGTH_FIELD_BYTES = 8;
const PADDING_BYTE = 0x80;
const HEX_DIGITS_PER_WORD = 8;
const HEX_RADIX = 16;

const rotateRight = (word: number, bits: number): number =>
  (word >>> bits) | (word << (WORD_BITS - bits));

const wordAt = (view: DataView, index: number): number => view.getUint32(index * BYTES_PER_WORD);

const setWordAt = (view: DataView, index: number, word: number): void => {
  view.setUint32(index * BYTES_PER_WORD, word >>> 0);
};

function pad(message: Uint8Array): DataView {
  const bitLength = message.length * 8;
  const paddedBytes =
    Math.ceil((message.length + 1 + LENGTH_FIELD_BYTES) / BLOCK_BYTES) * BLOCK_BYTES;
  const padded = new Uint8Array(paddedBytes);
  padded.set(message);
  padded[message.length] = PADDING_BYTE;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedBytes - LENGTH_FIELD_BYTES, Math.floor(bitLength / 2 ** WORD_BITS));
  view.setUint32(paddedBytes - BYTES_PER_WORD, bitLength >>> 0);
  return view;
}

function expandSchedule(padded: DataView, blockOffset: number): DataView {
  const schedule = new DataView(new ArrayBuffer(SCHEDULE_WORDS * BYTES_PER_WORD));
  for (let i = 0; i < BLOCK_WORDS; i += 1) {
    setWordAt(schedule, i, padded.getUint32(blockOffset + i * BYTES_PER_WORD));
  }
  for (let i = BLOCK_WORDS; i < SCHEDULE_WORDS; i += 1) {
    const w15 = wordAt(schedule, i - 15);
    const w2 = wordAt(schedule, i - 2);
    const sigma0 = rotateRight(w15, 7) ^ rotateRight(w15, 18) ^ (w15 >>> 3);
    const sigma1 = rotateRight(w2, 17) ^ rotateRight(w2, 19) ^ (w2 >>> 10);
    setWordAt(schedule, i, wordAt(schedule, i - 16) + sigma0 + wordAt(schedule, i - 7) + sigma1);
  }
  return schedule;
}

function compress(hash: DataView, schedule: DataView): void {
  let a = wordAt(hash, 0);
  let b = wordAt(hash, 1);
  let c = wordAt(hash, 2);
  let d = wordAt(hash, 3);
  let e = wordAt(hash, 4);
  let f = wordAt(hash, 5);
  let g = wordAt(hash, 6);
  let h = wordAt(hash, 7);
  for (const [round, roundConstant] of SHA256_ROUND_CONSTANTS.entries()) {
    const bigSigma1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
    const choose = (e & f) ^ (~e & g);
    const temp1 = (h + bigSigma1 + choose + roundConstant + wordAt(schedule, round)) >>> 0;
    const bigSigma0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
    const majority = (a & b) ^ (a & c) ^ (b & c);
    const temp2 = (bigSigma0 + majority) >>> 0;
    h = g;
    g = f;
    f = e;
    e = (d + temp1) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (temp1 + temp2) >>> 0;
  }
  [a, b, c, d, e, f, g, h].forEach((word, index) => {
    setWordAt(hash, index, wordAt(hash, index) + word);
  });
}

const toHex = (hash: DataView): string =>
  Array.from({ length: HASH_WORDS }, (_, index) =>
    wordAt(hash, index).toString(HEX_RADIX).padStart(HEX_DIGITS_PER_WORD, '0'),
  ).join('');

export function sha256Hex(text: string): string {
  const padded = pad(new TextEncoder().encode(text));
  const hash = new DataView(new ArrayBuffer(HASH_WORDS * BYTES_PER_WORD));
  SHA256_INITIAL_HASH.forEach((word, index) => {
    setWordAt(hash, index, word);
  });
  for (let offset = 0; offset < padded.byteLength; offset += BLOCK_BYTES) {
    compress(hash, expandSchedule(padded, offset));
  }
  return toHex(hash);
}
