export type MaintenanceItem = {
  id: string;
  room_id: string;
  reported_by?: string | null;
  status: string;
  description: string;
  started_at?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type HousekeepingTask = {
  id: string;
  room_id: string;
  assigned_to?: string | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};
