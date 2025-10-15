import { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Container,
  Box,
} from '@mui/material';
import { CloudDownload, PlayArrow, Stop } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { Collector, type SensorData } from './collector';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function () {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureTime, setCaptureTime] = useState(0);
  const [hasResult, setHasResult] = useState(false);
  const [timer, setTimer] = useState(0);

  const collector = new Collector();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);

  useEffect(() => {
    collector.init();

    return () => {
      if (collector) {
        collector.stop();
        setSensorData(collector.data());
      }
    }
  }, []);

  useEffect(() => {
    if (isCapturing) {
      const interval = setInterval(() => {
        setCaptureTime(prev => prev + 1);
      }, 1000);
      setTimer(interval);

      collector.start();
    } else {
      clearInterval(timer);

      collector.stop();
      setSensorData(collector.data());
    }

    return () => clearInterval(timer);
  }, [isCapturing]);

  const handleCaptureToggle = () => {
    if (isCapturing) {
      setIsCapturing(false);
      setHasResult(true);
    } else {
      setIsCapturing(true);
      setCaptureTime(0);
      setHasResult(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(sensorData)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'capture-result.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="sm"
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
          textAlign: 'center'
        }}
      >
        {/* 标题 */}
        <Typography variant="h4" component="h1" gutterBottom>
          数据捕获应用
        </Typography>

        {/* 状态卡片 - 完全居中 */}
        <Card sx={{
          width: '100%',
          maxWidth: 400,
          margin: '16px 0',
          textAlign: 'center',
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              当前状态
            </Typography>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 2
            }}>
              {isCapturing ? (
                <>
                  <CircularProgress color="primary" size={24} sx={{ mr: 1 }} />
                  <Typography variant="body1" color="primary">
                    捕获中...
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color={hasResult ? 'text.secondary' : 'text.primary'}>
                  {hasResult ? '捕获已完成' : '准备就绪'}
                </Typography>
              )}
            </Box>

            {isCapturing && (
              <Typography variant="h5">
                {formatTime(captureTime)}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* 主按钮 - 完全居中 */}
        <Box sx={{
          width: '100%',
          maxWidth: 400,
          margin: '16px 0',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Button
            variant="contained"
            color={isCapturing ? 'secondary' : 'primary'}
            size="large"
            startIcon={isCapturing ? <Stop /> : <PlayArrow />}
            onClick={handleCaptureToggle}
            sx={{
              height: 80,
              width: '100%',
              fontSize: '1.5rem',
              borderRadius: 10,
              boxShadow: 3,
            }}
          >
            {isCapturing ? '停止捕获' : '开始捕获'}
          </Button>
        </Box>

        {/* 结果卡片 - 完全居中 */}
        {hasResult && (
          <Card sx={{
            width: '100%',
            maxWidth: 400,
            margin: '16px 0',
            textAlign: 'center'
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                捕获结果
              </Typography>
              <Typography variant="body1" gutterBottom>
                捕获持续时间: {formatTime(captureTime)}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudDownload />}
                  onClick={handleDownload}
                  sx={{ mt: 2 }}
                >
                  下载结果
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </ThemeProvider>
  );
};