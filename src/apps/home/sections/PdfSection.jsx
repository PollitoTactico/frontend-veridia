import { Box, Stack } from '@mui/material';
import GenerarPDF from '../../../components/GenerarPDF';
import ImprimirPDF from '../../../components/ImprimirPDF';

const PdfSection = ({ data, editedData }) => (
  <Box mt={2}>
    <Stack direction="row" spacing={2} sx={{ display: 'flex', gap: 2 }}>
      <ImprimirPDF data={data} editedData={editedData} />
      <GenerarPDF data={data} editedData={editedData} />
    </Stack>
  </Box>
);

export default PdfSection;