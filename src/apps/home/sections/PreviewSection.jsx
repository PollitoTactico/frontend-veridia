import HistoriaClinicaPreview from '../../../components/HistoriaClinicaPreview';

const PreviewSection = ({ data, onEditedDataChange }) => {
  return (
    <HistoriaClinicaPreview 
      data={data} 
      onEditedDataChange={onEditedDataChange}
    />
  );
};

export default PreviewSection;
