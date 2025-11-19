import { useState, useCallback, useEffect } from "react";
import { getLogger } from "../../../services/logs";
const log = getLogger("auth.mode");

// Login, Register y Reset
export function useAuthMode() {
  const [mode, setMode] = useState("login");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const clearMsg = useCallback(() => setMsg({ type: "", text: "" }), []);

  useEffect(() => {
    log.debug("mode_changed", { mode });
  }, [mode]);

  return { mode, setMode, msg, setMsg, clearMsg };
}
