import { migrate } from './migrations';
import { validateState, type AppState } from './schema';

// A backup code is "RF1." + base64url(deflate(JSON)). "RF0." is the same without compression,
// used where the browser cannot compress.
const COMPRESSED_PREFIX = 'RF1.';
const PLAIN_PREFIX = 'RF0.';
const MAX_CODE_LENGTH = 50_000;
const MAX_JSON_BYTES = 500_000;

export type BackupError = 'empty' | 'format' | 'damaged' | 'too-new' | 'invalid';
export type BackupResult = { ok: true; state: AppState } | { ok: false; reason: BackupError };

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function readLimited(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_JSON_BYTES) {
      await reader.cancel();
      throw new Error('backup too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  chunks.reduce((offset, chunk) => (bytes.set(chunk, offset), offset + chunk.length), 0);
  return bytes;
}

function transform(bytes: Uint8Array<ArrayBuffer>, transformer: GenericTransformStream) {
  const stream = new Blob([bytes]).stream().pipeThrough(transformer);
  return readLimited(stream as ReadableStream<Uint8Array>);
}

export async function createBackupCode(state: AppState): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(state));
  if (typeof CompressionStream === 'undefined') return PLAIN_PREFIX + toBase64Url(json);
  return (
    COMPRESSED_PREFIX + toBase64Url(await transform(json, new CompressionStream('deflate-raw')))
  );
}

async function decodeJson(code: string): Promise<unknown> {
  const bytes = fromBase64Url(code.slice(COMPRESSED_PREFIX.length));
  const json = code.startsWith(PLAIN_PREFIX)
    ? bytes
    : await transform(bytes, new DecompressionStream('deflate-raw'));
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(json));
}

/** Strict check of a backup code. Either the whole state is returned or nothing at all. */
export async function readBackupCode(input: string): Promise<BackupResult> {
  const code = input.replace(/\s+/g, '');
  if (code === '') return { ok: false, reason: 'empty' };
  if (code.length > MAX_CODE_LENGTH || !/^RF[01]\.[A-Za-z0-9_-]+$/.test(code)) {
    return { ok: false, reason: 'format' };
  }
  let parsed: unknown;
  try {
    parsed = await decodeJson(code);
  } catch {
    return { ok: false, reason: 'damaged' };
  }
  const migrated = migrate(parsed);
  if (!migrated.ok) {
    return { ok: false, reason: migrated.reason === 'too-new' ? 'too-new' : 'invalid' };
  }
  const validated = validateState(migrated.value);
  return validated.ok ? { ok: true, state: validated.state } : { ok: false, reason: 'invalid' };
}
