import AudioUploader from '../../../components/AudioUploader';
import AudioRecorder from '../../../components/AudioRecorder';
import { Box, Typography, Divider, Stack } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const AudioSection = ({ onData }) => (
  <Stack spacing={3}>
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <AudioRecorder onData={onData} />
    </MotionBox>
    
    <Divider sx={{ my: 1 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>o</Typography>
    </Divider>
    
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <AudioUploader onData={onData} />
    </MotionBox>
  </Stack>
);

export default AudioSection;
