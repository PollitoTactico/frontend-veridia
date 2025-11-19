import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SpaIcon from '@mui/icons-material/Spa';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ScienceIcon from '@mui/icons-material/Science';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import OpacityIcon from '@mui/icons-material/Opacity';
import EmergencyIcon from '@mui/icons-material/Emergency';
import HealingIcon from '@mui/icons-material/Healing';
import PeopleIcon from '@mui/icons-material/People';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import KitchenIcon from '@mui/icons-material/Kitchen';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const recursos = [
  { texto: 'El cuerpo humano tiene más de 650 músculos.', Icon: FitnessCenterIcon },
  { texto: 'El corazón late unas 100 000 veces al día.', Icon: FavoriteIcon },
  { texto: 'La piel es el órgano más grande del cuerpo.', Icon: SpaIcon },
  { texto: 'El hígado realiza más de 500 funciones diferentes.', Icon: LocalHospitalIcon },
  { texto: 'Las neuronas se comunican a más de 400 km/h.', Icon: ScienceIcon },
  { texto: 'El esqueleto adulto tiene 206 huesos.', Icon: AccessibilityNewIcon },
  { texto: 'El torrente sanguíneo recorre 96 000 km diarios.', Icon: OpacityIcon },
  { texto: 'La córnea es el único tejido sin vasos sanguíneos.', Icon: EmergencyIcon },
  { texto: 'El estómago renueva su moco cada dos semanas.', Icon: HealingIcon },
  { texto: 'Hay más de 200 tipos de células en el cuerpo humano.', Icon: PeopleIcon },
  { texto: 'Los pulmones tienen más de 300 millones de alveolos.', Icon: LocalPharmacyIcon },
  { texto: 'El ojo distingue hasta 10 millones de colores.', Icon: ColorLensIcon },
  { texto: 'El sistema digestivo mide unos 9 metros de longitud.', Icon: KitchenIcon },
  { texto: 'Las células sanguíneas viajan a los órganos en segundos.', Icon: BloodtypeIcon },
  { texto: 'El cuerpo produce 25 millones de células nuevas/segundo.', Icon: AutorenewIcon },
];

const LoadingModal = ({ open }) => {
  const [recurso, setRecurso] = useState(recursos[0]);

  useEffect(() => {
    if (!open) return;
    setRecurso(recursos[Math.floor(Math.random() * recursos.length)]);
    const timer = setInterval(() => {
      setRecurso(recursos[Math.floor(Math.random() * recursos.length)]);
    }, 20000);
    return () => clearInterval(timer);
  }, [open]);

  const Icono = recurso.Icon;

  return (
    <Dialog
      open={open}
      PaperProps={{
        sx: {
          p: 4,
          borderRadius: 3,
          minWidth: 500,
          maxWidth: 600
        }
      }}
      disableEscapeKeyDown
      aria-labelledby="loading-modal-title"
    >
      <DialogTitle id="loading-modal-title">
        <Box display="flex" alignItems="center" justifyContent="center">
          <LocalHospitalIcon color="primary" sx={{ fontSize: 36, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            Mientras esperas...
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <Icono sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
          <Typography variant="h6">
            {recurso.texto}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingModal;
