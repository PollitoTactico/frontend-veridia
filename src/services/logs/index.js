import { Logger } from "./Logger";
import { ConsoleTransport } from "./transports/ConsoleTransport";
import { HttpTransport } from "./transports/HttpTransport";
import { redact } from "./redact";

const ENV_LEVEL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_LOG_LEVEL) ||
  process.env.REACT_APP_LOG_LEVEL || "info";

const REMOTE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_LOG_HTTP_URL) ||
  process.env.REACT_APP_LOG_HTTP_URL || "";

function wrapRedaction(transport) {
  return {
    log(evt) {
      const safeEvt = {
        ...evt,
        context: redact(evt.context),
        data: redact(evt.data)
      };
      return transport.log(safeEvt);
    }
  };
}

const transports = [wrapRedaction(new ConsoleTransport())];

if (REMOTE_URL) {
  transports.push(wrapRedaction(new HttpTransport({ url: REMOTE_URL })));
}

export const logger = new Logger({
  level: ENV_LEVEL,
  context: { app: "veridia-web" },
  transports
});

export function getLogger(scope) {
  return logger.child(scope ? { scope } : {});
}