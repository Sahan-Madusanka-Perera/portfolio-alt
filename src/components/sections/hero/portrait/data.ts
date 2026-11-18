// Loads the particle portrait written by scripts/make-portrait.py.
// Layout: "PPT1" | uint32 count | int16 xyz[count*3] | uint8 lum[count]  (little endian)

export type PortraitData = {
  count: number;
  /** x, y, z in [-32767, 32767]; upload as normalized int16. */
  positions: Int16Array;
  /** Brightness 0 to 255; upload as normalized uint8. */
  lum: Uint8Array;
};

const cache = new Map<string, Promise<PortraitData>>();

export function portraitUrl(small: boolean) {
  return small ? "/me/portrait-20k.bin" : "/me/portrait-48k.bin";
}

/** Fetches and parses the file once per URL. `onProgress` gets 0 to 1 while bytes arrive. */
export function loadPortrait(url: string, onProgress?: (p: number) => void): Promise<PortraitData> {
  const hit = cache.get(url);
  if (hit) {
    onProgress?.(1);
    return hit;
  }
  const job = (async () => {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`portrait ${res.status}`);
    const total = Number(res.headers.get("content-length")) || 0;
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      if (total) onProgress?.(Math.min(received / total, 1));
    }
    onProgress?.(1);
    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    return parse(bytes.buffer);
  })();
  cache.set(url, job);
  job.catch(() => cache.delete(url));
  return job;
}

function parse(buffer: ArrayBuffer): PortraitData {
  const view = new DataView(buffer);
  const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (magic !== "PPT1") throw new Error("not a portrait file");
  const count = view.getUint32(4, true);
  // 8-byte header keeps the int16 block aligned.
  const positions = new Int16Array(buffer, 8, count * 3);
  const lum = new Uint8Array(buffer, 8 + count * 6, count);
  return { count, positions, lum };
}
