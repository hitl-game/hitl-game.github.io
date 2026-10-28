import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { sha256Hex } from './sha256';

// Web Crypto is the independent oracle: it runs in Node and in every target browser.
async function webCryptoSha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

describe('sha256Hex', () => {
  it.each([
    ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
    ['abc', 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],
    [
      'abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq',
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    ],
  ])('matches the NIST vector for %j', (text, expected) => {
    expect(sha256Hex(text)).toBe(expected);
  });

  it('hashes multi-byte UTF-8 text as its UTF-8 bytes', async () => {
    const text = 'héllo wörld — 日本語 😀';

    expect(sha256Hex(text)).toBe(await webCryptoSha256Hex(text));
  });

  it.each([55, 56, 63, 64, 65, 119, 120, 128])(
    'pads a %i-byte message like the reference implementation',
    async (length) => {
      const text = 'a'.repeat(length);

      expect(sha256Hex(text)).toBe(await webCryptoSha256Hex(text));
    },
  );

  it('agrees with Web Crypto on arbitrary strings', async () => {
    await fc.assert(
      fc.asyncProperty(fc.string({ unit: 'grapheme' }), async (text) => {
        expect(sha256Hex(text)).toBe(await webCryptoSha256Hex(text));
      }),
    );
  });
});
