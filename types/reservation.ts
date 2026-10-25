export type AvailabilityRoom = {
  id: string;
  room_number: string;
  status: string;
  floor?: number | null;
  image_url?: string | null;
  images?: string[];
  room_type?: {
    name: string;
    base_price: number;
    max_adults: number;
    max_children: number;
    max_occupants: number;
    image_url?: string | null;
  } | null;
};

export type ReservationPayload = {
  client_id: string;
  room_ids: string[];
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children?: number;
  special_requests?: string;
};

export type DashboardOverview = {
  total_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  maintenance_rooms: number;
  reservations_today: number;
  check_ins_today: number;
  check_outs_today: number;
  clients: number;
  revenue: number;
};

export type RevenueSummary = {
  from_date: string;
  to_date: string;
  revenue: number;
};

export type OccupancySummary = {
  from_date: string;
  to_date: string;
  occupancy_rate: number;
};

export type ReservationSummary = {
  id: string;
  reference: string;
  client_id: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  children: number;
  status: string;
  special_requests?: string | null;
  total_amount: number;
  created_at?: string;
};
