export class HttpTransport {
  /**
   * @param {{ url: string, headers?: object, batchSize?: number, flushInterval?: number }} cfg
   */
  constructor({ url, headers = {}, batchSize = 10, flushInterval = 3000 }) {
    this.url = url;
    this.headers = { "Content-Type": "application/json", ...headers };
    this.batchSize = batchSize;
    this.queue = [];
    this.timer = setInterval(() => this.flush().catch(()=>{}), flushInterval);
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        try {
          if (this.queue.length) {
            navigator.sendBeacon?.(this.url, new Blob([JSON.stringify(this.queue)], { type: "application/json" }));
          }
        } catch {}
      });
    }
  }

  async log(evt) {
    this.queue.push(evt);
    if (this.queue.length >= this.batchSize) await this.flush();
  }

  async flush() {
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, this.batchSize);
    await fetch(this.url, { method: "POST", headers: this.headers, body: JSON.stringify(batch), keepalive: true });
  }
}