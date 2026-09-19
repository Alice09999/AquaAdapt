export type ActiveTab = 'overview' | 'ai-monitor' | 'feeding-log' | 'scheduler' | 'hardware';

export interface FeedingRecord {
  id: string;
  timestamp: string;
  aiDecision: 'Hungry' | 'FULL';
  status: 'ON' | 'OFF';
}

export interface ScheduleProtocol {
  id: string;
  type: 'Interval Tetap' | 'Berbasis AI';
  status: 'ONLINE' | 'SIAGA' | 'OFFLINE';
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
