export type ActiveTab = 'overview' | 'ai-monitor' | 'feeding-log' | 'scheduler' | 'hardware';

export interface NotificationItem {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  timestamp: string;
  source_table: string;
  source_id: string | number;
}

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
  feeding_time: string;
  active_days: string[];
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
