import { Box, Stack } from '@mui/material';
import GenerarPDF from '../../../components/GenerarPDF';
import GenerarPDFSimple from '../../../components/GenerarPDFSimple';
import ImprimirPDF from '../../../components/ImprimirPDF';
import { buildSimplePdf } from '../../../components/ImprimirPDFSimple';

const PdfSection = ({ data, editedData, isSimpleMode = false }) => (
  <Box mt={2}>
    <Stack direction="row" spacing={2} sx={{ display: 'flex', gap: 2 }}>
      {isSimpleMode ? (
        <>
          <ImprimirPDF data={data} editedData={editedData} buildPdf={buildSimplePdf} />
          <GenerarPDFSimple data={data} editedData={editedData} />
        </>
      ) : (
        <>
          <ImprimirPDF data={data} editedData={editedData} />
          <GenerarPDF data={data} editedData={editedData} />
        </>
      )}
    </Stack>
  </Box>
);

export default PdfSection;