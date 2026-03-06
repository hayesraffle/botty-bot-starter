export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private queue: (() => void)[] = [];

  constructor(
    private maxTokens: number = 80,
    private refillIntervalMs: number = 60_000
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = Math.floor(
      (elapsed / this.refillIntervalMs) * this.maxTokens
    );
    if (newTokens > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
      this.lastRefill = now;
    }
  }

  async acquire(): Promise<void> {
    this.refill();
    if (this.tokens > 0) {
      this.tokens--;
      return;
    }
    return new Promise((resolve) => {
      this.queue.push(resolve);
      setTimeout(() => {
        this.refill();
        const waiting = this.queue.shift();
        if (waiting) {
          this.tokens--;
          waiting();
        }
      }, this.refillIntervalMs / this.maxTokens);
    });
  }
}
