import { useState } from 'react';
import {
    Box,
    Typography,
    Collapse,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Button,
    Divider,
    IconButton
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';

export interface SensorSettings {
    frequency: number;
    removeGravity: boolean;
}

interface SettingsPanelProps {
    settings: SensorSettings;
    onSettingsChange: (newSettings: SensorSettings) => void;
}

// 默认设置值
export const DEFAULT_SETTINGS: SensorSettings = {
    frequency: 60,
    removeGravity: false,
};

export default function SettingsPanel({
    settings,
    onSettingsChange
}: SettingsPanelProps) {
    const [expanded, setExpanded] = useState(false);
    const [localSettings, setLocalSettings] = useState<SensorSettings>(settings);

    const handleSettingChange = <K extends keyof SensorSettings>(
        key: K,
        value: SensorSettings[K]
    ) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleApply = () => {
        onSettingsChange(localSettings);
        setExpanded(false);
    };

    return (
        <Box sx={{
            width: '100%',
            border: '1px solid #ddd',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 2
        }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Typography variant="h6">采集设置</Typography>
                <IconButton size="small">
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box sx={{ p: 2 }}>
                    {/* 频率设置 */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>采样频率</InputLabel>
                        <Select
                            value={localSettings.frequency}
                            label="采样频率"
                            onChange={(e) => handleSettingChange('frequency', Number(e.target.value))}
                        >
                            <MenuItem value={30}>30 Hz</MenuItem>
                            <MenuItem value={60}>60 Hz</MenuItem>
                            <MenuItem value={100}>100 Hz</MenuItem>
                            <MenuItem value={200}>200 Hz</MenuItem>
                        </Select>
                    </FormControl>

                    {/* 重力设置 */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={localSettings.removeGravity}
                                onChange={(e) => handleSettingChange('removeGravity', e.target.checked)}
                            />
                        }
                        label="去除重力影响"
                        sx={{ mb: 2 }}
                    />

                    <Divider sx={{ my: 2 }} />

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleApply}
                    >
                        应用设置
                    </Button>
                </Box>
            </Collapse>
        </Box>
    );
}