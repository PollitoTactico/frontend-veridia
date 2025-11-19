const LEVELS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 60,
};

export class Logger {
  /**
   * @param {{level?: keyof typeof LEVELS, context?: object, transports?: Array<{log:(evt:any)=>void|Promise<void>}>}} opts
   */
  constructor({ level = "info", context = {}, transports = [] } = {}) {
    this.level = level;
    this.context = { ...context };
    this.transports = [...transports];
  }

  child(extraCtx = {}) {
    return new Logger({
      level: this.level,
      context: { ...this.context, ...extraCtx },
      transports: this.transports,
    });
  }

  setLevel(level) {
    this.level = level;
  }

  addTransport(t) {
    this.transports.push(t);
  }
  removeTransport(t) {
    this.transports = this.transports.filter((x) => x !== t);
  }

  async log(level, msg, data) {
    if (LEVELS[level] < LEVELS[this.level]) return;
    const evt = {
      ts: new Date().toISOString(),
      level,
      msg,
      context: this.context,
      data,
    };
    for (const t of this.transports) {
      try {
        await t.log(evt);
      } catch {}
    }
  }

  trace(m, d) {
    return this.log("trace", m, d);
  }
  debug(m, d) {
    return this.log("debug", m, d);
  }
  info(m, d) {
    return this.log("info", m, d);
  }
  warn(m, d) {
    return this.log("warn", m, d);
  }
  error(m, d) {
    return this.log("error", m, d);
  }
}
