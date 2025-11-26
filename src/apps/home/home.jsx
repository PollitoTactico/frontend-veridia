import { useState } from "react";
import {
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Paper,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DescriptionIcon from "@mui/icons-material/Description";
import SecurityIcon from "@mui/icons-material/Security";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SettingsIcon from "@mui/icons-material/Settings";
import ArticleIcon from "@mui/icons-material/Article";
import AudioSection from "./sections/AudioSection";
import CloseIcon from "@mui/icons-material/Close";
import PreviewSection from "./sections/PreviewSection";
import PdfSection from "./sections/PdfSection";
import { useAuth } from "../../services/auth/firebase/AuthContext";
import { getLogger } from "../../services/logs";
import { motion } from "framer-motion";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HistoriaClinicaPreviewSimple from "../../components/HistoriaClinicaPreviewSimple";

const MotionPaper = motion.create(Paper);

function ConfirmLogoutDialog({ open, onCancel, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        },
        component: motion.create(Paper),
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
        transition: { duration: 0.3, ease: "easeOut" },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
          color: "white",
          fontWeight: 700,
          pb: 2,
          borderRadius: "12px 12px 0 0",
        }}
      >
        ¿Cerrar sesión?
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 3, pb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Esta acción cerrará tu sesión actual.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 0, gap: 1 }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outlined"
            startIcon={<CloseIcon />}
            onClick={onCancel}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Cancelar
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={onConfirm}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Cerrar sesión
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
}

function HeaderBar() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const log = getLogger("home.header");

  const menuOpen = Boolean(anchorEl);
  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    log.debug("menu_open");
  };
  const handleClose = () => setAnchorEl(null);

  const handleAskLogout = () => {
    handleClose();
    setConfirmOpen(true);
    log.info("logout_confirm_open");
  };
  const handleConfirmLogout = () => {
    setConfirmOpen(false);
    log.info("logout_confirmed");
    logout();
  };

  const initial = (
    user?.displayName?.[0] ||
    user?.email?.[0] ||
    "?"
  ).toUpperCase();

  return (
    <>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AppBar
          position="static"
          sx={{
            background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
            boxShadow: "0 4px 20px rgba(0, 102, 204, 0.15)",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <Toolbar sx={{ py: 2 }}>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Typography
                variant="h5"
                sx={{
                  flexGrow: 1,
                  fontWeight: 800,
                  fontSize: "28px",
                  background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}
              >
                Veridia Health
              </Typography>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Tooltip title={user?.email || "Usuario"}>
                <IconButton
                  onClick={handleOpen}
                  size="medium"
                  sx={{
                    ml: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.25)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                      fontWeight: 700,
                      fontSize: "18px",
                    }}
                  >
                    {initial}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </motion.div>

            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  mt: 1,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <MenuItem disabled sx={{ fontWeight: 500 }}>
                {user?.email || "Usuario"}
              </MenuItem>
              <MenuItem
                onClick={handleAskLogout}
                sx={{
                  color: "error.main",
                  fontWeight: 500,
                }}
              >
                <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
                Cerrar sesión
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
      </motion.div>

      <ConfirmLogoutDialog
        open={confirmOpen}
        onCancel={() => {
          setConfirmOpen(false);
          log.debug("logout_confirm_cancelled");
        }}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}

function SectionCard({ icon: Icon, title, children, delay }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
    >
      <MotionPaper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          border: "1px solid rgba(0, 102, 204, 0.1)",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 12px 40px rgba(0, 102, 204, 0.12)",
            borderColor: "rgba(0, 102, 204, 0.2)",
          },
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon sx={{ fontSize: 24 }} />
              </Box>
            </motion.div>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#0066cc",
                letterSpacing: "-0.3px",
              }}
            >
              {title}
            </Typography>
          </Box>
          {children}
        </Stack>
      </MotionPaper>
    </motion.div>
  );
}

export default function Home() {
  const [ficha, setFicha] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [analysisMode, setAnalysisMode] = useState("complete"); // "complete" or "simple"
  const log = getLogger("home");

  const handleData = (data) => {
    setFicha(data);
    setEditedData(null); // Reset edited data when new data arrives
    try {
      const keys =
        data && typeof data === "object" ? Object.keys(data).length : 0;
      log.info("ficha_received", { keys, mode: analysisMode });
    } catch {
      log.info("ficha_received", { mode: analysisMode });
    }
  };

  const handleEditedDataChange = (newEditedData) => {
    setEditedData(newEditedData);
  };

  return (
    <>
      <HeaderBar />

      <Box
        sx={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)",
          minHeight: "calc(100vh - 80px)",
          pt: 6,
          pb: 8,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Global Decorative Background Elements */}
        <Box
          sx={{
            position: "fixed",
            top: "50px",
            right: "-150px",
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(0, 102, 204, 0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "fixed",
            bottom: "-100px",
            left: "-200px",
            width: 450,
            height: 450,
            background: "radial-gradient(circle, rgba(0, 166, 150, 0.1) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          {/* Hero Section */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Box sx={{ mb: 12, position: "relative" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4, alignItems: "center" }}>
                {/* Text Content */}
                <Box>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box sx={{ mb: 1 }}>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, rgba(0, 102, 204, 0.15) 0%, rgba(0, 82, 163, 0.1) 100%)",
                            border: "1px solid rgba(0, 102, 204, 0.3)",
                            mb: 2,
                          }}
                        >
                          <ElectricBoltIcon sx={{ fontSize: 16, color: "#0066cc" }} />
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "#0066cc" }}>
                            La solución médica del futuro
                          </Typography>
                        </Box>
                      </Box>                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 2,
                        letterSpacing: "-1.5px",
                        fontSize: { xs: "32px", md: "48px" },
                        lineHeight: 1.1,
                      }}
                    >
                      Historia Clínica Digital
                    </Typography>
                  </motion.div>

                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontSize: "16px",
                      lineHeight: 1.8,
                      mb: 3,
                    }}
                  >
                    Revoluciona tu práctica médica con tecnología IA. Graba notas de audio, obtén resúmenes automáticos y genera reportes profesionales en segundos.
                  </Typography>

                  {/* Features List */}
                  <Stack spacing={1.5} sx={{ mb: 4 }}>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <MicIcon sx={{ fontSize: 20, color: "#0066cc", flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Grabación inteligente de audio
                        </Typography>
                      </Box>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <SmartToyIcon sx={{ fontSize: 20, color: "#00a896", flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Procesamiento con IA avanzada
                        </Typography>
                      </Box>
                    </motion.div>
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <DescriptionIcon sx={{ fontSize: 20, color: "#0066cc", flexShrink: 0 }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Descarga instantánea en PDF
                        </Typography>
                      </Box>
                    </motion.div>
                  </Stack>

                  {/* CTA Button */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<SendIcon />}
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                        boxShadow: "0 8px 24px rgba(0, 102, 204, 0.3)",
                        "&:hover": {
                          boxShadow: "0 12px 32px rgba(0, 102, 204, 0.4)",
                        },
                      }}
                    >
                      Comenzar ahora
                    </Button>
                  </motion.div>
                </Box>

                {/* Vector Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "auto",
                      maxWidth: 400,
                    }}
                  >
                    <Box
                      component="img"
                      src="/images/vector.png"
                      alt="Historia Clínica Digital"
                      sx={{
                        width: "100%",
                        height: "auto",
                        filter: "drop-shadow(0 10px 30px rgba(0, 102, 204, 0.15))",
                      }}
                    />
                  </Box>
                </motion.div>
              </Box>
            </Box>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr" }, gap: 3, mb: 12, py: 4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0066cc", mb: 1 }}>
                  99.9%
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  Precisión en procesos
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#00a896", mb: 1 }}>
                  &lt;2s
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  Generación de reportes
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#0066cc", mb: 1 }}>
                  +500
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  Profesionales activos
                </Typography>
              </Box>
            </Box>
          </motion.div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box sx={{ mb: 12, position: "relative" }}>
              <Box sx={{ textAlign: "center", mb: 8 }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, px: 2, py: 1, borderRadius: 2, background: "linear-gradient(135deg, rgba(0, 168, 150, 0.15) 0%, rgba(0, 102, 204, 0.1) 100%)", border: "1px solid rgba(0, 168, 150, 0.3)", mb: 2 }}>
                  <SettingsIcon sx={{ fontSize: 16, color: "#00a896" }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "#00a896" }}>
                    Proceso simplificado
                  </Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, background: "linear-gradient(135deg, #00a896 0%, #0066cc 100%)", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  ¿Cómo Funciona?
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}>
                  Un proceso intuitivo de tres pasos diseñado para profesionales de la salud
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 6, alignItems: "center" }}>
                {/* Steps */}
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <Stack spacing={4}>
                    {[
                      { num: "01", title: "Graba tu nota", desc: "Presiona grabar y habla como normalmente lo harías en una consulta" },
                      { num: "02", title: "IA Procesa", desc: "Nuestro sistema analiza y estructura tu audio automáticamente" },
                      { num: "03", title: "Descarga PDF", desc: "Obtén un documento profesional listo para enviar o guardar" },
                    ].map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Box sx={{ display: "flex", gap: 2.5 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 2,
                              background: idx % 2 === 0 ? "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)" : "linear-gradient(135deg, #00a896 0%, #007d6a 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              color: "white",
                              fontSize: "20px",
                              flexShrink: 0,
                            }}
                          >
                            {step.num}
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {step.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              {step.desc}
                            </Typography>
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </Stack>
                </motion.div>

                {/* Vector Image 2 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                  style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  <Box sx={{ position: "relative", width: "100%", height: "auto", maxWidth: 350 }}>
                    <Box
                      component="img"
                      src="/images/vector2.png"
                      alt="Cómo Funciona"
                      sx={{
                        width: "100%",
                        height: "auto",
                        filter: "drop-shadow(0 10px 30px rgba(0, 168, 150, 0.15))",
                      }}
                    />
                  </Box>
                </motion.div>
              </Box>
            </Box>
          </motion.div>

          {/* Features Grid Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box sx={{ mb: 12 }}>
              <Box sx={{ textAlign: "center", mb: 6 }}>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                  Características Principales
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}>
                  Todo lo que necesitas para revolucionar tu práctica médica
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
                {[
                  { icon: MicIcon, title: "Audio Inteligente", desc: "Grabación de alta calidad con procesamiento automático" },
                  { icon: SmartToyIcon, title: "IA Avanzada", desc: "Modelos de lenguaje última generación para análisis" },
                  { icon: DescriptionIcon, title: "Reportes PDF", desc: "Documentos profesionales generados al instante" },
                  { icon: SecurityIcon, title: "Datos Seguros", desc: "Encriptación de extremo a extremo para privacidad" },
                  { icon: ElectricBoltIcon, title: "Historial Completo", desc: "Almacenamiento seguro de todas tus consultas" },
                  { icon: AnalyticsIcon, title: "Análisis Detallado", desc: "Métricas y estadísticas de tus sesiones" },
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        border: "1px solid rgba(0, 102, 204, 0.2)",
                        background: "linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(0, 168, 150, 0.05) 100%)",
                        textAlign: "center",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          borderColor: "rgba(0, 102, 204, 0.4)",
                          background: "linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 168, 150, 0.1) 100%)",
                          boxShadow: "0 8px 24px rgba(0, 102, 204, 0.15)",
                        },
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                        <feature.icon sx={{ fontSize: 36, color: "#0066cc" }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {feature.desc}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>

          {/* Main Sections */}
          <Stack spacing={4}>
            {/* Mode Selection */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SectionCard
                icon={SettingsIcon}
                title="Modo de Análisis"
                delay={0.1}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
                    Selecciona el tipo de análisis que deseas realizar:
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ flex: 1 }}
                    >
                      <Button
                        fullWidth
                        variant={analysisMode === "complete" ? "contained" : "outlined"}
                        onClick={() => {
                          setAnalysisMode("complete");
                          setFicha(null);
                          setEditedData(null);
                          log.info("mode_changed", { mode: "complete" });
                        }}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          py: 1.5,
                          background: analysisMode === "complete"
                            ? "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)"
                            : "transparent",
                          borderColor: "#0066cc",
                          color: analysisMode === "complete" ? "white" : "#0066cc",
                          "&:hover": {
                            background: analysisMode === "complete"
                              ? "linear-gradient(135deg, #0052a3 0%, #003d7a 100%)"
                              : "rgba(0, 102, 204, 0.05)",
                            borderColor: "#0066cc",
                          },
                        }}
                      >
                        <Stack alignItems="center" spacing={0.5}>
                          <SmartToyIcon sx={{ fontSize: 24 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Con Recomendaciones
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: "11px", opacity: 0.8 }}>
                            Incluye diagnósticos y tratamiento
                          </Typography>
                        </Stack>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{ flex: 1 }}
                    >
                      <Button
                        fullWidth
                        variant={analysisMode === "simple" ? "contained" : "outlined"}
                        onClick={() => {
                          setAnalysisMode("simple");
                          setFicha(null);
                          setEditedData(null);
                          log.info("mode_changed", { mode: "simple" });
                        }}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          py: 1.5,
                          background: analysisMode === "simple"
                            ? "linear-gradient(135deg, #00a896 0%, #007d6a 100%)"
                            : "transparent",
                          borderColor: "#00a896",
                          color: analysisMode === "simple" ? "white" : "#00a896",
                          "&:hover": {
                            background: analysisMode === "simple"
                              ? "linear-gradient(135deg, #007d6a 0%, #005d52 100%)"
                              : "rgba(0, 168, 150, 0.05)",
                            borderColor: "#00a896",
                          },
                        }}
                      >
                        <Stack alignItems="center" spacing={0.5}>
                          <ArticleIcon sx={{ fontSize: 24 }} />
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Sin Recomendaciones
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: "11px", opacity: 0.8 }}>
                            Solo hechos y datos
                          </Typography>
                        </Stack>
                      </Button>
                    </motion.div>
                  </Stack>
                </Box>
              </SectionCard>
            </motion.div>

            {/* Audio Section */}
            <SectionCard
              icon={GraphicEqIcon}
              title="Grabación de Audio"
              delay={0.2}
            >
              <AudioSection onData={handleData} analysisMode={analysisMode} />
            </SectionCard>

            {/* Preview Section */}
            {ficha && (
              <SectionCard
                icon={VisibilityIcon}
                title="Vista Previa"
                delay={0.3}
              >
                {analysisMode === "complete" ? (
                  <PreviewSection data={ficha} onEditedDataChange={handleEditedDataChange} />
                ) : (
                  <HistoriaClinicaPreviewSimple data={ficha} onEditedDataChange={handleEditedDataChange} />
                )}
              </SectionCard>
            )}

            {/* PDF Section */}
            {ficha && (
              <SectionCard icon={DescriptionIcon} title="Descargar PDF" delay={0.4}>
                <PdfSection data={ficha} editedData={editedData || ficha} isSimpleMode={analysisMode === "simple"} />
              </SectionCard>
            )}
          </Stack>
        </Container>
      </Box>
    </>
  );
}
