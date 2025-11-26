import { useCallback, useMemo } from "react";
import { useApi, API_BASE } from "./apiClient";
import { createHttpClient } from "./httpClient";
import { auth } from "../auth/firebase/firebaseConfig";
import { getLogger } from "../logs";
const log = getLogger("api.transcription");

const tokenProvider = (force = false) => {
  const u = auth.currentUser;
  if (!u) return Promise.resolve(null);
  return u.getIdToken(force);
};
const client = createHttpClient({
  baseURL: API_BASE,
  tokenProvider,
  timeoutMs: 200000,
});

export async function procesarAudio(audioFile, useSimpleAnalysis = false) {
  const info = audioFile ? { mime: audioFile.type, size: audioFile.size } : {};
  const endpoint = useSimpleAnalysis ? "transcribe-simple" : "transcribe";
  
  try {
    log.info("transcribe_start", { ...info, mode: useSimpleAnalysis ? "simple" : "complete" });
    const form = new FormData();
    form.append("file", audioFile);
    const res = await client.post(endpoint, form);
    const payload = res?.extracted_data ?? res;
    log.info("transcribe_success", { mode: useSimpleAnalysis ? "simple" : "complete" });
    return payload;
  } catch (e) {
    log.warn("transcribe_failed", {
      message: e?.message || "unknown",
      status: e?.status,
      mode: useSimpleAnalysis ? "simple" : "complete",
    });
    throw e;
  }
}

export function getMe() {
  return client.get("me");
}

export function useTranscriptionApi() {
  const api = useApi();

  const procesarAudioHook = useCallback(
    async (audioFile, useSimpleAnalysis = false) => {
      const info = audioFile
        ? { mime: audioFile.type, size: audioFile.size }
        : {};
      const endpoint = useSimpleAnalysis ? "transcribe-simple" : "transcribe";
      
      try {
        log.info("transcribe_start", { ...info, mode: useSimpleAnalysis ? "simple" : "complete" });
        const form = new FormData();
        form.append("file", audioFile);
        const res = await api.post(endpoint, form);
        const payload = res?.extracted_data ?? res;
        log.info("transcribe_success", { mode: useSimpleAnalysis ? "simple" : "complete" });
        return payload;
      } catch (e) {
        log.warn("transcribe_failed", {
          message: e?.message || "unknown",
          status: e?.status,
          mode: useSimpleAnalysis ? "simple" : "complete",
        });
        throw e;
      }
    },
    [api]
  );

  const getMeHook = useCallback(() => api.get("me"), [api]);

  return useMemo(
    () => ({ procesarAudio: procesarAudioHook, getMe: getMeHook }),
    [procesarAudioHook, getMeHook]
  );
}
