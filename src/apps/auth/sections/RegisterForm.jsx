import { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { motion } from "framer-motion";
import { useAuth } from "../../../services/auth/firebase/AuthContext";
import { mapAuthError } from "../utils/errorMap";
import { getLogger } from "../../../services/logs";
const log = getLogger("auth.register");

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

export default function RegisterForm({ setMode, setMsg }) {
  const { registerWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    const emailDomain = (email.split("@")[1] || "").toLowerCase();

    if (pass.length < 6) {
      setMsg({
        type: "error",
        text: "La contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }
    if (pass !== pass2) {
      setMsg({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setBusy(true);
    log.info("submit_register", { emailDomain, passLen: pass.length });
    try {
      await registerWithEmail(email.trim(), pass);
      log.info("register_success", { emailDomain });
      setMsg({
        type: "success",
        text: "Registro exitoso. Revisa tu correo para verificar la cuenta.",
      });
      setMode("login");
      setPass("");
      setPass2("");
    } catch (e2) {
      log.warn("register_failed", { code: e2?.code || "unknown" });
      setMsg({ type: "error", text: mapAuthError(e2.code, e2.message) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <MotionBox
      component="form"
      onSubmit={handleRegister}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Stack spacing={3}>
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
                      sx={{ color: "primary.main", fontSize: 20 }}
                    />
                  </motion.div>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": { boxShadow: "0 4px 12px rgba(0, 102, 204, 0.08)" },
                "&.Mui-focused": {
                  boxShadow: "0 4px 20px rgba(0, 102, 204, 0.15)",
                },
              },
              "& .MuiOutlinedInput-input": { padding: "12px 12px", fontSize: "14px" },
            }}
          />
        </motion.div>

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
                      sx={{ color: "primary.main", fontSize: 20 }}
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
                      sx={{ color: "text.secondary" }}
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
                "&:hover": { boxShadow: "0 4px 12px rgba(0, 102, 204, 0.08)" },
                "&.Mui-focused": {
                  boxShadow: "0 4px 20px rgba(0, 102, 204, 0.15)",
                },
              },
              "& .MuiOutlinedInput-input": { padding: "12px 12px", fontSize: "14px" },
            }}
          />
        </motion.div>

        <motion.div custom={2} variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <TextField
            label="Repetir contraseña"
            type={showPass ? "text" : "password"}
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            fullWidth
            required
            disabled={busy}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon
                    sx={{ color: "primary.main", fontSize: 20 }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": { boxShadow: "0 4px 12px rgba(0, 102, 204, 0.08)" },
                "&.Mui-focused": {
                  boxShadow: "0 4px 20px rgba(0, 102, 204, 0.15)",
                },
              },
              "& .MuiOutlinedInput-input": { padding: "12px 12px", fontSize: "14px" },
            }}
          />
        </motion.div>

        <motion.div custom={3} variants={itemVariants}>
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
              "&:hover": { boxShadow: "0 6px 25px rgba(0, 102, 204, 0.4)" },
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
                Creando cuenta...
              </motion.span>
            ) : (
              "Crear cuenta"
            )}
          </MotionButton>
        </motion.div>

        <motion.div custom={4} variants={itemVariants}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              ¿Ya tienes cuenta?{" "}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ display: "inline" }}
              >
                <Link
                  component="button"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setMode("login");
                  }}
                  sx={{
                    fontWeight: 600,
                    color: "#0066cc",
                    textDecoration: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": { color: "#0052a3", textDecoration: "underline" },
                  }}
                >
                  Inicia sesión aquí
                </Link>
              </motion.div>
            </Typography>
          </Box>
        </motion.div>
      </Stack>
    </MotionBox>
  );
}
