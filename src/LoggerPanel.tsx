import { useState, useRef, useEffect } from "react";
import {
    Button,
    Card,
    CardContent,
    Typography,
    Box,
} from '@mui/material';

export default function LoggerPanel() {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLogOpen, setIsLogOpen] = useState(false);
    const logEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error
        };

        const interceptConsole = (method: keyof typeof originalConsole) => {
            return (...args: any[]) => {
                originalConsole[method](...args);
                const message = args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' ');
                setLogs(prev => [...prev, `${method.toUpperCase()}: ${message}`]);
            };
        };

        console.log = interceptConsole('log');
        console.warn = interceptConsole('warn');
        console.error = interceptConsole('error');

        return () => {
            console.log = originalConsole.log;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
        };
    }, []);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const clearLogs = () => setLogs([]);

    return (

        <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
            <Button
                variant="outlined"
                onClick={() => setIsLogOpen(!isLogOpen)}
                sx={{ mb: 1 }}
                fullWidth
            >
                {isLogOpen ? '隐藏日志' : '显示日志'} ({logs.length})
            </Button>

            {isLogOpen && (
                <Card sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <CardContent sx={{ p: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2">控制台日志</Typography>
                            <Button size="small" onClick={clearLogs} disabled={logs.length === 0}>
                                清空
                            </Button>
                        </Box>
                        <Box
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: 12,
                                backgroundColor: '#f5f5f5',
                                borderRadius: 1,
                                p: 1,
                                minHeight: 100,
                                textAlign: "left"
                            }}
                        >
                            {logs.length === 0 ? (
                                <Typography color="text.secondary" sx={{ fontStyle: 'italic', textAlign: "center" }}>
                                    暂无日志记录
                                </Typography>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} style={{
                                        marginBottom: 4,
                                        color: log.startsWith('ERROR:') ? '#d32f2f' :
                                            log.startsWith('WARN:') ? '#ffa000' : '#1976d2'
                                    }}>
                                        {log}
                                    </div>
                                ))
                            )}
                            <div ref={logEndRef} />
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
