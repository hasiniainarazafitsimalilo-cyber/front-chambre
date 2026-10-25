export type RoomTypeSummary = {
  id: string;
  name: string;
  description?: string | null;
  base_price: number;
  max_adults: number;
  max_children: number;
  max_occupants: number;
  image_url?: string | null;
};

export type AmenitySummary = {
  id: string;
  name: string;
  description?: string | null;
};

export type RoomSummary = {
  id: string;
  room_number: string;
  room_type_id: string;
  floor?: number | null;
  status: string;
  description?: string | null;
  image_url?: string | null;
  images?: string[];
  room_type?: RoomTypeSummary;
  amenities?: AmenitySummary[];
};

export type ClientSummary = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
};
