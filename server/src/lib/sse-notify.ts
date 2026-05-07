type SseChunkWriter = (chunk: string) => void;

const byUser = new Map<string, Set<SseChunkWriter>>();

export function sseSubscribe(userId: string, writer: SseChunkWriter): () => void {
  let set = byUser.get(userId);
  if (!set) {
    set = new Set();
    byUser.set(userId, set);
  }
  set.add(writer);
  return () => {
    set!.delete(writer);
    if (set!.size === 0) {
      byUser.delete(userId);
    }
  };
}

export function sseNotifyUser(userId: string, event: Record<string, unknown>): void {
  const set = byUser.get(userId);
  if (!set?.size) return;
  const raw = `data: ${JSON.stringify(event)}\n\n`;
  for (const w of set) {
    try {
      w(raw);
    } catch {
      /* يتجاهل انقطاع العميل */
    }
  }
}
