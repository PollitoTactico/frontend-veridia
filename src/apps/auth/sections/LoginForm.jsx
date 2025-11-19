import { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Typography,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { motion } from "framer-motion";
import { useAuth } from "../../../services/auth/firebase/AuthContext";
import { mapAuthError } from "../utils/errorMap";
import { getLogger } from "../../../services/logs";
const log = getLogger("auth.login");

// Crear componentes motion
const MotionBox = motion.create(Box);
const MotionButton = motion.create(Button);

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function LoginForm({ setMode, setMsg, onSuccess }) {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setBusy(true);
    const emailDomain = (email.split("@")[1] || "").toLowerCase();
    log.info("submit_email_login", { emailDomain });
    try {
      await loginWithEmail(email.trim(), pass);
      log.info("login_success_email");
      onSuccess?.();
    } catch (e2) {
      log.warn("login_failed_email", { code: e2?.code || "unknown" });
      setMsg({ type: "error", text: mapAuthError(e2.code, e2.message) });
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setMsg({ type: "", text: "" });
    setBusy(true);
    log.info("submit_google_login");
    try {
      await loginWithGoogle();
      log.info("login_success_google");
      onSuccess?.();
    } catch (e2) {
      log.warn("login_failed_google", { code: e2?.code || "unknown" });
      setMsg({ type: "error", text: mapAuthError(e2.code, e2.message) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <MotionBox
      component="form"
      onSubmit={handleLogin}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Stack spacing={3}>
        {/* Email Field */}
        <motion.div custom={0} variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
            autoFocus
            disabled={busy}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <EmailOutlinedIcon
                      sx={{
                        color: "primary.main",
                        fontSize: 20,
                      }}
                    />
                  </motion.div>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 102, 204, 0.08)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 20px rgba(0, 102, 204, 0.15)",
                },
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 12px",
                fontSize: "14px",
              },
            }}
          />
        </motion.div>

        {/* Password Field */}
        <motion.div custom={1} variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <TextField
            label="Contraseña"
            type={showPass ? "text" : "password"}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            fullWidth
            required
            disabled={busy}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                  >
                    <LockOutlinedIcon
                      sx={{
                        color: "primary.main",
                        fontSize: 20,
                      }}
                    />
                  </motion.div>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
                    <IconButton
                      onClick={() => setShowPass((s) => !s)}
                      edge="end"
                      size="small"
                      disabled={busy}
                      sx={{
                        color: "text.secondary",
                      }}
                    >
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </motion.div>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(0, 102, 204, 0.08)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 20px rgba(0, 102, 204, 0.15)",
                },
              },
              "& .MuiOutlinedInput-input": {
                padding: "12px 12px",
                fontSize: "14px",
              },
            }}
          />
        </motion.div>

        {/* Primary Login Button */}
        <motion.div custom={2} variants={itemVariants}>
          <MotionButton
            type="submit"
            variant="contained"
            fullWidth
            disabled={busy}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              padding: "12px 16px",
              fontSize: "15px",
              fontWeight: 600,
              borderRadius: 2,
              background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
              textTransform: "none",
              boxShadow: "0 4px 15px rgba(0, 102, 204, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 25px rgba(0, 102, 204, 0.4)",
              },
              "&:disabled": {
                background: "linear-gradient(135deg, #cccccc 0%, #b3b3b3 100%)",
                boxShadow: "none",
              },
            }}
          >
            {busy ? (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Iniciando...
              </motion.span>
            ) : (
              "Iniciar sesión"
            )}
          </MotionButton>
        </motion.div>

        {/* Google Login Button */}
        <motion.div custom={3} variants={itemVariants}>
          <MotionButton
            variant="outlined"
            fullWidth
            onClick={handleGoogle}
            disabled={busy}
            startIcon={<GoogleIcon />}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              padding: "12px 16px",
              fontSize: "15px",
              fontWeight: 500,
              borderRadius: 2,
              textTransform: "none",
              borderColor: "#e0e0e0",
              color: "#333333",
              backgroundColor: "#ffffff",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "#f8f9fa",
                borderColor: "#0066cc",
                color: "#0066cc",
              },
              "&:disabled": {
                borderColor: "#e0e0e0",
                color: "#999999",
              },
            }}
          >
            Continuar con Google
          </MotionButton>
        </motion.div>

        {/* Divider */}
        <motion.div custom={4} variants={itemVariants}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Divider sx={{ flex: 1 }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              o
            </Typography>
            <Divider sx={{ flex: 1 }} />
          </Box>
        </motion.div>

        {/* Links */}
        <motion.div custom={5} variants={itemVariants}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setMode("reset");
                }}
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#0066cc",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#0052a3",
                    textDecoration: "underline",
                  },
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setMode("register");
                }}
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#0066cc",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#0052a3",
                    textDecoration: "underline",
                  },
                }}
              >
                Crear cuenta
              </Link>
            </motion.div>
          </Stack>
        </motion.div>
      </Stack>
    </MotionBox>
  );
}
