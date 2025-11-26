import { useEffect, useRef, useState } from "react";
import { procesarAudio } from "../services/api/transcriptionApi";
import { Button, Box, Typography, Paper, Stack, Chip, LinearProgress } from "@mui/material";
import LoadingModal from "./LoadingModal";
import { getLogger } from "../services/logs";
import { motion } from "framer-motion";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import SendIcon from "@mui/icons-material/Send";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

const MotionBox = motion.create(Box);
const MotionButton = motion.create(Button);
const log = getLogger("audio.recorder");

function CustomAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (e) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="small"
            variant="contained"
            onClick={togglePlay}
            sx={{
              minWidth: 40,
              width: 40,
              height: 40,
              borderRadius: "50%",
              p: 0,
              background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
              boxShadow: "0 2px 8px rgba(0, 102, 204, 0.25)",
              flexShrink: 0,
            }}
          >
            {isPlaying ? <PauseIcon sx={{ fontSize: 20 }} /> : <PlayArrowIcon sx={{ fontSize: 20 }} />}
          </Button>
        </motion.div>

        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, minWidth: "50px" }}>
          {formatTime(currentTime)}
        </Typography>

        <Box sx={{ flex: 1, position: "relative" }}>
          <LinearProgress 
            variant="determinate" 
            value={progressPercent}
            sx={{
              height: 6,
              borderRadius: 3,
              background: "rgba(0, 102, 204, 0.15)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                boxShadow: "0 0 8px rgba(0, 102, 204, 0.4)",
              },
            }}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSliderChange}
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "100%",
              height: "6px",
              borderRadius: "3px",
              outline: "none",
              cursor: "pointer",
              WebkitAppearance: "none",
              MozAppearance: "none",
              background: "transparent",
              transform: "translateY(-50%)",
              pointerEvents: "auto",
            }}
          />
        </Box>

        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, minWidth: "50px", textAlign: "right" }}>
          {formatTime(duration)}
        </Typography>
      </Box>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          WebkitAppearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 102, 204, 0.35);
          border: none;
          transition: all 0.2s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.5);
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 102, 204, 0.35);
          border: none;
          transition: all 0.2s ease;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.3);
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.5);
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          border: none;
        }
      `}</style>
    </>
  );
}

const AudioRecorder = ({ onData, analysisMode = "complete" }) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      try {
        mediaRecorderRef.current?.stream?.getTracks?.().forEach((t) => t.stop());
      } catch {}
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioURL) {
        try {
          URL.revokeObjectURL(audioURL);
        } catch {}
      }
    };
  }, [audioURL]);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    onData?.(null);
    if (audioURL) {
      try { URL.revokeObjectURL(audioURL); } catch {}
    }
    setAudioURL(null);
    setRecordingTime(0);
    setLoading(false);

    if (!navigator.mediaDevices || typeof window.MediaRecorder === "undefined") {
      log.warn("media_devices_unavailable");
      alert("La grabación de audio no es soportada en este navegador.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new window.MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data?.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, {
          type: mediaRecorderRef.current.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        log.debug("recording_blob_ready", { size: audioBlob.size, type: audioBlob.type });
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      log.info("recording_started", { mime: mediaRecorderRef.current.mimeType });
    } catch (err) {
      log.error("recording_start_failed", { message: String(err) });
      alert("No se pudo iniciar la grabación.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream?.getTracks?.().forEach((t) => t.stop());
      } catch (e) {
        log.warn("recording_stop_warning", { message: String(e) });
      }
      setRecording(false);
      log.info("recording_stopped");
    }
  };

  const sendAudio = async () => {
    if (!audioURL) return;
    setLoading(true);
    onData?.(null);

    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();

      let extension = "webm";
      const mime = blob.type || "audio/webm";
      if (mime.includes("ogg")) extension = "ogg";
      else if (mime.includes("wav")) extension = "wav";
      else if (mime.includes("mp3")) extension = "mp3";

      const file = new File([blob], `grabacion.${extension}`, { type: mime });
      log.info("send_start", { mime, size: blob.size, mode: analysisMode });

      const useSimple = analysisMode === "simple";
      const data = await procesarAudio(file, useSimple);
      onData?.(data);
      log.info("send_success", { mode: analysisMode });
    } catch (err) {
      let errorMsg = "Error al enviar el audio.";
      if (err?.response?.data?.error) errorMsg = err.response.data.error;
      else if (err?.message) errorMsg = err.message;

      onData?.({ error: errorMsg });
      log.error("send_failed", { message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingModal open={loading} />
      <MotionBox
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            border: "1px solid rgba(0, 102, 204, 0.1)",
          }}
        >
          <Stack spacing={2.5}>
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 1.5,
                  background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MicIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0066cc" }}>
                Grabadora de voz
              </Typography>
            </Box>

            {/* Recording Time Display */}
            {recording && (
              <motion.div
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Box sx={{ textAlign: "center", py: 1.5 }}>
                  <Chip
                    label={`Grabando... ${formatTime(recordingTime)}`}
                    color="error"
                    sx={{ fontWeight: 600, fontSize: "14px" }}
                  />
                </Box>
              </motion.div>
            )}

            {/* Buttons */}
            <Stack direction="row" spacing={1.5} justifyContent="center">
              <MotionButton
                variant="contained"
                onClick={startRecording}
                disabled={recording || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  background: recording
                    ? "linear-gradient(135deg, #ccc 0%, #999 100%)"
                    : "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                  boxShadow: "0 4px 12px rgba(0, 102, 204, 0.25)",
                  "&:hover:not(:disabled)": {
                    boxShadow: "0 6px 16px rgba(0, 102, 204, 0.35)",
                  },
                }}
              >
                Grabar
              </MotionButton>

              <MotionButton
                variant="outlined"
                startIcon={<StopIcon />}
                onClick={stopRecording}
                disabled={!recording || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  borderColor: recording ? "error.main" : "grey.300",
                  color: recording ? "error.main" : "text.secondary",
                }}
              >
                Detener
              </MotionButton>

              <MotionButton
                variant="contained"
                startIcon={<SendIcon />}
                onClick={sendAudio}
                disabled={!audioURL || recording || loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 3,
                  background: audioURL
                    ? "linear-gradient(135deg, #00a896 0%, #00796b 100%)"
                    : "linear-gradient(135deg, #ccc 0%, #999 100%)",
                  boxShadow: audioURL ? "0 4px 12px rgba(0, 168, 150, 0.25)" : "none",
                }}
              >
                Enviar
              </MotionButton>
            </Stack>

            {/* Audio Player */}
            {audioURL && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, rgba(0, 102, 204, 0.08) 0%, rgba(0, 82, 163, 0.04) 100%)",
                    border: "1.5px solid rgba(0, 102, 204, 0.15)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 1.5, display: "block", fontSize: "12px" }}>
                    🎵 Previsualización de audio
                  </Typography>
                  <CustomAudioPlayer src={audioURL} />
                </Box>
              </motion.div>
            )}
          </Stack>
        </Paper>
      </MotionBox>
    </>
  );
};

export default AudioRecorder;
