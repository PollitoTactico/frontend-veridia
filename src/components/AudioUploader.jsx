import { useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

import useFileValidation from "../apps/home/hooks/useFileValidation";
import { procesarAudio } from "../services/api/transcriptionApi";
import LoadingModal from "./LoadingModal";
import { getLogger } from "../services/logs";
const log = getLogger("audio.uploader");

const MotionBox = motion.create(Box);
const MotionButton = motion.create(Button);

const getFileIcon = (file) => {
  const { type } = file;
  if (type === "audio/mpeg")
    return <MusicNoteIcon sx={{ fontSize: 48, color: "#0066cc", mb: 1 }} />;
  if (type === "audio/wav")
    return <GraphicEqIcon sx={{ fontSize: 48, color: "#0066cc", mb: 1 }} />;
  if (type.startsWith("audio/"))
    return <AudiotrackIcon sx={{ fontSize: 48, color: "#0066cc", mb: 1 }} />;
  return <InsertDriveFileIcon sx={{ fontSize: 48, color: "#0066cc", mb: 1 }} />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AudioUploader = ({ onData, analysisMode = "complete" }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Validación de archivo
  const { valid, error: validationError } = useFileValidation(file, {
    types: ["audio/wav", "audio/mpeg", "audio/mp3", "audio/aac", "audio/ogg"],
    maxSize: 5 * 1024 * 1024,
  });

  const handleChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setError(null);
    if (f) log.debug("file_selected", { mime: f.type, size: f.size });
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setError(null);
      log.debug("file_dropped", { mime: f.type, size: f.size });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo de audio");
      return;
    }
    if (!valid) {
      setError(validationError || "Archivo no válido");
      return;
    }

    setError(null);
    setLoading(true);
    log.info("upload_start", { mime: file.type, size: file.size, mode: analysisMode });

    try {
      const useSimple = analysisMode === "simple";
      const extracted = await procesarAudio(file, useSimple);
      onData(extracted);
      log.info("upload_success", { mode: analysisMode });
    } catch (err) {
      setError(err.message ?? "Error al procesar el audio");
      log.warn("upload_failed", { message: err?.message || "unknown" });
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <>
      <LoadingModal open={loading} />
      <MotionBox
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            border: "1px solid rgba(0, 102, 204, 0.1)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box sx={{ p: 3, borderBottom: "1px solid rgba(0, 102, 204, 0.1)" }}>
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
                <CloudUploadIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0066cc" }}>
                Subir archivo de audio
              </Typography>
            </Box>
          </Box>

          {/* Drop Zone */}
          <Box sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              {!file ? (
                <motion.label
                  htmlFor="audio-upload"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{ cursor: "pointer", display: "block" }}
                  animate={{
                    scale: dragActive ? 1.02 : 1,
                  }}
                >
                  <MotionBox
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    sx={{
                      border: "2.5px dashed",
                      borderColor: dragActive
                        ? "#0066cc"
                        : "rgba(0, 102, 204, 0.25)",
                      borderRadius: 2.5,
                      p: 4,
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      background: dragActive
                        ? "rgba(0, 102, 204, 0.05)"
                        : "rgba(0, 102, 204, 0.02)",
                    }}
                  >
                    <input
                      accept="audio/*"
                      id="audio-upload"
                      type="file"
                      hidden
                      onChange={handleChange}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <CloudUploadIcon
                        sx={{
                          fontSize: 56,
                          color: dragActive ? "#0066cc" : "rgba(0, 102, 204, 0.4)",
                          mb: 2,
                        }}
                      />
                    </motion.div>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#0066cc",
                        mb: 0.5,
                      }}
                    >
                      Arrastra tu archivo aquí
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      o haz clic para seleccionar
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.disabled", display: "block", mt: 1 }}
                    >
                      MP3, WAV, AAC, OGG (máx. 5 MB)
                    </Typography>
                  </MotionBox>
                </motion.label>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      background: "rgba(0, 102, 204, 0.08)",
                      border: "2px solid rgba(0, 102, 204, 0.2)",
                    }}
                  >
                    <Stack spacing={2}>
                      {/* File Info */}
                      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, justifyContent: "space-between" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                          <Box sx={{ flexShrink: 0 }}>
                            {getFileIcon(file)}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, wordBreak: "break-word" }}>
                              {file.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                        </Box>
                        <CheckCircleIcon sx={{ color: "#00a896", fontSize: 28, flexShrink: 0, mt: 0.5 }} />
                      </Box>

                      {/* Validation Status */}
                      {!valid && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <Alert severity="error" icon={<ErrorIcon />}>
                            {validationError}
                          </Alert>
                        </motion.div>
                      )}

                      {/* Clear Button */}
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <MotionButton
                          size="small"
                          onClick={clearFile}
                          variant="text"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          sx={{
                            textTransform: "none",
                            color: "text.secondary",
                            fontSize: "12px",
                            padding: "4px 8px",
                            "&:hover": { color: "error.main", background: "rgba(244, 67, 54, 0.05)" },
                          }}
                        >
                          ↻ Cambiar
                        </MotionButton>
                      </Box>
                    </Stack>
                  </Paper>
                </motion.div>
              )}

              {/* Error Messages */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert severity="error" icon={<ErrorIcon />}>
                    {error}
                  </Alert>
                </motion.div>
              )}

              {/* Upload Button */}
              <MotionButton
                fullWidth
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <UploadFileIcon />
                  )
                }
                onClick={handleUpload}
                disabled={!file || !valid || loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1.5,
                  background: file && valid
                    ? "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)"
                    : "linear-gradient(135deg, #ccc 0%, #999 100%)",
                  boxShadow: file && valid ? "0 4px 12px rgba(0, 102, 204, 0.25)" : "none",
                  "&:hover:not(:disabled)": {
                    boxShadow: "0 6px 16px rgba(0, 102, 204, 0.35)",
                  },
                }}
              >
                {loading ? "Procesando..." : "Subir y procesar"}
              </MotionButton>
            </Stack>
          </Box>
        </Paper>
      </MotionBox>
    </>
  );
};

export default AudioUploader;
