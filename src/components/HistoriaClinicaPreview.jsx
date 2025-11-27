import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Typography,
  Box,
  Button,
  Stack,
  TextField,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BiotechIcon from '@mui/icons-material/Biotech';
import HistoryIcon from '@mui/icons-material/History';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArticleIcon from '@mui/icons-material/Article';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getLogger } from '../services/logs';
import { recalcularIMC } from '../services/api/transcriptionApi';

const log = getLogger('preview.historia');

const formatTitle = (str) =>
  str
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.08, duration: 0.4 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const sectionConfig = {
  datos_personales: {
    icon: PersonIcon,
    color: '#0066cc',
    label: 'Datos Personales',
    description: 'Información demográfica del paciente',
  },
  motivo_consulta: {
    icon: AssignmentIcon,
    color: '#00a896',
    label: 'Motivo de Consulta',
    description: 'Razón de la visita médica',
  },
  enfermedad_actual: {
    icon: LocalHospitalIcon,
    color: '#ff6b6b',
    label: 'Enfermedad Actual',
    description: 'Diagnóstico y síntomas actuales',
  },
  posibles_enfermedades: {
    icon: BiotechIcon,
    color: '#ffa94d',
    label: 'Posibles Diagnósticos',
    description: 'Diagnósticos diferenciales',
  },
  antecedentes: {
    icon: HistoryIcon,
    color: '#9c27b0',
    label: 'Antecedentes',
    description: 'Historial médico del paciente',
  },
  signos_vitales: {
    icon: MonitorHeartIcon,
    color: '#f44336',
    label: 'Signos Vitales',
    description: 'Parámetros vitales medidos',
  },
  examen_físico: {
    icon: MedicalServicesIcon,
    color: '#2196f3',
    label: 'Examen Físico',
    description: 'Hallazgos del examen clínico',
  },
  diagnostico_tratamiento: {
    icon: AssignmentTurnedInIcon,
    color: '#4caf50',
    label: 'Diagnóstico y Tratamiento',
    description: 'Diagnóstico presuntivo y plan terapéutico',
  },
};

const HistoriaClinicaPreview = ({ data, onSave, onEditedDataChange }) => {
  const [showReport, setShowReport] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    if (data) {
      setEditedData(data);
      setEditMode(false);
      try { log.debug('data_loaded', { keys: Object.keys(data).length }); } catch {}
    }
  }, [data]);

  // Notificar cambios de editedData al componente padre
  useEffect(() => {
    if (editedData && Object.keys(editedData).length > 0 && onEditedDataChange) {
      onEditedDataChange(editedData);
    }
  }, [editedData, onEditedDataChange]);

  if (!data) return null;

  const handlePrimitiveChange = (key, value) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = async (parentKey, childKey, value) => {
    const newData = {
      ...editedData,
      [parentKey]: { ...editedData[parentKey], [childKey]: value }
    };
    
    // Recalcular IMC automáticamente si se edita peso o altura
    if (parentKey === 'examen_físico' && (childKey === 'peso_kg' || childKey === 'altura_cm')) {
      try {
        log.info('recalculating_imc', { peso: newData.examen_físico?.peso_kg, altura: newData.examen_físico?.altura_cm });
        const updatedData = await recalcularIMC(newData);
        setEditedData(updatedData);
        log.info('imc_recalculated', { valor: updatedData.IMC?.valor, clasificacion: updatedData.IMC?.clasificacion });
      } catch (error) {
        log.warn('imc_recalculation_failed', { error: error.message });
        setEditedData(newData);
      }
    } else {
      setEditedData(newData);
    }
  };

  const handleArrayChange = (parentKey, index, childKey, value) => {
    setEditedData(prev => {
      const newArray = [...prev[parentKey]];
      newArray[index] = { ...newArray[index], [childKey]: value };
      return { ...prev, [parentKey]: newArray };
    });
  };

  const handleSaveAll = () => {
    setEditMode(false);
    onSave?.(editedData);
    try { log.info('save_all', { keys: Object.keys(editedData || {}).length }); } catch {}
  };

  const handleCancel = () => {
    setEditedData(data);
    setEditMode(false);
    log.debug('edit_cancel_all');
  };

  const renderField = (value, key, parentKey, index) => {
    if (!editMode) {
      return (
        <Typography
          variant="body2"
          sx={{
            p: 1.5,
            borderRadius: 1,
            background: 'rgba(0, 102, 204, 0.05)',
            border: '1px solid rgba(0, 102, 204, 0.1)',
            minHeight: 40,
            display: 'flex',
            alignItems: 'center',
            wordBreak: 'break-word',
            color: 'text.primary',
          }}
        >
          {value || '—'}
        </Typography>
      );
    }

    return (
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        multiline
        minRows={2}
        maxRows={3}
        value={value || ''}
        onChange={e => {
          if (parentKey && index !== undefined) {
            handleArrayChange(parentKey, index, key, e.target.value);
          } else if (parentKey) {
            handleNestedChange(parentKey, key, e.target.value);
          } else {
            handlePrimitiveChange(key, e.target.value);
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1.5,
            fontSize: '0.9rem',
            '&.Mui-focused fieldset': {
              borderColor: '#0066cc',
              borderWidth: 2,
            },
          },
        }}
      />
    );
  };

  const renderSection = (sectionKey, sectionData, config) => {
    const isExpanded = expandedSection === sectionKey;

    return (
      <motion.div
        key={sectionKey}
        variants={itemVariants}
        layout
      >
        <Card
          sx={{
            border: `2px solid ${config.color}`,
            borderRadius: 2.5,
            overflow: 'hidden',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: `0 8px 24px ${config.color}22`,
              transform: 'translateY(-2px)',
            },
          }}
        >
          {/* Section Header */}
          <Box
            onClick={() => !editMode && setExpandedSection(isExpanded ? null : sectionKey)}
            sx={{
              background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}08 100%)`,
              p: 2,
              cursor: !editMode ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
              '&:hover': {
                background: !editMode ? `linear-gradient(135deg, ${config.color}20 0%, ${config.color}12 100%)` : 'auto',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  background: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <config.icon sx={{ color: 'white', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: config.color }}>
                  {config.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {config.description}
                </Typography>
              </Box>
            </Box>
            {!editMode && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ExpandMoreIcon sx={{ color: config.color }} />
              </motion.div>
            )}
          </Box>

          {/* Section Content */}
          <AnimatePresence initial={false}>
            {(editMode || isExpanded) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Divider sx={{ opacity: 0.5 }} />
                <CardContent sx={{ p: 3 }}>
                  {Array.isArray(sectionData) ? (
                    <Stack spacing={2.5}>
                      {sectionData.length > 0 ? (
                        sectionData.map((item, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Box
                              sx={{
                                p: 2.5,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${config.color}08 0%, ${config.color}04 100%)`,
                                border: `1px solid ${config.color}30`,
                                transition: 'all 0.3s',
                                '&:hover': {
                                  background: `linear-gradient(135deg, ${config.color}12 0%, ${config.color}08 100%)`,
                                  borderColor: `${config.color}50`,
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Chip
                                  label={`#${idx + 1}`}
                                  size="small"
                                  sx={{
                                    background: config.color,
                                    color: 'white',
                                    fontWeight: 700,
                                  }}
                                />
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: 700,
                                    color: config.color,
                                  }}
                                >
                                  {config.label}
                                </Typography>
                              </Box>

                              <Stack spacing={1.5}>
                                {typeof item === 'object' && item !== null ? (
                                  Object.entries(item).map(([fieldKey, fieldValue]) => (
                                    <Box key={fieldKey}>
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontWeight: 700,
                                          color: config.color,
                                          mb: 0.5,
                                          display: 'block',
                                          textTransform: 'uppercase',
                                          fontSize: '0.75rem',
                                          letterSpacing: 0.5,
                                        }}
                                      >
                                        {formatTitle(fieldKey)}
                                      </Typography>
                                      {renderField(fieldValue, fieldKey, sectionKey, idx)}
                                    </Box>
                                  ))
                                ) : (
                                  <Typography variant="body2">{String(item)}</Typography>
                                )}
                              </Stack>
                            </Box>
                          </motion.div>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary', fontStyle: 'italic', textAlign: 'center', py: 2 }}
                        >
                          Sin registros
                        </Typography>
                      )}
                    </Stack>
                  ) : typeof sectionData === 'object' && sectionData !== null ? (
                    <Grid container spacing={2}>
                      {Object.entries(sectionData).map(([fieldKey, fieldValue]) => (
                        <Grid item xs={12} sm={6} key={fieldKey}>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                color: config.color,
                                mb: 1,
                                display: 'block',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                letterSpacing: 0.5,
                              }}
                            >
                              {formatTitle(fieldKey)}
                            </Typography>
                            {renderField(fieldValue, fieldKey, sectionKey)}
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: config.color,
                          mb: 1,
                          display: 'block',
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: 0.5,
                        }}
                      >
                        {config.label}
                      </Typography>
                      {renderField(sectionData, sectionKey)}
                    </Box>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Action Buttons */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="contained"
              startIcon={showReport ? <VisibilityOffIcon /> : <ArticleIcon />}
              onClick={() => {
                setShowReport(prev => {
                  const next = !prev;
                  log.info('toggle_report', { show: next });
                  return next;
                });
              }}
              sx={{
                background: showReport
                  ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                  : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                color: 'white',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                  background: showReport
                    ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                    : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                },
              }}
            >
              {showReport ? 'Ocultar Reporte' : 'Ver Reporte Completo'}
            </Button>
          </motion.div>

          <AnimatePresence>
            {showReport && !editMode && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -10, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditMode(true);
                    log.debug('edit_mode_on');
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    borderColor: '#0066cc',
                    color: '#0066cc',
                    px: 3,
                    '&:hover': {
                      background: 'rgba(0, 102, 204, 0.05)',
                      borderColor: '#0052a3',
                    },
                  }}
                >
                  Editar Todo
                </Button>
              </motion.div>
            )}
            {showReport && editMode && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              >
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAll}
                  sx={{
                    background: 'linear-gradient(135deg, #00a896 0%, #007d6a 100%)',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 3,
                  }}
                >
                  Guardar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 3,
                    borderColor: '#e0e0e0',
                    color: '#666',
                    '&:hover': {
                      background: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  Cancelar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Stack>
      </Box>

      {/* Report Content */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Stack spacing={2.5}>
              <Stack spacing={2}>
                {Object.entries(sectionConfig).map(([sectionKey, config]) => {
                  const sectionData = editedData[sectionKey];
                  if (!sectionData) return null;
                  return renderSection(sectionKey, sectionData, config);
                })}

                {/* IMC Section - Special handling */}
                {editedData.IMC && (
                  <motion.div variants={itemVariants} layout>
                    <Card
                      sx={{
                        border: '2px solid #ff9800',
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          boxShadow: '0 8px 24px #ff980022',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, #ff980015 0%, #ff980008 100%)',
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              background: '#ff9800',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <MedicalServicesIcon sx={{ color: 'white', fontSize: 22 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ff9800' }}>
                              Índice de Masa Corporal (IMC)
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Evaluación del estado nutricional
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Divider sx={{ opacity: 0.5 }} />
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: '#ff9800',
                                  mb: 1,
                                  display: 'block',
                                  textTransform: 'uppercase',
                                  fontSize: '0.75rem',
                                  letterSpacing: 0.5,
                                }}
                              >
                                Valor (kg/m²)
                              </Typography>
                              <Typography variant="h5" sx={{ fontWeight: 800, color: '#ff9800' }}>
                                {editedData.IMC.valor}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 700,
                                  color: '#ff9800',
                                  mb: 1,
                                  display: 'block',
                                  textTransform: 'uppercase',
                                  fontSize: '0.75rem',
                                  letterSpacing: 0.5,
                                }}
                              >
                                Clasificación
                              </Typography>
                              <Chip
                                label={editedData.IMC.clasificacion}
                                sx={{
                                  background: '#ff9800',
                                  color: 'white',
                                  fontWeight: 700,
                                }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </Stack>
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoriaClinicaPreview;
