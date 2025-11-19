export class ConsoleTransport {
  log(evt) {
    const { level, msg, data, ts, context } = evt;
    const base = `[${ts}] ${level.toUpperCase()}: ${msg}`;
    const payload = { ...(context || {}), ...(data || {}) };
    const fn = console[level] || console.log;
    fn.call(console, base, Object.keys(payload).length ? payload : "");
  }
}