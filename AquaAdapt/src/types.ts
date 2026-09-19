export type ActiveTab = 'overview' | 'ai-monitor' | 'feeding-log' | 'scheduler' | 'hardware';

export interface FeedingLogItem {
  id: number;
  device_id: string;
  device_name: string | null;
  ai_decision: 'Hungry' | 'FULL';
  motor_status: 'ON' | 'OFF';
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface FeedingScheduleItem {
  id: number;
  device_id: string;
  device_name: string | null;
  schedule_code: string;
  schedule_type: 'Interval Tetap' | 'Berbasis AI';
  feeding_time: string;
  active_days: string[];
  duration_seconds: number;
  intensity_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TerminalLog {
  timestamp: string;
  level: 'INFO' | 'PERINGATAN' | 'ERROR';
  message: string;
}

export interface EventLogItem {
  time: string;
  message: string;
  highlight?: boolean;
}
