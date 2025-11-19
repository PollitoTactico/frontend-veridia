import {
  Dialog,
  Box,
  IconButton,
  Typography,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { motion } from "framer-motion";
import { AuthForms } from "../apps/auth/auth";
import { getLogger } from "../services/logs";
const log = getLogger("auth.login_modal");

// Envolver componentes MUI con motion
const MotionBox = motion.create(Box);

// Componente de burbuja animada - Optimizado para rendimiento
const FloatingBubble = ({ delay, size, duration, x, y }) => (
  <motion.div
    animate={{
      y: [y, y - 80, y],
      x: [x, x + 30, x],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.08)",
      filter: "blur(0.5px)",
      willChange: "transform, opacity",
    }}
  />
);

export default function LoginModal({ open, onClose, disableClose = false }) {
  const handleClose = (_, reason) => {
    if (
      disableClose &&
      (reason === "backdropClick" || reason === "escapeKeyDown")
    ) {
      log.debug("close_blocked", { reason });
      return;
    }
    log.debug("close_allowed", { reason });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      disableEscapeKeyDown={disableClose}
      keepMounted
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.12)",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        },
        component: MotionBox,
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          },
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        {/* Header con gradiente */}
        <MotionBox
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          sx={{
            background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
            padding: "32px 24px 24px 24px",
            borderRadius: "12px 12px 0 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Contenedor de burbujas - Ocupa TODO el header */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {/* 10 burbujas aceleradas - ocupan todo el ancho */}
            <FloatingBubble delay={0} size="50px" duration={3.5} x={0} y={-40} />
            <FloatingBubble delay={0.2} size="40px" duration={3} x={40} y={20} />
            <FloatingBubble delay={0.4} size="65px" duration={4} x={80} y={10} />
            <FloatingBubble delay={0.6} size="35px" duration={3.2} x={130} y={-30} />
            <FloatingBubble delay={0.8} size="55px" duration={3.8} x={170} y={15} />
            <FloatingBubble delay={1} size="45px" duration={3.3} x={210} y={-20} />
            <FloatingBubble delay={1.2} size="60px" duration={3.6} x={250} y={25} />
            <FloatingBubble delay={1.4} size="38px" duration={3.1} x={290} y={-15} />
            <FloatingBubble delay={1.6} size="55px" duration={3.7} x={330} y={10} />
            <FloatingBubble delay={1.8} size="50px" duration={3.4} x={360} y={-35} />
          </Box>

          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: "relative", zIndex: 1 }}>
            <Stack spacing={0.5}>
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    fontSize: "24px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Bienvenido a Veridia Health
                </Typography>
              </motion.div>
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontWeight: 400,
                    fontSize: "13px",
                  }}
                >
                  Accede a tu cuenta
                </Typography>
              </motion.div>
            </Stack>
            {!disableClose && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconButton
                  aria-label="Cerrar"
                  onClick={onClose}
                  size="small"
                  sx={{
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </motion.div>
            )}
          </Stack>
        </MotionBox>

        {/* Content */}
        <MotionBox
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          sx={{ padding: "32px 24px" }}
        >
          <AuthForms onLoginSuccess={onClose} />
        </MotionBox>
      </Box>
    </Dialog>
  );
}
