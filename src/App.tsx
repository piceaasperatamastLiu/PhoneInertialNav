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

import { Collector, type SensorData, type InitStatus } from './collector';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: { fontFamily: 'Roboto, sans-serif' },
});

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function SensorCapturePage() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureTime, setCaptureTime] = useState(0);
  const [hasResult, setHasResult] = useState(false);
  const [isSensorInitialized, setSensorInitialized] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [initStatus, setInitStatus] = useState<InitStatus | null>(null);
  const [collector, setCollector] = useState<Collector | null>(null);

  // 初始化传感器（仅在点击"开始捕获"时调用）
  const initializeSensor = async () => {
    try {
      const newCollector = new Collector();
      const status = await newCollector.init();

      setInitStatus(status);
      setSensorInitialized(status === 'success');
      setCollector(newCollector);

      return status === 'success';
    } catch (err) {
      console.error('初始化异常:', err);
      setInitStatus('error');
      return false;
    }
  };

  // 清理传感器实例
  const cleanupSensor = () => {
    if (collector) {
      collector.stop();
      setSensorData(collector.data());
      setCollector(null); // 清除当前实例
    }
    setSensorInitialized(false);
  };

  useEffect(() => {
    return () => {
      // 组件卸载时清理
      cleanupSensor();
    };
  }, []);

  useEffect(() => {
    if (!isCapturing || !isSensorInitialized || !collector) return;

    const interval = setInterval(() => {
      setCaptureTime((prev) => prev + 1);
    }, 1000);

    // 启动传感器
    try {
      collector.start();
    } catch (error) {
      alert('启动传感器失败：' + error);
      setIsCapturing(false);
    }

    return () => {
      clearInterval(interval);
      cleanupSensor();
    };
  }, [isCapturing, isSensorInitialized, collector]);

  const handleCaptureToggle = async () => {
    if (isCapturing) {
      // 停止捕获
      setIsCapturing(false);
      setHasResult(true);
      cleanupSensor();
    } else {
      // 开始捕获
      setIsCapturing(true);
      setCaptureTime(0);
      setHasResult(false);

      const success = await initializeSensor();
      if (!success) {
        setIsCapturing(false);
        alert('传感器初始化失败，请检查浏览器支持或权限');
      }
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(sensorData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          textAlign: 'center',
        }}
      >
        {/* 标题和UI部分保持不变 */}
        <Typography variant="h4" component="h1" gutterBottom>
          传感器数据捕获
        </Typography>

        <Card sx={{ width: '100%', maxWidth: 400, margin: '16px 0' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              状态
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              {initStatus === 'not-supported' && (
                <Typography color="error">❌ 您的浏览器不支持传感器</Typography>
              )}
              {initStatus === 'error' && (
                <Typography color="error">❌ 传感器初始化失败</Typography>
              )}
              {isCapturing ? (
                <>
                  <CircularProgress color="primary" size={24} sx={{ mr: 1 }} />
                  <Typography color="primary">🔴 捕获中...</Typography>
                </>
              ) : (
                <Typography color={hasResult ? 'text.secondary' : 'text.primary'}>
                  ⏹️ {hasResult ? '✅ 已完成' : '⏳ 准备就绪'}
                </Typography>
              )}
            </Box>

            {isCapturing && <Typography variant="h5">{formatTime(captureTime)}</Typography>}
          </CardContent>
        </Card>

        <Box sx={{ width: '100%', maxWidth: 400, margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color={isCapturing ? 'secondary' : 'primary'}
            size="large"
            startIcon={isCapturing ? <Stop /> : <PlayArrow />}
            onClick={handleCaptureToggle}
            disabled={isCapturing && !isSensorInitialized} // 初始化过程中禁用按钮
            sx={{ height: 60, width: '100%', fontSize: '1.2rem', borderRadius: 3 }}
          >
            {isCapturing ? '停止捕获' : '开始捕获'}
          </Button>
        </Box>

        {hasResult && (
          <Card sx={{ width: '100%', maxWidth: 400, margin: '16px 0' }}>
            <CardContent>
              <Typography variant="h6">捕获完成</Typography>
              <Typography>时长: {formatTime(captureTime)}</Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudDownload />}
                  onClick={handleDownload}
                >
                  📥 下载数据
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </ThemeProvider>
  );
}