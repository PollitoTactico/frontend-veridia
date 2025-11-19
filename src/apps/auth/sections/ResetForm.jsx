import { useState } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  InputAdornment,
  Link,
  Typography,
} from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { motion } from "framer-motion";
import { useAuth } from "../../../services/auth/firebase/AuthContext";
import { mapAuthError } from "../utils/errorMap";
import { getLogger } from "../../../services/logs";
const log = getLogger("auth.reset");

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

export default function ResetForm({ setMode, setMsg }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    setBusy(true);
    const emailDomain = (email.split("@")[1] || "").toLowerCase();
    log.info("submit_reset_request", { emailDomain });

    try {
      await resetPassword(email.trim());
      log.info("reset_email_sent", { emailDomain });
      setMsg({
        type: "success",
        text: "Te enviamos un correo para restablecer tu contraseña.",
      });
    } catch (e2) {
      log.warn("reset_failed", { code: e2?.code || "unknown" });
      setMsg({ type: "error", text: mapAuthError(e2.code, e2.message) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <MotionBox
      component="form"
      onSubmit={handleReset}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Stack spacing={3}>
        <motion.div custom={0} variants={itemVariants}>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "center",
              fontSize: "13px",
              lineHeight: 1.6,
            }}
          >
            Ingresa tu correo electrónico y te enviaremos un enlace para
            restablecer tu contraseña.
          </Typography>
        </motion.div>

        <motion.div custom={1} variants={itemVariants} whileHover={{ scale: 1.02 }}>
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
                Enviando...
              </motion.span>
            ) : (
              "Enviar correo de restablecimiento"
            )}
          </MotionButton>
        </motion.div>

        <motion.div custom={3} variants={itemVariants}>
          <Box sx={{ textAlign: "center" }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ display: "inline-block" }}
            >
              <Link
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setMode("login");
                }}
                sx={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#0066cc",
                  textDecoration: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#0052a3",
                    textDecoration: "underline",
                  },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                Volver al login
              </Link>
            </motion.div>
          </Box>
        </motion.div>
      </Stack>
    </MotionBox>
  );
}
