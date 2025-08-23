const DEFAULT_MAX = 100;
const DEFAULT_TTL = Infinity;

export class LRUCache<K, V> {
  private readonly cache: Map<K, { value: V; expired: number }> = new Map();

  private readonly max;

  private readonly ttl: number;

  public constructor(options?: { max?: number; ttl?: number }) {
    this.max = options?.max ?? DEFAULT_MAX;
    this.ttl = options?.ttl ?? DEFAULT_TTL;
  }

  public get(key: K): V | undefined {
    const data = this.cache.get(key);
    if (!data) return undefined;
    this.cache.delete(key);
    this.cache.set(key, data);
    return data.value;
  }

  public set(key: K, value: V): void {
    this.cache.delete(key);
    this.cache.set(key, { value, expired: Date.now() + this.ttl });
    let needDelete = this.cache.size - this.max;
    for (const [k, data] of this.cache) {
      if (needDelete <= 0 && data.expired >= Date.now()) {
        break;
      }
      this.cache.delete(k);
      needDelete--;
    }
  }
}
