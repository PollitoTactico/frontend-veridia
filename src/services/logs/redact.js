const SENSITIVE_KEYS = [
  "password",
  "pass",
  "token",
  "idtoken",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "apikey",
  "api_key",
  "secret",
  "clientsecret",
  "cookie",
  "set-cookie",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

function maskEmail(s) {
  const [user, domain] = s.split("@");
  if (!user || !domain) return s;
  if (user.length <= 2) return `*@"${domain}"`;
  return `${user[0]}${"*".repeat(Math.min(user.length - 2, 6))}${user.slice(
    -1
  )}@${domain}`;
}

function isPlainObject(v) {
  return Object.prototype.toString.call(v) === "[object Object]";
}

export function redact(value, keyHint) {
  if (value == null) return value;

  // Por clave sensible
  if (keyHint && SENSITIVE_KEYS.includes(String(keyHint).toLowerCase())) {
    return "[REDACTED]";
  }

  // Strings
  if (typeof value === "string") {
    if (EMAIL_RE.test(value)) return maskEmail(value);
    if (value.length > 300) return value.slice(0, 200) + "…[truncated]";
    return value;
  }

  // Arrays
  if (Array.isArray(value)) {
    return value.map((v) => redact(v));
  }

  // Objetos
  if (isPlainObject(value)) {
    const out = {};
    for (const k of Object.keys(value)) {
      out[k] = redact(value[k], k);
    }
    return out;
  }

  // Headers
  if (value instanceof Headers) {
    const out = {};
    value.forEach((v, k) => {
      out[k] = redact(v, k);
    });
    return out;
  }

  return value;
}
