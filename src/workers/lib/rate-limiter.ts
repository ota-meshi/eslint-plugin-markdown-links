/**
 * Rate limiter for URL checks grouped by domain
 */

type QueueItem<T> = {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

export class DomainRateLimiter {
  private queues: Map<string, QueueItem<unknown>[]> = new Map();
  private lastRequestTime: Map<string, number> = new Map();
  private processing: Set<string> = new Set();
  private delayMs: number;

  constructor(delayMs: number) {
    this.delayMs = delayMs;
  }

  /**
   * Execute a function with rate limiting per domain
   */
  async execute<T>(domain: string, fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queue = this.queues.get(domain) || [];
      queue.push({ fn, resolve, reject } as QueueItem<unknown>);
      this.queues.set(domain, queue);

      // Start processing if not already processing for this domain
      if (!this.processing.has(domain)) {
        void this.processQueue(domain);
      }
    });
  }

  private async processQueue(domain: string): Promise<void> {
    this.processing.add(domain);

    const queue = this.queues.get(domain);
    if (!queue || queue.length === 0) {
      this.processing.delete(domain);
      return;
    }

    // Get the next item from the queue
    const item = queue.shift()!;

    // Calculate delay needed
    const lastTime = this.lastRequestTime.get(domain) || 0;
    const now = Date.now();
    const timeSinceLastRequest = now - lastTime;
    const delay = Math.max(0, this.delayMs - timeSinceLastRequest);

    // Wait if needed
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Update last request time
    this.lastRequestTime.set(domain, Date.now());

    // Execute the function
    try {
      const result = await item.fn();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    }

    // Continue processing queue
    await this.processQueue(domain);
  }
}
