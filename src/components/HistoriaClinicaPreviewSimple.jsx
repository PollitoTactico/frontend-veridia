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
import HistoryIcon from '@mui/icons-material/History';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { getLogger } from '../services/logs';

const log = getLogger('preview.historia.simple');

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

// Configuración solo para secciones del análisis simple
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
    label: 'Descripción de Síntomas',
    description: 'Síntomas y hechos actuales',
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
  IMC: {
    icon: FitnessCenterIcon,
    color: '#ff9800',
    label: 'Índice de Masa Corporal (IMC)',
    description: 'Cálculo automático del IMC',
  },
};

const HistoriaClinicaPreviewSimple = ({ data, onSave, onEditedDataChange }) => {
  const [showReport, setShowReport] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    if (data) {
      setEditedData(data);
      setEditMode(false);
      try { log.debug('data_loaded_simple', { keys: Object.keys(data).length }); } catch {}
    }
  }, [data]);

  useEffect(() => {
    if (editedData && Object.keys(editedData).length > 0 && onEditedDataChange) {
      onEditedDataChange(editedData);
    }
  }, [editedData, onEditedDataChange]);

  if (!data) return null;

  const handlePrimitiveChange = (key, value) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedChange = (parentKey, childKey, value) => {
    setEditedData(prev => ({
      ...prev,
      [parentKey]: { ...prev[parentKey], [childKey]: value }
    }));
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
    try { log.info('save_all_simple', { keys: Object.keys(editedData || {}).length }); } catch {}
  };

  const handleCancel = () => {
    setEditedData(data);
    setEditMode(false);
    log.debug('edit_cancel_all_simple');
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
    <Box>
      {/* Header with Edit Controls */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            p: 2.5,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #0066cc10 0%, #00a89610 100%)',
            border: '2px solid rgba(0, 102, 204, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ArticleIcon sx={{ fontSize: 32, color: '#0066cc' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0066cc' }}>
                Análisis Simple - Sin Recomendaciones
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Vista de datos básicos y hechos extraídos del audio
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            {!editMode ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => {
                    setEditMode(true);
                    setExpandedSection(null);
                    log.info('edit_mode_enter_simple');
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
                    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.25)',
                  }}
                >
                  Editar
                </Button>
              </motion.div>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                    }}
                  >
                    Cancelar
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveAll}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.25)',
                    }}
                  >
                    Guardar Todo
                  </Button>
                </motion.div>
              </>
            )}
          </Stack>
        </Box>
      </motion.div>

      {/* Sections */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Stack spacing={2.5}>
          {Object.entries(sectionConfig).map(([key, config]) => {
            const sectionData = editedData[key];
            if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0)) {
              return null;
            }
            return renderSection(key, sectionData, config);
          })}
        </Stack>
      </motion.div>
    </Box>
  );
};

export default HistoriaClinicaPreviewSimple;
