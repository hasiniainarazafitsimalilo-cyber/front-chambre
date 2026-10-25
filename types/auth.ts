export type UserRole = "ADMIN" | "RECEPTIONIST" | "CLIENT";

export type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  /** ID du profil client associé (null si pas encore créé) */
  client_id?: string | null;
};

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  country?: string;
  address?: string;
  id_document_type?: string;
  id_document_number?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};
