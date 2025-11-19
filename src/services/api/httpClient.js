import { getLogger } from "../logs";
const log = getLogger("http.client");

function buildURL(baseURL, path) {
  const BASE = baseURL?.endsWith("/") ? baseURL : `${baseURL || ""}/`;
  const clean = String(path || "").replace(/^\/+/, "");
  return new URL(clean, BASE).toString();
}

function stripQuery(urlOrPath) {
  const s = String(urlOrPath || "");
  const i = s.indexOf("?");
  return i === -1 ? s : s.slice(0, i);
}

function genRequestId() {
  try {
    if (typeof window !== "undefined" &&
        window.crypto &&
        typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
  } catch {}
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

/**
 * @param {object} cfg
 * @param {string} cfg.baseURL
 * @param {(force:boolean)=>Promise<string|null>} cfg.tokenProvider - obtiene el idToken
 * @param {number} [cfg.timeoutMs=200000]
 */

export function createHttpClient({ baseURL, tokenProvider, timeoutMs = 200000 }) {
  async function request(method, path, { body, headers } = {}, retried = false) {
    const started = performance.now();
    const pathForLog = stripQuery(path);
    const requestId = genRequestId();

    const token = await tokenProvider(false);
    if (!token) {
      log.warn("no_token", { method, path: pathForLog });
      const e = new Error("NO_AUTH_TOKEN");
      e.code = "NO_AUTH_TOKEN";
      throw e;
    }

    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    log.debug("request", { requestId, method, path: pathForLog });

    let res;
    try {
      res = await fetch(buildURL(baseURL, path), {
        method,
        headers: {
          ...(!isForm && body ? { "Content-Type": "application/json" } : {}),
          ...headers,
          Authorization: `Bearer ${token}`,
          "X-Request-Id": requestId,
        },
        body: isForm ? body : body ? JSON.stringify(body) : undefined,
        credentials: "omit",
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timer);
      const durationMs = Math.round(performance.now() - started);
      log.error("network_error", { requestId, method, path: pathForLog, durationMs, message: String(err) });
      throw err;
    } finally {
      clearTimeout(timer);
    }

    if (res.status === 401 && !retried) {
      log.debug("unauthorized_retry", { requestId, method, path: pathForLog });
      const fresh = await tokenProvider(true);
      if (!fresh) {
        const e = new Error("NO_AUTH_TOKEN_REFRESH");
        e.code = "NO_AUTH_TOKEN_REFRESH";
        log.warn("refresh_failed", { requestId, method, path: pathForLog });
        throw e;
      }
      return request(method, path, { body, headers }, true);
    }

    const durationMs = Math.round(performance.now() - started);
    const level =
      res.status >= 500 ? "error" :
      res.status >= 400 ? "warn"  : "info";

    log[level]("response", {
      requestId, method, path: pathForLog, status: res.status, durationMs
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.body = text;
      throw err;
    }

    const ct = res.headers.get("content-type") || "";
    return ct.includes("application/json") ? res.json() : res.text();
  }

  return {
    get:   (p, opts)           => request("GET",    p, opts),
    post:  (p, body, opts={})  => request("POST",   p, { ...opts, body }),
    put:   (p, body, opts={})  => request("PUT",    p, { ...opts, body }),
    patch: (p, body, opts={})  => request("PATCH",  p, { ...opts, body }),
    del:   (p, opts)           => request("DELETE", p, opts),
  };
}