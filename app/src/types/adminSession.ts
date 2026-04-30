export interface AdminSessionRow {
  id: string;
  deviceLabel: string;
  ip: string;
  lastSeen: string;
  current?: boolean;
}
